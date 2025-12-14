import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CryptoPay
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cryptoPayAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_feeBps', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AlreadyPaid' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidFee' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'checkoutSessionId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'CheckoutSessionConsumed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldFeeBps',
        internalType: 'uint96',
        type: 'uint96',
        indexed: false,
      },
      {
        name: 'newFeeBps',
        internalType: 'uint96',
        type: 'uint96',
        indexed: false,
      },
    ],
    name: 'FeeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'checkoutSessionId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'payer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'merchant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'grossAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'feeAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Paid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'BPS_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_FEE_BPS',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'checkoutSessionPaid',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeBps',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'checkoutSessionId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'merchant', internalType: 'address', type: 'address' },
    ],
    name: 'payNative',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'checkoutSessionId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'merchant', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'payToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'checkoutSessionId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'merchant', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'payTokenWithPermit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_feeBps', internalType: 'uint96', type: 'uint96' }],
    name: 'setFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPayAbi}__
 */
export const useReadCryptoPay = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPayAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"BPS_DENOMINATOR"`
 */
export const useReadCryptoPayBpsDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: cryptoPayAbi,
    functionName: 'BPS_DENOMINATOR',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"MAX_FEE_BPS"`
 */
export const useReadCryptoPayMaxFeeBps = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPayAbi,
  functionName: 'MAX_FEE_BPS',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"checkoutSessionPaid"`
 */
export const useReadCryptoPayCheckoutSessionPaid =
  /*#__PURE__*/ createUseReadContract({
    abi: cryptoPayAbi,
    functionName: 'checkoutSessionPaid',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"feeBps"`
 */
export const useReadCryptoPayFeeBps = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPayAbi,
  functionName: 'feeBps',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"owner"`
 */
export const useReadCryptoPayOwner = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPayAbi,
  functionName: 'owner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"paused"`
 */
export const useReadCryptoPayPaused = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPayAbi,
  functionName: 'paused',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPayAbi}__
 */
export const useWriteCryptoPay = /*#__PURE__*/ createUseWriteContract({
  abi: cryptoPayAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteCryptoPayPause = /*#__PURE__*/ createUseWriteContract({
  abi: cryptoPayAbi,
  functionName: 'pause',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"payNative"`
 */
export const useWriteCryptoPayPayNative = /*#__PURE__*/ createUseWriteContract({
  abi: cryptoPayAbi,
  functionName: 'payNative',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"payToken"`
 */
export const useWriteCryptoPayPayToken = /*#__PURE__*/ createUseWriteContract({
  abi: cryptoPayAbi,
  functionName: 'payToken',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"payTokenWithPermit"`
 */
export const useWriteCryptoPayPayTokenWithPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: cryptoPayAbi,
    functionName: 'payTokenWithPermit',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteCryptoPayRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: cryptoPayAbi,
    functionName: 'renounceOwnership',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"setFeeBps"`
 */
export const useWriteCryptoPaySetFeeBps = /*#__PURE__*/ createUseWriteContract({
  abi: cryptoPayAbi,
  functionName: 'setFeeBps',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteCryptoPayTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: cryptoPayAbi,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteCryptoPayUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: cryptoPayAbi,
  functionName: 'unpause',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPayAbi}__
 */
export const useSimulateCryptoPay = /*#__PURE__*/ createUseSimulateContract({
  abi: cryptoPayAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateCryptoPayPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPayAbi,
    functionName: 'pause',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"payNative"`
 */
export const useSimulateCryptoPayPayNative =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPayAbi,
    functionName: 'payNative',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"payToken"`
 */
export const useSimulateCryptoPayPayToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPayAbi,
    functionName: 'payToken',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"payTokenWithPermit"`
 */
export const useSimulateCryptoPayPayTokenWithPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPayAbi,
    functionName: 'payTokenWithPermit',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateCryptoPayRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPayAbi,
    functionName: 'renounceOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"setFeeBps"`
 */
export const useSimulateCryptoPaySetFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPayAbi,
    functionName: 'setFeeBps',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateCryptoPayTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPayAbi,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPayAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateCryptoPayUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPayAbi,
    functionName: 'unpause',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPayAbi}__
 */
export const useWatchCryptoPayEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: cryptoPayAbi },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPayAbi}__ and `eventName` set to `"CheckoutSessionConsumed"`
 */
export const useWatchCryptoPayCheckoutSessionConsumedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cryptoPayAbi,
    eventName: 'CheckoutSessionConsumed',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPayAbi}__ and `eventName` set to `"FeeUpdated"`
 */
export const useWatchCryptoPayFeeUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cryptoPayAbi,
    eventName: 'FeeUpdated',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPayAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchCryptoPayOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cryptoPayAbi,
    eventName: 'OwnershipTransferred',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPayAbi}__ and `eventName` set to `"Paid"`
 */
export const useWatchCryptoPayPaidEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cryptoPayAbi,
    eventName: 'Paid',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPayAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchCryptoPayPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cryptoPayAbi,
    eventName: 'Paused',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPayAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchCryptoPayUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cryptoPayAbi,
    eventName: 'Unpaused',
  });
