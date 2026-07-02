module buiry::marketplace_purchase {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    const PLATFORM_FEE_BPS: u64 = 1000; // 10%

    struct RevenueVault has key {
        id: sui::object::UID,
        admin: address,
        balance: sui::balance::Balance<SUI>,
        total_collected: u64,
    }

    public fun purchase(
        price: u64,
        owner: address,
        payment: Coin<SUI>,
        vault: &mut RevenueVault,
        ctx: &mut TxContext,
    ) {
        let paid = coin::value(&payment);
        assert!(paid >= price, 0);

        let platform_fee = price * PLATFORM_FEE_BPS / 10000;
        let owner_share = price - platform_fee;

        let platform_coin = coin::split(&mut payment, platform_fee, ctx);
        let owner_coin = coin::split(&mut payment, owner_share, ctx);

        transfer::public_transfer(owner_coin, owner);
        sui::balance::join(&mut vault.balance, coin::into_balance(platform_coin));
        vault.total_collected = vault.total_collected + platform_fee;

        transfer::public_transfer(payment, tx_context::sender(ctx));
    }
}
