import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';

import { network } from 'hardhat';
import { parseEther, keccak256, toHex, type Hash } from 'viem';

describe('CryptoPay', async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  async function deployCryptoPay(platform: Hash, fee: bigint) {
    return await viem.deployContract('CryptoPay', [platform, fee]);
  }

  async function deployMockERC20Permit(name: string, symbol: string) {
    return await viem.deployContract('MockERC20Permit', [name, symbol]);
  }

  let cryptoPay: Awaited<ReturnType<typeof deployCryptoPay>>;
  let mockToken: Awaited<ReturnType<typeof deployMockERC20Permit>>;
  let owner: Hash;
  let platform: Hash;
  let merchant: Hash;
  let payer: Hash;
  let nonOwner: Hash;

  const INITIAL_FEE_BPS = 250n; // 2.5%
  const INITIAL_TOKEN_SUPPLY = parseEther('1000000');

  beforeEach(async function () {
    // Use hardcoded test addresses (hardhat network provides these)
    owner = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    platform = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    merchant = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
    payer = '0x90F79bf6EB2c4f870365E785982E1f101E93b906';
    nonOwner = '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65';

    // Deploy CryptoPay contract
    cryptoPay = await deployCryptoPay(platform, INITIAL_FEE_BPS);

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
    assert.equal(await cryptoPay.read.platform(), platform);
    assert.equal(await cryptoPay.read.feeBps(), INITIAL_FEE_BPS);
    assert.equal(await cryptoPay.read.BPS_DENOMINATOR(), 10000n);
    assert.equal(await cryptoPay.read.MAX_FEE_BPS(), 1000n);
  });

  await it('Should revert when platform is zero address', async function () {
    await assert.rejects(async () => {
      await viem.deployContract('CryptoPay', [
        '0x0000000000000000000000000000000000000000',
        INITIAL_FEE_BPS,
      ]);
    }, /ZeroAddress/);
  });

  await it('Should revert when fee exceeds maximum', async function () {
    await assert.rejects(async () => {
      await viem.deployContract('CryptoPay', [platform, 1001n]);
    }, /InvalidFee/);
  });

  // ==========================
  //    Admin Function Tests
  // ==========================

  await it('Should allow owner to set platform', async function () {
    const newPlatform = '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc';

    await viem.assertions.emitWithArgs(
      cryptoPay.write.setPlatform([newPlatform], { account: owner }),
      cryptoPay,
      'PlatformUpdated',
      [platform, newPlatform],
    );

    assert.equal(await cryptoPay.read.platform(), newPlatform);
  });

  await it('Should revert when setting platform to zero address', async function () {
    await assert.rejects(async () => {
      await cryptoPay.write.setPlatform(
        ['0x0000000000000000000000000000000000000000'],
        { account: owner },
      );
    }, /ZeroAddress/);
  });

  await it('Should revert when non-owner tries to set platform', async function () {
    const newPlatform = '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc';
    await assert.rejects(async () => {
      await cryptoPay.write.setPlatform([newPlatform], { account: nonOwner });
    }, /OwnableUnauthorizedAccount/);
  });

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
    const invoiceId = keccak256(toHex('test-invoice-1'));
    const paymentAmount = parseEther('1');
    const expectedFee = (paymentAmount * INITIAL_FEE_BPS) / 10000n;
    const expectedToMerchant = paymentAmount - expectedFee;

    const platformBalanceBefore = await publicClient.getBalance({
      address: platform,
    });
    const merchantBalanceBefore = await publicClient.getBalance({
      address: merchant,
    });

    await viem.assertions.emitWithArgs(
      cryptoPay.write.payNative([invoiceId, merchant], {
        account: payer,
        value: paymentAmount,
      }),
      cryptoPay,
      'PaidNative',
      [invoiceId, payer, merchant, paymentAmount, expectedFee],
    );

    const platformBalanceAfter = await publicClient.getBalance({
      address: platform,
    });
    const merchantBalanceAfter = await publicClient.getBalance({
      address: merchant,
    });

    assert.equal(platformBalanceAfter, platformBalanceBefore + expectedFee);
    assert.equal(
      merchantBalanceAfter,
      merchantBalanceBefore + expectedToMerchant,
    );
    assert.equal(await cryptoPay.read.invoicePaid([invoiceId]), true);
  });

  await it('Should process native payment with zero fee', async function () {
    // Set fee to 0
    await cryptoPay.write.setFeeBps([0n], { account: owner });

    const invoiceId = keccak256(toHex('test-invoice-zero-fee'));
    const paymentAmount = parseEther('1');

    const merchantBalanceBefore = await publicClient.getBalance({
      address: merchant,
    });
    const platformBalanceBefore = await publicClient.getBalance({
      address: platform,
    });

    await cryptoPay.write.payNative([invoiceId, merchant], {
      account: payer,
      value: paymentAmount,
    });

    const merchantBalanceAfter = await publicClient.getBalance({
      address: merchant,
    });
    const platformBalanceAfter = await publicClient.getBalance({
      address: platform,
    });

    assert.equal(merchantBalanceAfter, merchantBalanceBefore + paymentAmount);
    assert.equal(platformBalanceAfter, platformBalanceBefore); // No additional fee sent to platform
  });

  await it('Should revert when merchant is zero address', async function () {
    const invoiceId = keccak256(toHex('test-invoice-zero-merchant'));

    await assert.rejects(async () => {
      await cryptoPay.write.payNative(
        [invoiceId, '0x0000000000000000000000000000000000000000'],
        {
          account: payer,
          value: parseEther('1'),
        },
      );
    }, /ZeroAddress/);
  });

  await it('Should revert when payment amount is zero', async function () {
    const invoiceId = keccak256(toHex('test-invoice-zero-amount'));

    await assert.rejects(async () => {
      await cryptoPay.write.payNative([invoiceId, merchant], {
        account: payer,
        value: 0n,
      });
    }, /ZeroAmount/);
  });

  await it('Should revert when invoice is already paid', async function () {
    const invoiceId = keccak256(toHex('test-invoice-already-paid'));

    // First payment
    await cryptoPay.write.payNative([invoiceId, merchant], {
      account: payer,
      value: parseEther('1'),
    });

    // Second payment with same invoice ID
    await assert.rejects(async () => {
      await cryptoPay.write.payNative([invoiceId, merchant], {
        account: payer,
        value: parseEther('1'),
      });
    }, /AlreadyPaid/);
  });

  await it('Should revert when contract is paused', async function () {
    await cryptoPay.write.pause({ account: owner });

    const invoiceId = keccak256(toHex('test-invoice-paused'));

    await assert.rejects(async () => {
      await cryptoPay.write.payNative([invoiceId, merchant], {
        account: payer,
        value: parseEther('1'),
      });
    }, /EnforcedPause/);
  });

  // ==========================
  //    Token Payment Tests
  // ==========================

  await it('Should process token payment successfully', async function () {
    const invoiceId = keccak256(toHex('test-token-invoice-1'));
    const paymentAmount = parseEther('1000');
    const expectedFee = (paymentAmount * INITIAL_FEE_BPS) / 10000n;

    // Approve tokens
    await mockToken.write.approve([cryptoPay.address, paymentAmount], {
      account: payer,
    });

    const platformBalanceBefore = await mockToken.read.balanceOf([platform]);
    const merchantBalanceBefore = await mockToken.read.balanceOf([merchant]);

    // Execute the token payment
    await cryptoPay.write.payToken(
      [invoiceId, merchant, mockToken.address, paymentAmount],
      { account: payer },
    );

    const platformBalanceAfter = await mockToken.read.balanceOf([platform]);
    const merchantBalanceAfter = await mockToken.read.balanceOf([merchant]);

    assert.equal(platformBalanceAfter, platformBalanceBefore + expectedFee);
    assert.equal(
      merchantBalanceAfter,
      merchantBalanceBefore + paymentAmount - expectedFee,
    );
    assert.equal(await cryptoPay.read.invoicePaid([invoiceId]), true);
  });

  await it('Should process token payment with zero fee', async function () {
    // Set fee to 0
    await cryptoPay.write.setFeeBps([0n], { account: owner });

    const invoiceId = keccak256(toHex('test-token-invoice-zero-fee'));
    const paymentAmount = parseEther('1000');

    await mockToken.write.approve([cryptoPay.address, paymentAmount], {
      account: payer,
    });

    const merchantBalanceBefore = await mockToken.read.balanceOf([merchant]);
    const platformBalanceBefore = await mockToken.read.balanceOf([platform]);

    await cryptoPay.write.payToken(
      [invoiceId, merchant, mockToken.address, paymentAmount],
      { account: payer },
    );

    const merchantBalanceAfter = await mockToken.read.balanceOf([merchant]);
    const platformBalanceAfter = await mockToken.read.balanceOf([platform]);

    assert.equal(merchantBalanceAfter, merchantBalanceBefore + paymentAmount);
    assert.equal(platformBalanceAfter, platformBalanceBefore); // No additional fee sent to platform
  });

  await it('Should revert when merchant is zero address for token payment', async function () {
    const invoiceId = keccak256(toHex('test-token-invoice-zero-merchant'));
    const paymentAmount = parseEther('1000');

    await mockToken.write.approve([cryptoPay.address, paymentAmount], {
      account: payer,
    });

    await assert.rejects(async () => {
      await cryptoPay.write.payToken(
        [
          invoiceId,
          '0x0000000000000000000000000000000000000000',
          mockToken.address,
          paymentAmount,
        ],
        { account: payer },
      );
    }, /ZeroAddress/);
  });

  await it('Should revert when token is zero address', async function () {
    const invoiceId = keccak256(toHex('test-token-invoice-zero-token'));
    const paymentAmount = parseEther('1000');

    await assert.rejects(async () => {
      await cryptoPay.write.payToken(
        [
          invoiceId,
          merchant,
          '0x0000000000000000000000000000000000000000',
          paymentAmount,
        ],
        { account: payer },
      );
    }, /ZeroAddress/);
  });

  await it('Should revert when token payment amount is zero', async function () {
    const invoiceId = keccak256(toHex('test-token-invoice-zero-amount'));

    await assert.rejects(async () => {
      await cryptoPay.write.payToken(
        [invoiceId, merchant, mockToken.address, 0n],
        { account: payer },
      );
    }, /ZeroAmount/);
  });

  await it('Should revert when token invoice is already paid', async function () {
    const invoiceId = keccak256(toHex('test-token-invoice-already-paid'));
    const paymentAmount = parseEther('1000');

    await mockToken.write.approve([cryptoPay.address, paymentAmount * 2n], {
      account: payer,
    });

    // First payment
    await cryptoPay.write.payToken(
      [invoiceId, merchant, mockToken.address, paymentAmount],
      { account: payer },
    );

    // Second payment with same invoice ID
    await assert.rejects(async () => {
      await cryptoPay.write.payToken(
        [invoiceId, merchant, mockToken.address, paymentAmount],
        { account: payer },
      );
    }, /AlreadyPaid/);
  });

  await it('Should revert when token payment is made while paused', async function () {
    await cryptoPay.write.pause({ account: owner });

    const invoiceId = keccak256(toHex('test-token-invoice-paused'));
    const paymentAmount = parseEther('1000');

    await mockToken.write.approve([cryptoPay.address, paymentAmount], {
      account: payer,
    });

    await assert.rejects(async () => {
      await cryptoPay.write.payToken(
        [invoiceId, merchant, mockToken.address, paymentAmount],
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

  await it('Should emit InvoiceConsumed event', async function () {
    const invoiceId = keccak256(toHex('test-invoice-consumed'));

    await viem.assertions.emitWithArgs(
      cryptoPay.write.payNative([invoiceId, merchant], {
        account: payer,
        value: parseEther('1'),
      }),
      cryptoPay,
      'InvoiceConsumed',
      [invoiceId],
    );
  });

  // ==========================
  //    Edge Case Tests
  // ==========================

  await it('Should handle maximum fee correctly', async function () {
    await cryptoPay.write.setFeeBps([1000n], { account: owner }); // MAX_FEE_BPS (10%)

    const invoiceId = keccak256(toHex('test-max-fee'));
    const paymentAmount = parseEther('1');
    const expectedFee = (paymentAmount * 1000n) / 10000n; // 10% fee
    const expectedToMerchant = paymentAmount - expectedFee; // 90%

    const platformBalanceBefore = await publicClient.getBalance({
      address: platform,
    });
    const merchantBalanceBefore = await publicClient.getBalance({
      address: merchant,
    });

    await cryptoPay.write.payNative([invoiceId, merchant], {
      account: payer,
      value: paymentAmount,
    });

    const platformBalanceAfter = await publicClient.getBalance({
      address: platform,
    });
    const merchantBalanceAfter = await publicClient.getBalance({
      address: merchant,
    });

    assert.equal(platformBalanceAfter, platformBalanceBefore + expectedFee);
    assert.equal(
      merchantBalanceAfter,
      merchantBalanceBefore + expectedToMerchant,
    );
  });

  await it('Should handle multiple unique invoice IDs', async function () {
    const invoiceId1 = keccak256(toHex('unique-invoice-1'));
    const invoiceId2 = keccak256(toHex('unique-invoice-2'));

    // Both should be able to be paid
    await cryptoPay.write.payNative([invoiceId1, merchant], {
      account: payer,
      value: parseEther('1'),
    });

    await cryptoPay.write.payNative([invoiceId2, merchant], {
      account: payer,
      value: parseEther('1'),
    });

    assert.equal(await cryptoPay.read.invoicePaid([invoiceId1]), true);
    assert.equal(await cryptoPay.read.invoicePaid([invoiceId2]), true);
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
      const invoiceId = keccak256(toHex(`fuzz-invoice-${i}`));
      const amount = testAmounts[i];
      const expectedFee = (amount * INITIAL_FEE_BPS) / 10000n;
      const expectedToMerchant = amount - expectedFee;

      const platformBalanceBefore = await publicClient.getBalance({
        address: platform,
      });
      const merchantBalanceBefore = await publicClient.getBalance({
        address: merchant,
      });

      // Payer already has sufficient balance from hardhat network
      await cryptoPay.write.payNative([invoiceId, merchant], {
        account: payer,
        value: amount,
      });

      const platformBalanceAfter = await publicClient.getBalance({
        address: platform,
      });
      const merchantBalanceAfter = await publicClient.getBalance({
        address: merchant,
      });

      assert.equal(platformBalanceAfter, platformBalanceBefore + expectedFee);
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
      const invoiceId = keccak256(toHex(`fuzz-token-invoice-${i}`));
      const amount = testAmounts[i];
      const expectedFee = (amount * INITIAL_FEE_BPS) / 10000n;

      // Mint enough tokens
      await mockToken.write.mint([payer, amount]);
      await mockToken.write.approve([cryptoPay.address, amount], {
        account: payer,
      });

      const platformBalanceBefore = await mockToken.read.balanceOf([platform]);
      const merchantBalanceBefore = await mockToken.read.balanceOf([merchant]);

      await cryptoPay.write.payToken(
        [invoiceId, merchant, mockToken.address, amount],
        { account: payer },
      );

      const platformBalanceAfter = await mockToken.read.balanceOf([platform]);
      const merchantBalanceAfter = await mockToken.read.balanceOf([merchant]);

      assert.equal(platformBalanceAfter, platformBalanceBefore + expectedFee);
      assert.equal(
        merchantBalanceAfter,
        merchantBalanceBefore + amount - expectedFee,
      );
    }
  });
});
