module cccy::randoom{
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_std::smart_vector;
    use aptos_std::smart_vector::SmartVector;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin;
    use aptos_framework::coin::Coin;
    use aptos_framework::event;
    use aptos_framework::genesis;
    use aptos_framework::object::object_address;
    use aptos_framework::randomness;

    #[event]
    struct Event<T> has drop,store{
        value: T
    }

    #[event]
    struct Winner has drop,store{
        value: address
    }

    entry fun random_u8(){
        event::emit(
            Event{
                value:randomness::u8_integer()
            }
        );
    }


    // 1. Initialize the prize pool
    fun init_module(caller:&signer){
        move_to(caller,Pools{
            titckets_user: smart_vector::empty(),
            number: vector[0,1,2,3,4,5,6,7,8,9],
            coins:coin::zero(),
            is_closed:false
        })
    }

    // Define a prize pool, which can add prize names
    struct Pools has key {
        titckets_user: SmartVector<address>,
        number:vector<u64>,
        coins:Coin<AptosCoin>,
        is_closed:bool
    }

    // price
    public fun get_ticket_price():u64{TICKET_PRICE}
    const TICKET_PRICE:u64 = 10_000;

    // If users want to draw a lottery, users need to buy a ticket first
    public entry fun buy_ticket(user:&signer) acquires Pools{
        let pool = borrow_global_mut<Pools>(@cccy); //
        // buy a ticket with
        let coins = coin::withdraw<AptosCoin>(user,TICKET_PRICE);
        coin::merge(&mut pool.coins,coins); //Merge the withdrawn coins with the coins of the pool
        // Add the address of the user who purchased the ticket to the array of users who have purchased the ticket
        smart_vector::push_back(&mut pool.titckets_user,signer::address_of(user))
    }

    // Start the draw
    entry fun pick_number() acquires Pools{
        draw_number();
    }

    // one of all prizes is drawn,
    // and the prize is removed after the draw
     fun draw_number():u64 acquires Pools{
        // pool
        let pool = borrow_global_mut<Pools>(@cccy); //
        assert!(!pool.is_closed,HAS_CLOSE); // closed ?
        assert!(!smart_vector::is_empty(&pool.titckets_user),NO_TICKETS); // buy tickets ?
        // select one number
        let select_number = randomness::u64_range(0,vector::length(&pool.number));

        // close
        // pool.is_closed = true;
        select_number
    }
    entry fun pick_winner() acquires Pools {
        draw_winner();
    }

    // pick find
     fun draw_winner() acquires Pools{
        let pool = borrow_global_mut<Pools>(@cccy);
        assert!(!pool.is_closed,HAS_CLOSE); // close ?
        assert!(!smart_vector::is_empty(&pool.titckets_user),NO_TICKETS); // buy tickets ?
        // random a user_ddr as winner
        let winner_id = randomness::u64_range(0,smart_vector::length(&pool.titckets_user));
        // lending winner address
        let winner = *smart_vector::borrow(&pool.titckets_user,winner_id);
        // pay coin to winner
        let coins = coin::extract_all(&mut pool.coins);
        coin::deposit<AptosCoin>(winner,coins);
        // pool.is_closed = true;
        event::emit(
            Winner{
                value:winner
            }
        );
        // winner

    }

    const HAS_CLOSE:u64 = 403;
    const NO_TICKETS:u64 = 404;

    #[test_only]
    public(friend) fun init_module_test(caller:&signer) acquires Pools {
        init_module(caller);
        pick_number();
        pick_number();
        pick_number();
    }

}