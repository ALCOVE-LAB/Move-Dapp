module lucky_pocket::luck_pocket {

    use std::debug::print;
    use std::signer;
    use std::vector;
    use aptos_framework::object::{Self};
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::randomness;
    use lucky_pocket::Config;


    const EINVALID_ADDRESS: u64 = 301;

    struct Pocket has key, store {
        token: coin::Coin<AptosCoin>,
        deposit_num: u64,
        paticipators: vector<address>,
        last_update_ts: u64,
    }

    struct Refs has key {
        delete_ref: object::DeleteRef,
        extend_ref: object::ExtendRef
    }

    entry fun init_pocket(account: &signer){
        assert!(Config::admin_address() == signer::address_of(account), EINVALID_ADDRESS);
        move_to(account, Pocket{
            token: coin::zero<AptosCoin>(),
            deposit_num: 0u64,
            paticipators: vector<address>[],
            last_update_ts: 0u64,
        });
    }

    entry fun toss(account: &signer) acquires Pocket {
        let s_addr = signer::address_of(account);
        let toss_amount: u64 = 1000000;
        let coins = coin::withdraw<AptosCoin>(account, toss_amount);
        let pocket = borrow_global_mut<Pocket>(Config::admin_address());
        coin::merge(&mut pocket.token, coins);
        pocket.deposit_num = pocket.deposit_num + toss_amount;
        pocket.last_update_ts = timestamp::now_seconds();
        vector::push_back(&mut pocket.paticipators, s_addr);

        // distribution
        if (pocket.deposit_num >= 5*toss_amount){
            // calc rates for every toss
            let total: u64 = 0;
            let d_list =  vector<u64>[];
            let pax_n = vector::length(&pocket.paticipators);
            for (i in 0..pax_n){
                let p_rate = randomness::u64_range(0, 100);
                vector::push_back<u64>(&mut d_list, p_rate);
                total = total + p_rate;
            };

            // with random rates above, distribute coins
            let total_withdrawed: u64 = 0;
            for (i in 0..pax_n){
                let num = vector::pop_back<u64>(&mut d_list);
                let amount: u64;
                if (i == pax_n-1){
                    amount = pocket.deposit_num - total_withdrawed;
                }else{
                    amount = (num / total) * pocket.deposit_num;
                };
                total_withdrawed = total_withdrawed + amount;
                let addr = vector::pop_back<address>(&mut pocket.paticipators);

                //take out coin
                let coins = coin::extract<AptosCoin>(&mut pocket.token, amount);
                coin::deposit<AptosCoin>(addr, coins);
                pocket.deposit_num = pocket.deposit_num - amount;
                print(&addr);
                print(&amount);
            }
        }
    }

    #[test(sender=@lucky_pocket)]
    fun test_init(sender: &signer){
        init_pocket(sender);
    }

    #[test(sender=@0xeb3f16ade662b539236d3fbb93a8f31e2a625b329655b9e18e95a557e3c1416b)]
    fun test_toss1() acquires Pocket {
        toss(sender);
    }
    // #[test(sender=@lucky_pocket)]
    // fun test_toss2(sender: &signer) acquires Pocket{
    //     toss(sender);
    // }
    // #[test(sender=@lucky_pocket)]
    // fun test_toss3(sender: &signer) acquires Pocket{
    //     toss(sender);
    // }
    // #[test(sender=@lucky_pocket)]
    // fun test_toss4(sender: &signer) acquires Pocket{
    //     toss(sender);
    // }
    // #[test(sender=@lucky_pocket)]
    // fun test_toss(sender: &signer) acquires Pocket{
    //     toss(sender);
    // }

}