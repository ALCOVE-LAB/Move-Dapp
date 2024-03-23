module airdrop::coin_airdrop {
    use std::signer;
    use aptos_framework::coin;

    const MODULE_ADMIN: address = @airdrop;

    // errors
    const ERROR_INSUFFICIENT_AMOUNT: u64 = 1;

    struct CoinReserve<phantom CoinType> has key {
        reserve: coin::Coin<CoinType>,
    }

    fun init_module<CoinType>(account: &signer) {
        move_to(
            account,
            CoinReserve {
                reserve: coin::zero<CoinType>(),
            }
        );
    }

    entry public fun claim<CoinType>(
        sender: &signer,
        amount: u64,
    ) acquires CoinReserve {
        if (!coin::is_account_registered<CoinType>(signer::address_of(sender))) {
            coin::register<CoinType>(sender);
        };

        let coin_reserve = borrow_global_mut<CoinReserve<CoinType>>(MODULE_ADMIN);
        assert!(coin::value<CoinType>(&coin_reserve.reserve) > amount, ERROR_INSUFFICIENT_AMOUNT);

        let coins = coin::extract(&mut coin_reserve.reserve, amount);
        coin::deposit<CoinType>(signer::address_of(sender), coins);
    }

    entry public fun deposit<CoinType>(
        sender: &signer,
        amount: u64,
    ) acquires CoinReserve {
        let coin_reserve = borrow_global_mut<CoinReserve<CoinType>>(MODULE_ADMIN);
        coin::merge(&mut coin_reserve.reserve, coin::withdraw<CoinType>(sender, amount));
    }
}
