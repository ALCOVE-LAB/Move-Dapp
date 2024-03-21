module Pool::PrizePool{
    friend Pool::locked_coins;

    use std::error;
    use std::vector;
    use std::signer::address_of;
    use aptos_std::from_bcs::{to_u64};
    use aptos_std::bcs::{to_bytes};
    use aptos_std::crypto_algebra::serialize;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    use aptos_framework::timestamp;

    const ResourceAccountSeed: vector<u8> = b"Prize_Seed";

    struct Points_Card has key {
        points: Table< address, u64>,
        participants_num: u64,
        address_list: vector<address>
    }

    #[view]
    public fun get_points(sender: address):u64 acquires Points_Card {
        let Points_Card{
            points: point_table,
            participants_num: _,
            address_list: _
        } = borrow_global<Points_Card>(
            account::create_resource_address(
                &@Pool,
                ResourceAccountSeed
            )
        );
        let points = table::borrow(point_table, sender);
        *points
    }

    fun init_module(sender: &signer) {
        let sender_address = address_of(sender);
        assert!(sender_address == @Pool, error::not_found(1));
        let (resource_signer, _) = account::create_resource_account(
            sender,
            ResourceAccountSeed
        );

        let  points =  table::new();
        let address_list = vector::empty<address>();
        move_to(
            &resource_signer,
            Points_Card{
                points,
                participants_num: 0,
                address_list,
            }
            );
    }

    public(friend) fun init_card(sender: address, point: u64) acquires Points_Card {
        let resource_account = account::create_resource_address(&@Pool, ResourceAccountSeed);
        let Points_Card{
            points: points_table,
            participants_num ,
            address_list: list,
        } = borrow_global_mut<Points_Card>(resource_account);

        assert!(!table::contains(points_table, sender), error::already_exists(1));
        vector::push_back( list, sender);
        table::add( points_table, sender, point);

        let num = participants_num;
        *num = *num + 1;
    }

    public(friend) fun add_points(sender: address, point: u64) acquires Points_Card {
        let resource_account = account::create_resource_address(&@Pool, ResourceAccountSeed);
        let Points_Card{
            points: points_table,
            participants_num: _,
            address_list: _,
        } = borrow_global_mut<Points_Card>(resource_account);
        assert!(table::contains(points_table, sender), error::not_found(1));

        let points: &mut u64  = table::borrow_mut( points_table, sender);

        *points = *points + point;
    }

    public(friend) fun reduce_points(sender: address, point: u64) acquires Points_Card {
        let resource_account = account::create_resource_address(&@Pool, ResourceAccountSeed);
        let Points_Card{
            points: points_table,
            participants_num: number,
            address_list: list,
        } = borrow_global_mut<Points_Card>(resource_account);
        assert!(table::contains(points_table, sender), error::not_found(1));

        let points: &mut u64  = table::borrow_mut(points_table, sender);

        assert!(*points >= point, error::not_found(1));

        *points = *points - point;

        if(*points == 0) {
            table::remove( points_table, sender);
            let num =  number;
            vector::remove_value(list, &sender);
            *num = *num - 1;
        }
    }

    public(friend) fun Lottery_draw(sender_address: address):address acquires Points_Card {
        let points_Card = borrow_global_mut<Points_Card>(
            account::create_resource_address(
                &sender_address,
                ResourceAccountSeed
            )
        );
        let winer_points = 0;
        let winer = sender_address;
        let num = &mut points_Card.participants_num;
        let number = timestamp::now_seconds();
        let small_number = (number as u8);
        let seed : vector<u8> = vector[small_number];

        while (*num == 0) {
            let paly_address = vector::remove(&mut points_Card.address_list,0);
            let points = table::remove(&mut points_Card.points, paly_address);
            let account_seed = account::create_resource_address(
                &paly_address,
                seed
            );
            let random_number = to_u64(to_bytes(& account_seed));
            let  final_points = ((random_number as u256) * (points as u256) ) ;
            if(final_points > winer_points) {
                winer_points = final_points;
                winer = paly_address;
            };
            *num = *num - 1;
        };
        winer
    }

}