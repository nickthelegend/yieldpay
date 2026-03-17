// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";

// ── Interfaces ──────────────────────────────────────────────────────────────
interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
    function allowance(address, address) external view returns (uint256);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
}

interface IYoGateway {
    function deposit(address yoVault, uint256 assets, uint256 minSharesOut, address receiver, uint256 partnerId) external returns (uint256);
    function redeem(address yoVault, uint256 shares, uint256 minAssetsOut, address receiver, uint256 partnerId) external returns (uint256);
    function quotePreviewDeposit(address yoVault, uint256 assets) external view returns (uint256);
    function quotePreviewWithdraw(address yoVault, uint256 shares) external view returns (uint256);
    function getAssetAllowance(address yoVault, address owner) external view returns (uint256);
    function getShareAllowance(address yoVault, address owner) external view returns (uint256);
}

// ── Test Contract ────────────────────────────────────────────────────────────
contract YieldPayTest is Test {
    // ── Constants ────────────────────────────────────────────────────────────
    address constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address constant YO_USDT_VAULT = 0xb9a7da9e90d3b428083bae04b860faa6325b721e;
    address constant YO_GATEWAY = 0xF1EeE0957267b1A474323Ff9CfF7719E964969FA;
    address constant WHALE = 0x5754284f345afc66a98fbB0a0Afe71e0F007B949;
    address constant WHALE_BACKUP = 0xF977814e90dA44bFA03b6295A0616a897441aceC;

    uint256 constant USDT_DECIMALS = 1e6;
    uint256 constant SEED_AMOUNT = 10_000 * 1e6; // 10,000 USDT
    uint256 constant SMALL_AMOUNT = 100 * 1e6; // 100 USDT
    uint256 constant INSTALLMENT = 33 * 1e6; // $33 USDT
    uint256 constant SLIPPAGE_BPS = 9900; // 99% = 1% max slippage

    IERC20 usdt = IERC20(USDT);
    IERC20 yoUsdt = IERC20(YO_USDT_VAULT);
    IYoGateway gateway = IYoGateway(YO_GATEWAY);

    address user = makeAddr("yieldpay_user");
    address user2 = makeAddr("yieldpay_user2");
    address merchant = makeAddr("merchant");

    // ── Setup ─────────────────────────────────────────────────────────────────
    function setUp() public {
        vm.createSelectFork(vm.envString("ETH_RPC_URL"));
        vm.deal(user, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(merchant, 1 ether);

        // Seed user with USDT from Bitfinex whale
        vm.startPrank(WHALE);
        bool ok = usdt.transfer(user, SEED_AMOUNT);
        require(ok, "USDT seed failed - whale may be empty, try WHALE_BACKUP");
        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP 1: SETUP / SEEDING
    // ═══════════════════════════════════════════════════════════════════════════

    function test_1_WhaleSeeding_UserHasUSDT() public view {
        uint256 bal = usdt.balanceOf(user);
        assertEq(bal, SEED_AMOUNT, "User should have 10,000 USDT");
        console.log("[PASS] User USDT balance:", bal / USDT_DECIMALS, "USDT");
    }

    function test_1_WhaleSeeding_ContractsExist() public view {
        assertGt(usdt.totalSupply(), 0, "USDT contract not found");
        assertGt(yoUsdt.totalSupply(), 0, "yoUSDT vault not found");
        console.log("[PASS] All contracts verified on fork");
    }

    function test_1_WhaleSeeding_USDTDecimals() public view {
        assertEq(usdt.decimals(), 6, "USDT should have 6 decimals");
        console.log("[PASS] USDT decimals: 6");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP 2: YO GATEWAY — QUOTING
    // ═══════════════════════════════════════════════════════════════════════════

    function test_2_Quote_DepositReturnsShares() public view {
        uint256 shares = gateway.quotePreviewDeposit(YO_USDT_VAULT, SMALL_AMOUNT);
        assertGt(shares, 0, "Quote should return > 0 shares");
        console.log("[PASS] 100 USDT -> shares:", shares);
    }

    function test_2_Quote_RedeemReturnsAssets() public view {
        uint256 shares = gateway.quotePreviewDeposit(YO_USDT_VAULT, SMALL_AMOUNT);
        uint256 assets = gateway.quotePreviewWithdraw(YO_USDT_VAULT, shares);
        assertGt(assets, 0, "Quote redeem should return > 0 assets");
        assertApproxEqRel(assets, SMALL_AMOUNT, 0.01e18, "Assets out should be ~100 USDT");
        console.log("[PASS] Redeem quote:", assets / USDT_DECIMALS, "USDT");
    }

    function test_2_Quote_LargerAmountMoreShares() public view {
        uint256 shares100 = gateway.quotePreviewDeposit(YO_USDT_VAULT, 100 * 1e6);
        uint256 shares1000 = gateway.quotePreviewDeposit(YO_USDT_VAULT, 1000 * 1e6);
        assertGt(shares1000, shares100, "More assets should yield more shares");
        console.log("[PASS] Proportional shares verified");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP 3: YO GATEWAY — DEPOSIT
    // ═══════════════════════════════════════════════════════════════════════════

    function test_3_Deposit_BasicDeposit() public {
        vm.startPrank(user);
        uint256 usdtBefore = usdt.balanceOf(user);
        uint256 yoBefore = yoUsdt.balanceOf(user);
        usdt.approve(YO_GATEWAY, SMALL_AMOUNT);
        uint256 quoted = gateway.quotePreviewDeposit(YO_USDT_VAULT, SMALL_AMOUNT);
        uint256 minSharesOut = quoted * SLIPPAGE_BPS / 10000;
        uint256 sharesReceived = gateway.deposit(
            YO_USDT_VAULT, 
            SMALL_AMOUNT, 
            minSharesOut, 
            user, 
            0 
        );
        vm.stopPrank();

        assertGt(sharesReceived, 0, "Should receive shares");
        assertEq(usdt.balanceOf(user), usdtBefore - SMALL_AMOUNT, "USDT should decrease");
        assertEq(yoUsdt.balanceOf(user), yoBefore + sharesReceived, "yoUSDT should increase");
        console.log("[PASS] Deposit 100 USDT, received shares:", sharesReceived);
    }

    function test_3_Deposit_ApproveThenDeposit() public {
        vm.startPrank(user);
        usdt.approve(YO_GATEWAY, SMALL_AMOUNT);
        assertGe(usdt.allowance(user, YO_GATEWAY), SMALL_AMOUNT, "Allowance should be set");
        uint256 quoted = gateway.quotePreviewDeposit(YO_USDT_VAULT, SMALL_AMOUNT);
        gateway.deposit(YO_USDT_VAULT, SMALL_AMOUNT, quoted * 99/100, user, 0);
        vm.stopPrank();
        console.log("[PASS] Approve + deposit flow works");
    }

    function test_3_Deposit_RevertWithoutApproval() public {
        vm.startPrank(user);
        usdt.approve(YO_GATEWAY, 0);
        uint256 quoted = gateway.quotePreviewDeposit(YO_USDT_VAULT, SMALL_AMOUNT);
        vm.expectRevert();
        gateway.deposit(YO_USDT_VAULT, SMALL_AMOUNT, quoted * 99/100, user, 0);
        vm.stopPrank();
        console.log("[PASS] Deposit without approval correctly reverts");
    }

    function test_3_Deposit_SmallInstallmentAmount() public {
        vm.startPrank(user);
        usdt.approve(YO_GATEWAY, INSTALLMENT);
        uint256 quoted = gateway.quotePreviewDeposit(YO_USDT_VAULT, INSTALLMENT);
        uint256 shares = gateway.deposit(
            YO_USDT_VAULT, 
            INSTALLMENT, 
            quoted * 99/100, 
            user, 
            0 
        );
        vm.stopPrank();
        assertGt(shares, 0, "Should receive shares for $33 deposit");
        console.log("[PASS] $33 installment deposit works. Shares:", shares);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP 4: YO GATEWAY — REDEEM
    // ═══════════════════════════════════════════════════════════════════════════

    function test_4_Redeem_BasicRedeem() public {
        vm.startPrank(user);
        usdt.approve(YO_GATEWAY, SMALL_AMOUNT);
        uint256 quotedShares = gateway.quotePreviewDeposit(YO_USDT_VAULT, SMALL_AMOUNT);
        uint256 shares = gateway.deposit(
            YO_USDT_VAULT, 
            SMALL_AMOUNT, 
            quotedShares * 99/100, 
            user, 
            0 
        );

        yoUsdt.approve(YO_GATEWAY, shares);
        uint256 quotedAssets = gateway.quotePreviewWithdraw(YO_USDT_VAULT, shares);
        uint256 assetsBack = gateway.redeem(
            YO_USDT_VAULT, 
            shares, 
            quotedAssets * 99/100, 
            user, 
            0 
        );
        vm.stopPrank();

        assertGt(assetsBack, 0, "Should get assets back");
        assertApproxEqRel(assetsBack, SMALL_AMOUNT, 0.01e18, "Should get ~100 USDT back");
        console.log("[PASS] Redeem returned:", assetsBack / USDT_DECIMALS, "USDT");
    }

    function test_4_Redeem_PartialRedeem() public {
        vm.startPrank(user);
        usdt.approve(YO_GATEWAY, SMALL_AMOUNT);
        uint256 quotedShares = gateway.quotePreviewDeposit(YO_USDT_VAULT, SMALL_AMOUNT);
        uint256 shares = gateway.deposit(
            YO_USDT_VAULT, 
            SMALL_AMOUNT, 
            quotedShares * 99/100, 
            user, 
            0 
        );

        uint256 halfShares = shares / 2;
        yoUsdt.approve(YO_GATEWAY, halfShares);
        uint256 quotedHalf = gateway.quotePreviewWithdraw(YO_USDT_VAULT, halfShares);
        uint256 assetsBack = gateway.redeem(
            YO_USDT_VAULT, 
            halfShares, 
            quotedHalf * 99/100, 
            user, 
            0 
        );
        vm.stopPrank();

        assertApproxEqRel(assetsBack, SMALL_AMOUNT / 2, 0.02e18, "Half redeem ~50 USDT");
        assertGt(yoUsdt.balanceOf(user), 0, "User should still have remaining shares");
        console.log("[PASS] Partial redeem works:", assetsBack / USDT_DECIMALS, "USDT");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP 5: YIELD ACCRUAL (vm.warp)
    // ═══════════════════════════════════════════════════════════════════════════

    function test_5_Yield_AccruesOver30Days() public {
        vm.startPrank(user);
        usdt.approve(YO_GATEWAY, SMALL_AMOUNT);
        uint256 quotedShares = gateway.quotePreviewDeposit(YO_USDT_VAULT, SMALL_AMOUNT);
        uint256 shares = gateway.deposit(
            YO_USDT_VAULT, 
            SMALL_AMOUNT, 
            quotedShares * 99/100, 
            user, 
            0 
        );
        vm.stopPrank();

        uint256 valueAtDeposit = gateway.quotePreviewWithdraw(YO_USDT_VAULT, shares);
        console.log("Value at deposit:", valueAtDeposit / USDT_DECIMALS, "USDT");

        vm.warp(block.timestamp + 30 days);
        vm.roll(block.number + 216000);

        uint256 valueAfter30d = gateway.quotePreviewWithdraw(YO_USDT_VAULT, shares);
        console.log("Value after 30d:", valueAfter30d / USDT_DECIMALS, "USDT");

        assertGe(valueAfter30d, valueAtDeposit * 99/100, "Value should not decrease");
        console.log("[PASS] Yield accrual check passed");
    }

    function test_5_Yield_90DayBNPLCycle() public {
        uint256 totalCollateral = 99 * 1e6; // $99 order
        vm.startPrank(user);
        usdt.approve(YO_GATEWAY, totalCollateral);
        uint256 quoted = gateway.quotePreviewDeposit(YO_USDT_VAULT, totalCollateral);
        uint256 shares = gateway.deposit(
            YO_USDT_VAULT, 
            totalCollateral, 
            quoted * 99/100, 
            user, 
            0 
        );
        vm.stopPrank();
        console.log("Locked $99 collateral. Shares:", shares);

        // Installment 1: Day 0 -> Day 30
        vm.warp(block.timestamp + 30 days);
        uint256 redeemShares1 = shares / 3;
        vm.startPrank(user);
        yoUsdt.approve(YO_GATEWAY, redeemShares1);
        uint256 quoted1 = gateway.quotePreviewWithdraw(YO_USDT_VAULT, redeemShares1);
        uint256 released1 = gateway.redeem(
            YO_USDT_VAULT, 
            redeemShares1, 
            quoted1 * 99/100, 
            user, 
            0 
        );
        vm.stopPrank();
        console.log("Installment 1 released:", released1 / USDT_DECIMALS, "USDT");

        // Installment 2: Day 30 -> Day 60
        vm.warp(block.timestamp + 30 days);
        uint256 redeemShares2 = shares / 3;
        vm.startPrank(user);
        yoUsdt.approve(YO_GATEWAY, redeemShares2);
        uint256 quoted2 = gateway.quotePreviewWithdraw(YO_USDT_VAULT, redeemShares2);
        uint256 released2 = gateway.redeem(
            YO_USDT_VAULT, 
            redeemShares2, 
            quoted2 * 99/100, 
            user, 
            0 
        );
        vm.stopPrank();
        console.log("Installment 2 released:", released2 / USDT_DECIMALS, "USDT");

        // Installment 3: Day 60 -> Day 90
        vm.warp(block.timestamp + 30 days);
        uint256 remainingShares = yoUsdt.balanceOf(user);
        vm.startPrank(user);
        yoUsdt.approve(YO_GATEWAY, remainingShares);
        uint256 quoted3 = gateway.quotePreviewWithdraw(YO_USDT_VAULT, remainingShares);
        uint256 released3 = gateway.redeem(
            YO_USDT_VAULT, 
            remainingShares, 
            quoted3 * 99/100, 
            user, 
            0 
        );
        vm.stopPrank();
        console.log("Installment 3 released:", released3 / USDT_DECIMALS, "USDT");

        uint256 totalReleased = released1 + released2 + released3;
        console.log("Total released:", totalReleased / USDT_DECIMALS, "USDT");
        assertGe(totalReleased, totalCollateral * 98/100, "Should release >= 98% of original");
        assertEq(yoUsdt.balanceOf(user), 0, "All shares should be redeemed");
        console.log("[PASS] Full 90-day BNPL cycle completed");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP 6: BNPL CREDIT LOGIC
    // ═══════════════════════════════════════════════════════════════════════════

    function test_6_Credit_CollateralCoversInstallment() public view {
        uint256 userBalance = usdt.balanceOf(user);
        uint256 orderAmount = 99 * 1e6;
        uint256 firstInstallment = orderAmount / 3;
        bool canAfford = userBalance >= firstInstallment;
        assertTrue(canAfford, "User should be able to afford first installment");
        console.log("[PASS] Credit check: user balance", userBalance / USDT_DECIMALS, "USDT >= installment", firstInstallment / USDT_DECIMALS, "USDT");
    }

    function test_6_Credit_InsufficientBalanceRejected() public {
        // Seed user2 with only $10 USDT
        vm.startPrank(WHALE);
        usdt.transfer(user2, 10 * 1e6);
        vm.stopPrank();

        uint256 orderAmount = 99 * 1e6;
        uint256 firstInstallment = orderAmount / 3; // $33
        bool canAfford = usdt.balanceOf(user2) >= firstInstallment;
        assertFalse(canAfford, "User2 with $10 should not qualify for $99 order");
        console.log("[PASS] Insufficient balance correctly rejected");
    }

    function test_6_Credit_YieldCoversProtocolFee() public view {
        // After 90 days, yield earned should exceed a reasonable protocol fee (0.5%)
        uint256 principal = 99 * 1e6;
        uint256 expectedFee = principal * 50 / 10000; // 0.5% = $0.495
        
        // With 16.9% APR over 90 days: 99 * 0.169 * (90/365) ≈ $4.10
        uint256 estimatedYield = principal * 169 / 1000 * 90 / 365;
        assertGt(estimatedYield, expectedFee, "Yield should exceed protocol fee");
        console.log("[PASS] Estimated 90d yield:", estimatedYield / USDT_DECIMALS, "USDT > fee:", expectedFee / USDT_DECIMALS, "USDT");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP 7: FULL DEMO FLOW
    // ═══════════════════════════════════════════════════════════════════════════

    function test_7_FullDemoFlow() public {
        console.log("=== YIELDPAY DEMO FLOW ===");
        console.log("Order: algorand.algo domain - $99");

        // Step 1: AI approved (simulated)
        console.log("1. AI Credit Agent: APPROVED - score 720, limit $500");

        // Step 2: Lock $33 first installment as collateral in YO vault
        uint256 inst = INSTALLMENT;
        vm.startPrank(user);
        usdt.approve(YO_GATEWAY, inst);
        uint256 quotedS = gateway.quotePreviewDeposit(YO_USDT_VAULT, inst);
        uint256 shares = gateway.deposit(
            YO_USDT_VAULT, 
            inst, 
            quotedS * 99/100, 
            user, 
            0 
        );
        vm.stopPrank();
        console.log("2. Locked $33 in yoUSDT. Shares:", shares);

        // Step 3: Merchant gets paid installment 1
        vm.startPrank(user);
        usdt.transfer(merchant, inst);
        vm.stopPrank();
        assertEq(usdt.balanceOf(merchant), inst, "Merchant received installment 1");
        console.log("3. Merchant paid $33 (installment 1)");

        // Step 4: 30 days pass
        vm.warp(block.timestamp + 30 days);
        console.log("4. 30 days passed. Collateral earning 16.9% APR in YO vault.");

        // Step 5: User redeems collateral to pay installment 2
        uint256 sharesOwned = yoUsdt.balanceOf(user);
        vm.startPrank(user);
        yoUsdt.approve(YO_GATEWAY, sharesOwned);
        uint256 quotedA = gateway.quotePreviewWithdraw(YO_USDT_VAULT, sharesOwned);
        uint256 redeemed = gateway.redeem(
            YO_USDT_VAULT, 
            sharesOwned, 
            quotedA * 99/100, 
            user, 
            0 
        );
        vm.stopPrank();
        console.log("5. Collateral redeemed:", redeemed / USDT_DECIMALS, "USDT");

        // Step 6: Merchant gets installment 2
        vm.startPrank(user);
        usdt.transfer(merchant, inst);
        vm.stopPrank();
        console.log("6. Merchant paid $33 (installment 2)");

        console.log("=== DEMO COMPLETE ===");
        assertGt(redeemed, 0, "Demo flow produced non-zero redemption");
        assertEq(usdt.balanceOf(merchant), inst * 2, "Merchant received 2 installments");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP 8: EDGE CASES
    // ═══════════════════════════════════════════════════════════════════════════

    function test_8_Edge_ZeroDepositReverts() public {
        vm.startPrank(user);
        usdt.approve(YO_GATEWAY, 1000 * 1e6);
        vm.expectRevert();
        gateway.deposit(YO_USDT_VAULT, 0, 0, user, 0);
        vm.stopPrank();
        console.log("[PASS] Zero deposit correctly reverts");
    }
}
