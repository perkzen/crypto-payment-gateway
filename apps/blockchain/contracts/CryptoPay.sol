// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IERC20Permit} from '@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {Pausable} from '@openzeppelin/contracts/utils/Pausable.sol';

/**
 * @title CryptoPay
 * @notice Non-custodial payment processor:
 *         - Immediately forwards native/token payments (no balances retained).
 *         - Emits events for off-chain reconciliation.
 *         - Enforces platform fee (bps) within a capped range.
 *         - Prevents double-spend per invoice via unique invoiceId.
 *
 * Security:
 *  - Uses checks-effects-interactions + ReentrancyGuard.
 *  - SafeERC20 for token transfers.
 *  - Pausable by owner for incident response.
 */
contract CryptoPay is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // --- Constants ---
    uint96 public constant BPS_DENOMINATOR = 10_000;
    uint96 public constant MAX_FEE_BPS = 1_000; // 10%

    // --- Config ---
    address public platform; // fee recipient
    uint96 public feeBps; // platform fee in basis points

    // --- Invoice replay protection ---
    mapping(bytes32 => bool) public invoicePaid; // invoiceId => consumed

    // --- Events ---
    event PaidNative(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed merchant,
        uint256 grossAmount,
        uint256 feeAmount
    );

    event PaidToken(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed merchant,
        address token,
        uint256 grossAmount,
        uint256 feeAmount
    );

    event PlatformUpdated(
        address indexed oldPlatform,
        address indexed newPlatform
    );
    event FeeUpdated(uint96 oldFeeBps, uint96 newFeeBps);
    event InvoiceConsumed(bytes32 indexed invoiceId);

    // --- Errors ---
    error InvalidFee();
    error ZeroAddress();
    error ZeroAmount();
    error AlreadyPaid();
    error TransferFailed();

    constructor(address _platform, uint96 _feeBps) Ownable(msg.sender) {
        if (_platform == address(0)) revert ZeroAddress();
        if (_feeBps > MAX_FEE_BPS) revert InvalidFee();
        platform = _platform;
        feeBps = _feeBps;
    }

    // ==========================
    //         Admin
    // ==========================

    function setPlatform(address _platform) external onlyOwner {
        if (_platform == address(0)) revert ZeroAddress();
        emit PlatformUpdated(platform, _platform);
        platform = _platform;
    }

    function setFeeBps(uint96 _feeBps) external onlyOwner {
        if (_feeBps > MAX_FEE_BPS) revert InvalidFee();
        emit FeeUpdated(feeBps, _feeBps);
        feeBps = _feeBps;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ==========================
    //        Payments
    // ==========================

    /**
     * @notice Pay with native coin (ETH/MATIC/etc.). Forwards immediately (no custody).
   * @param invoiceId Unique id for idempotency (cannot be reused).
   * @param merchant Recipient of the net proceeds.
   */
    function payNative(
        bytes32 invoiceId,
        address merchant
    ) external payable nonReentrant whenNotPaused {
        if (merchant == address(0)) revert ZeroAddress();
        if (msg.value == 0) revert ZeroAmount();
        if (invoicePaid[invoiceId]) revert AlreadyPaid();
        invoicePaid[invoiceId] = true;
        emit InvoiceConsumed(invoiceId);

        uint256 fee = (msg.value * feeBps) / BPS_DENOMINATOR;
        uint256 toMerchant = msg.value - fee;

        // Effects before interactions; then interactions.
        if (fee > 0) _sendNative(platform, fee);
        _sendNative(merchant, toMerchant);

        emit PaidNative(invoiceId, msg.sender, merchant, msg.value, fee);
    }

    /**
     * @notice Pay with ERC-20 using prior approve().
   * @param invoiceId Unique id for idempotency (cannot be reused).
   * @param merchant Recipient of net proceeds.
   * @param token ERC-20 token address.
   * @param amount Gross amount to be paid (token decimals respected).
   */
    function payToken(
        bytes32 invoiceId,
        address merchant,
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        if (merchant == address(0) || token == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (invoicePaid[invoiceId]) revert AlreadyPaid();
        invoicePaid[invoiceId] = true;
        emit InvoiceConsumed(invoiceId);

        uint256 fee = (amount * feeBps) / BPS_DENOMINATOR;
        uint256 toMerchant = amount - fee;

        // Pull and forward; contract holds nothing at end.
        IERC20 erc20 = IERC20(token);
        erc20.safeTransferFrom(msg.sender, merchant, toMerchant);
        if (fee > 0) {
            erc20.safeTransferFrom(msg.sender, platform, fee);
        }

        emit PaidToken(invoiceId, msg.sender, merchant, token, amount, fee);
    }

    /**
     * @notice Pay with ERC-20 using EIP-2612 permit in the same tx (avoids prior approve).
   * @dev Token must implement IERC20Permit.
   */
    function payTokenWithPermit(
        bytes32 invoiceId,
        address merchant,
        address token,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant whenNotPaused {
        if (merchant == address(0) || token == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (invoicePaid[invoiceId]) revert AlreadyPaid();
        invoicePaid[invoiceId] = true;
        emit InvoiceConsumed(invoiceId);

        // Give this contract allowance via permit, then pull.
        IERC20Permit(token).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );

        uint256 fee = (amount * feeBps) / BPS_DENOMINATOR;
        uint256 toMerchant = amount - fee;

        IERC20 erc20 = IERC20(token);
        erc20.safeTransferFrom(msg.sender, merchant, toMerchant);
        if (fee > 0) {
            erc20.safeTransferFrom(msg.sender, platform, fee);
        }

        emit PaidToken(invoiceId, msg.sender, merchant, token, amount, fee);
    }

    // ==========================
    //       Internal utils
    // ==========================

    function _sendNative(address to, uint256 amount) internal {
        (bool ok,) = to.call{value: amount}('');
        if (!ok) revert TransferFailed();
    }

    // Reject stray ETH; only accept via payNative
    receive() external payable {
        revert('Direct receive disabled');
    }

    fallback() external payable {
        revert('Fallback disabled');
    }
}
