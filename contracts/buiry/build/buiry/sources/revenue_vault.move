module buiry::revenue_vault {
    use sui::object::{Self, UID};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    struct RevenueVault has key {
        id: UID,
        admin: address,
        balance: Balance<SUI>,
        total_collected: u64,
    }

    public fun create(admin: address, ctx: &mut TxContext) {
        let vault = RevenueVault {
            id: object::new(ctx),
            admin,
            balance: balance::zero(),
            total_collected: 0,
        };
        transfer::share_object(vault);
    }

    public fun deposit(vault: &mut RevenueVault, coin: Coin<SUI>) {
        let amount = coin::value(&coin);
        sui::balance::join(&mut vault.balance, coin::into_balance(coin));
        vault.total_collected = vault.total_collected + amount;
    }

    public fun withdraw(vault: &mut RevenueVault, amount: u64, ctx: &mut TxContext): Coin<SUI> {
        assert!(vault.admin == tx_context::sender(ctx), 0);
        assert!(balance::value(&vault.balance) >= amount, 1);
        coin::from_balance(balance::split(&mut vault.balance, amount), ctx)
    }
}
