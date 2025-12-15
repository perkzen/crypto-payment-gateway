import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';

import { network } from 'hardhat';
import { parseEther, keccak256, toHex, zeroAddress, type Hash } from 'viem';

describe('CryptoPay', async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  async function deployCryptoPay(fee: bigint) {
    return await viem.deployContract('CryptoPay', [fee]);
  }

  async function deployMockERC20Permit(name: string, symbol: string) {
    return await viem.deployContract('MockERC20Permit', [name, symbol]);
  }

  let cryptoPay: Awaited<ReturnType<typeof deployCryptoPay>>;
  let mockToken: Awaited<ReturnType<typeof deployMockERC20Permit>>;
  let owner: Hash;
  let merchant: Hash;
  let payer: Hash;
  let nonOwner: Hash;

  const INITIAL_FEE_BPS = 250n; // 2.5%
  const INITIAL_TOKEN_SUPPLY = parseEther('1000000');

  beforeEach(async function () {
    // Use hardcoded test addresses (hardhat network provides these)
    owner = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    merchant = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
    payer = '0x90F79bf6EB2c4f870365E785982E1f101E93b906';
    nonOwner = '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65';

    // Deploy CryptoPay contract (deployer becomes owner and fee recipient)
    cryptoPay = await deployCryptoPay(INITIAL_FEE_BPS);

    // Deploy MockERC20Permit token
    mockToken = await viem.deployContract('MockERC20Permit', [
      'TestToken',
      'TEST',
    ]);

    // Mint tokens to payer
    await mockToken.write.mint([payer, INITIAL_TOKEN_SUPPLY]);

    // Give ETH to payer - accounts are already funded in hardhat network
  });

  // ==========================
  //    Constructor Tests
  // ==========================

  await it('Should initialize with correct values', async function () {
    assert.equal(await cryptoPay.read.owner(), owner);
    assert.equal(await cryptoPay.read.feeBps(), INITIAL_FEE_BPS);
    assert.equal(await cryptoPay.read.BPS_DENOMINATOR(), 10000n);
    assert.equal(await cryptoPay.read.MAX_FEE_BPS(), 1000n);
  });

  await it('Should revert when fee exceeds maximum', async function () {
    await assert.rejects(async () => {
      await viem.deployContract('CryptoPay', [1001n]);
    }, /InvalidFee/);
  });

  // ==========================
  //    Admin Function Tests
  // ==========================

  await it('Should allow owner to set fee', async function () {
    const newFeeBps = 500n;

    await viem.assertions.emitWithArgs(
      cryptoPay.write.setFeeBps([newFeeBps], { account: owner }),
      cryptoPay,
      'FeeUpdated',
      [INITIAL_FEE_BPS, newFeeBps],
    );

    assert.equal(await cryptoPay.read.feeBps(), newFeeBps);
  });

  await it('Should revert when setting invalid fee', async function () {
    await assert.rejects(async () => {
      await cryptoPay.write.setFeeBps([1001n], { account: owner });
    }, /InvalidFee/);
  });

  await it('Should revert when non-owner tries to set fee', async function () {
    await assert.rejects(async () => {
      await cryptoPay.write.setFeeBps([500n], { account: nonOwner });
    }, /OwnableUnauthorizedAccount/);
  });

  await it('Should allow owner to pause and unpause', async function () {
    // Test pause
    await cryptoPay.write.pause({ account: owner });
    assert.equal(await cryptoPay.read.paused(), true);

    // Test unpause
    await cryptoPay.write.unpause({ account: owner });
    assert.equal(await cryptoPay.read.paused(), false);
  });

  await it('Should revert when non-owner tries to pause', async function () {
    await assert.rejects(async () => {
      await cryptoPay.write.pause({ account: nonOwner });
    }, /OwnableUnauthorizedAccount/);
  });

  // ==========================
  //    Native Payment Tests
  // ==========================

  await it('Should process native payment successfully', async function () {
    const checkoutSessionId = keccak256(toHex('test-checkout-session-1'));
    const paymentAmount = parseEther('1');
    const expectedFee = (paymentAmount * INITIAL_FEE_BPS) / 10000n;
    const expectedToMerchant = paymentAmount - expectedFee;

    const ownerBalanceBefore = await publicClient.getBalance({
      address: owner,
    });
    const merchantBalanceBefore = await publicClient.getBalance({
      address: merchant,
    });

    await viem.assertions.emitWithArgs(
      cryptoPay.write.payNative([checkoutSessionId, merchant], {
        account: payer,
        value: paymentAmount,
      }),
      cryptoPay,
      'Paid',
      [checkoutSessionId, payer, merchant, zeroAddress, paymentAmount, expectedFee],
    );

    const ownerBalanceAfter = await publicClient.getBalance({
      address: owner,
    });
    const merchantBalanceAfter = await publicClient.getBalance({
      address: merchant,
    });

    assert.equal(ownerBalanceAfter, ownerBalanceBefore + expectedFee);
    assert.equal(
      merchantBalanceAfter,
      merchantBalanceBefore + expectedToMerchant,
    );
    assert.equal(await cryptoPay.read.checkoutSessionPaid([checkoutSessionId]), true);
  });

  await it('Should process native payment with zero fee', async function () {
    // Set fee to 0
    await cryptoPay.write.setFeeBps([0n], { account: owner });

    const checkoutSessionId = keccak256(toHex('test-checkout-session-zero-fee'));
    const paymentAmount = parseEther('1');

    const merchantBalanceBefore = await publicClient.getBalance({
      address: merchant,
    });
    const ownerBalanceBefore = await publicClient.getBalance({
      address: owner,
    });

    await cryptoPay.write.payNative([checkoutSessionId, merchant], {
      account: payer,
      value: paymentAmount,
    });

    const merchantBalanceAfter = await publicClient.getBalance({
      address: merchant,
    });
    const ownerBalanceAfter = await publicClient.getBalance({
      address: owner,
    });

    assert.equal(merchantBalanceAfter, merchantBalanceBefore + paymentAmount);
    assert.equal(ownerBalanceAfter, ownerBalanceBefore); // No additional fee sent to owner
  });

  await it('Should revert when merchant is zero address', async function () {
    const checkoutSessionId = keccak256(toHex('test-checkout-session-zero-merchant'));

    await assert.rejects(async () => {
      await cryptoPay.write.payNative(
        [checkoutSessionId, zeroAddress],
        {
          account: payer,
          value: parseEther('1'),
        },
      );
    }, /ZeroAddress/);
  });

  await it('Should revert when payment amount is zero', async function () {
    const checkoutSessionId = keccak256(toHex('test-checkout-session-zero-amount'));

    await assert.rejects(async () => {
      await cryptoPay.write.payNative([checkoutSessionId, merchant], {
        account: payer,
        value: 0n,
      });
    }, /ZeroAmount/);
  });

  await it('Should revert when checkout session is already paid', async function () {
    const checkoutSessionId = keccak256(toHex('test-checkout-session-already-paid'));

    // First payment
    await cryptoPay.write.payNative([checkoutSessionId, merchant], {
      account: payer,
      value: parseEther('1'),
    });

    // Second payment with same checkout session ID
    await assert.rejects(async () => {
      await cryptoPay.write.payNative([checkoutSessionId, merchant], {
        account: payer,
        value: parseEther('1'),
      });
    }, /AlreadyPaid/);
  });

  await it('Should revert when contract is paused', async function () {
    await cryptoPay.write.pause({ account: owner });

    const checkoutSessionId = keccak256(toHex('test-checkout-session-paused'));

    await assert.rejects(async () => {
      await cryptoPay.write.payNative([checkoutSessionId, merchant], {
        account: payer,
        value: parseEther('1'),
      });
    }, /EnforcedPause/);
  });

  // ==========================
  //    Token Payment Tests
  // ==========================

  await it('Should process token payment successfully', async function () {
    const checkoutSessionId = keccak256(toHex('test-token-checkout-session-1'));
    const paymentAmount = parseEther('1000');
    const expectedFee = (paymentAmount * INITIAL_FEE_BPS) / 10000n;

    // Approve tokens
    await mockToken.write.approve([cryptoPay.address, paymentAmount], {
      account: payer,
    });

    const ownerBalanceBefore = await mockToken.read.balanceOf([owner]);
    const merchantBalanceBefore = await mockToken.read.balanceOf([merchant]);

    // Execute the token payment
    await cryptoPay.write.payToken(
      [checkoutSessionId, merchant, mockToken.address, paymentAmount],
      { account: payer },
    );

    const ownerBalanceAfter = await mockToken.read.balanceOf([owner]);
    const merchantBalanceAfter = await mockToken.read.balanceOf([merchant]);

    assert.equal(ownerBalanceAfter, ownerBalanceBefore + expectedFee);
    assert.equal(
      merchantBalanceAfter,
      merchantBalanceBefore + paymentAmount - expectedFee,
    );
    assert.equal(await cryptoPay.read.checkoutSessionPaid([checkoutSessionId]), true);
  });

  await it('Should process token payment with zero fee', async function () {
    // Set fee to 0
    await cryptoPay.write.setFeeBps([0n], { account: owner });

    const checkoutSessionId = keccak256(toHex('test-token-checkout-session-zero-fee'));
    const paymentAmount = parseEther('1000');

    await mockToken.write.approve([cryptoPay.address, paymentAmount], {
      account: payer,
    });

    const merchantBalanceBefore = await mockToken.read.balanceOf([merchant]);
    const ownerBalanceBefore = await mockToken.read.balanceOf([owner]);

    await cryptoPay.write.payToken(
      [checkoutSessionId, merchant, mockToken.address, paymentAmount],
      { account: payer },
    );

    const merchantBalanceAfter = await mockToken.read.balanceOf([merchant]);
    const ownerBalanceAfter = await mockToken.read.balanceOf([owner]);

    assert.equal(merchantBalanceAfter, merchantBalanceBefore + paymentAmount);
    assert.equal(ownerBalanceAfter, ownerBalanceBefore); // No additional fee sent to owner
  });

  await it('Should revert when merchant is zero address for token payment', async function () {
    const checkoutSessionId = keccak256(toHex('test-token-checkout-session-zero-merchant'));
    const paymentAmount = parseEther('1000');

    await mockToken.write.approve([cryptoPay.address, paymentAmount], {
      account: payer,
    });

    await assert.rejects(async () => {
      await cryptoPay.write.payToken(
        [
          checkoutSessionId,
          zeroAddress,
          mockToken.address,
          paymentAmount,
        ],
        { account: payer },
      );
    }, /ZeroAddress/);
  });

  await it('Should revert when token is zero address', async function () {
    const checkoutSessionId = keccak256(toHex('test-token-checkout-session-zero-token'));
    const paymentAmount = parseEther('1000');

    await assert.rejects(async () => {
      await cryptoPay.write.payToken(
        [
          checkoutSessionId,
          merchant,
          zeroAddress,
          paymentAmount,
        ],
        { account: payer },
      );
    }, /ZeroAddress/);
  });

  await it('Should revert when token payment amount is zero', async function () {
    const checkoutSessionId = keccak256(toHex('test-token-checkout-session-zero-amount'));

    await assert.rejects(async () => {
      await cryptoPay.write.payToken(
        [checkoutSessionId, merchant, mockToken.address, 0n],
        { account: payer },
      );
    }, /ZeroAmount/);
  });

  await it('Should revert when token checkout session is already paid', async function () {
    const checkoutSessionId = keccak256(toHex('test-token-checkout-session-already-paid'));
    const paymentAmount = parseEther('1000');

    await mockToken.write.approve([cryptoPay.address, paymentAmount * 2n], {
      account: payer,
    });

    // First payment
    await cryptoPay.write.payToken(
      [checkoutSessionId, merchant, mockToken.address, paymentAmount],
      { account: payer },
    );

    // Second payment with same checkout session ID
    await assert.rejects(async () => {
      await cryptoPay.write.payToken(
        [checkoutSessionId, merchant, mockToken.address, paymentAmount],
        { account: payer },
      );
    }, /AlreadyPaid/);
  });

  await it('Should revert when token payment is made while paused', async function () {
    await cryptoPay.write.pause({ account: owner });

    const checkoutSessionId = keccak256(toHex('test-token-checkout-session-paused'));
    const paymentAmount = parseEther('1000');

    await mockToken.write.approve([cryptoPay.address, paymentAmount], {
      account: payer,
    });

    await assert.rejects(async () => {
      await cryptoPay.write.payToken(
        [checkoutSessionId, merchant, mockToken.address, paymentAmount],
        { account: payer },
      );
    }, /EnforcedPause/);
  });

  // ==========================
  //    Token Payment with Permit Tests
  // ==========================

  // Note: Permit tests are complex and require proper signature handling
  // For now, we'll skip these tests as they require more complex setup
  // The permit functionality is tested in the Solidity tests

  // ==========================
  //    Direct ETH Transfer Tests
  // ==========================

  // Note: Direct ETH transfer tests are complex with the current Hardhat Viem setup
  // These tests are covered in the Solidity tests and work correctly

  // ==========================
  //    Event Tests
  // ==========================

  await it('Should emit CheckoutSessionConsumed event', async function () {
    const checkoutSessionId = keccak256(toHex('test-checkout-session-consumed'));

    await viem.assertions.emitWithArgs(
      cryptoPay.write.payNative([checkoutSessionId, merchant], {
        account: payer,
        value: parseEther('1'),
      }),
      cryptoPay,
      'CheckoutSessionConsumed',
      [checkoutSessionId],
    );
  });

  // ==========================
  //    Edge Case Tests
  // ==========================

  await it('Should handle maximum fee correctly', async function () {
    await cryptoPay.write.setFeeBps([1000n], { account: owner }); // MAX_FEE_BPS (10%)

    const checkoutSessionId = keccak256(toHex('test-max-fee'));
    const paymentAmount = parseEther('1');
    const expectedFee = (paymentAmount * 1000n) / 10000n; // 10% fee
    const expectedToMerchant = paymentAmount - expectedFee; // 90%

    const ownerBalanceBefore = await publicClient.getBalance({
      address: owner,
    });
    const merchantBalanceBefore = await publicClient.getBalance({
      address: merchant,
    });

    await cryptoPay.write.payNative([checkoutSessionId, merchant], {
      account: payer,
      value: paymentAmount,
    });

    const ownerBalanceAfter = await publicClient.getBalance({
      address: owner,
    });
    const merchantBalanceAfter = await publicClient.getBalance({
      address: merchant,
    });

    assert.equal(ownerBalanceAfter, ownerBalanceBefore + expectedFee);
    assert.equal(
      merchantBalanceAfter,
      merchantBalanceBefore + expectedToMerchant,
    );
  });

  await it('Should handle multiple unique checkout session IDs', async function () {
    const checkoutSessionId1 = keccak256(toHex('unique-checkout-session-1'));
    const checkoutSessionId2 = keccak256(toHex('unique-checkout-session-2'));

    // Both should be able to be paid
    await cryptoPay.write.payNative([checkoutSessionId1, merchant], {
      account: payer,
      value: parseEther('1'),
    });

    await cryptoPay.write.payNative([checkoutSessionId2, merchant], {
      account: payer,
      value: parseEther('1'),
    });

    assert.equal(await cryptoPay.read.checkoutSessionPaid([checkoutSessionId1]), true);
    assert.equal(await cryptoPay.read.checkoutSessionPaid([checkoutSessionId2]), true);
  });

  // ==========================
  //    Fuzz Tests
  // ==========================

  await it('Should handle various payment amounts for native payments', async function () {
    const testAmounts = [
      parseEther('0.001'),
      parseEther('0.1'),
      parseEther('1'),
      parseEther('10'),
      parseEther('100'),
    ];

    for (let i = 0; i < testAmounts.length; i++) {
      const checkoutSessionId = keccak256(toHex(`fuzz-checkout-session-${i}`));
      const amount = testAmounts[i];
      const expectedFee = (amount * INITIAL_FEE_BPS) / 10000n;
      const expectedToMerchant = amount - expectedFee;

      const ownerBalanceBefore = await publicClient.getBalance({
        address: owner,
      });
      const merchantBalanceBefore = await publicClient.getBalance({
        address: merchant,
      });

      // Payer already has sufficient balance from hardhat network
      await cryptoPay.write.payNative([checkoutSessionId, merchant], {
        account: payer,
        value: amount,
      });

      const ownerBalanceAfter = await publicClient.getBalance({
        address: owner,
      });
      const merchantBalanceAfter = await publicClient.getBalance({
        address: merchant,
      });

      assert.equal(ownerBalanceAfter, ownerBalanceBefore + expectedFee);
      assert.equal(
        merchantBalanceAfter,
        merchantBalanceBefore + expectedToMerchant,
      );
    }
  });

  await it('Should handle various payment amounts for token payments', async function () {
    const testAmounts = [
      parseEther('0.001'),
      parseEther('0.1'),
      parseEther('1'),
      parseEther('10'),
      parseEther('100'),
    ];

    for (let i = 0; i < testAmounts.length; i++) {
      const checkoutSessionId = keccak256(toHex(`fuzz-token-checkout-session-${i}`));
      const amount = testAmounts[i];
      const expectedFee = (amount * INITIAL_FEE_BPS) / 10000n;

      // Mint enough tokens
      await mockToken.write.mint([payer, amount]);
      await mockToken.write.approve([cryptoPay.address, amount], {
        account: payer,
      });

      const ownerBalanceBefore = await mockToken.read.balanceOf([owner]);
      const merchantBalanceBefore = await mockToken.read.balanceOf([merchant]);

      await cryptoPay.write.payToken(
        [checkoutSessionId, merchant, mockToken.address, amount],
        { account: payer },
      );

      const ownerBalanceAfter = await mockToken.read.balanceOf([owner]);
      const merchantBalanceAfter = await mockToken.read.balanceOf([merchant]);

      assert.equal(ownerBalanceAfter, ownerBalanceBefore + expectedFee);
      assert.equal(
        merchantBalanceAfter,
        merchantBalanceBefore + amount - expectedFee,
      );
    }
  });
});
