
module Pool::locked_coins {
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};
    use std::error;
    use std::signer;
    use std::signer::address_of;
    use std::vector;
    use aptos_framework::fungible_asset::amount;

    use Pool::flash_lender::{claim_Yield, deposits, withdraws, get_Yield, updata_yield_address};
    use Pool::PrizePool::{init_card, add_points, reduce_points, Lottery_draw};

    struct Lock has store,copy {
        coins: u64,
        want_lock_time: u64,
        begin_lock_time: u64,
    }

    struct Locks has key {
        locks: Table< u64, Lock>,
        withdrawal_address: address,
        total_locks: u64,
    }

    struct Yield has key {
      yieldFeePercentage: u64,
      yieldFeeRecipient: address,
    }

    struct  Pledge_switch has key {
        Pledge_switch: bool,
    }



    ////////////////////////////////////////////////////////////////////////////////
    /// Events
    ////////////////////////////////////////////////////////////////////////////////
    #[event]
    struct CompleteLockup has drop, store {
        sponsor: address,
        lockid: u64,
        coins: u64,
    }
    #[event]
    struct CancelLockup has drop, store {
        sponsor: address,
        lockid: u64,
        coins: u64,
    }
    #[event]
    struct UpdateLockup has drop, store {
        sponsor: address,
        recipient: address,
        old_unlock_time_secs: u64,
        new_unlock_time_secs: u64,
    }

    #[event]
    struct UpdateWithdrawalAddress has drop, store {
        sponsor: address,
        old_withdrawal_address: address,
        new_withdrawal_address: address,
    }


    ////////////////////////////////////////////////////////////////////////////////
    /// Errors
    ////////////////////////////////////////////////////////////////////////////////
    /// No locked coins found to claim.
    const ELOCK_NOT_FOUND: u64 = 1;
    /// Lockup has not expired yet.
    const ELOCKUP_HAS_NOT_EXPIRED: u64 = 2;
    /// Can only create one active lock per recipient at once.
    const ELOCK_ALREADY_EXISTS: u64 = 3;
    /// The length of the recipients list doesn't match the amounts.
    const EINVALID_RECIPIENTS_LIST_LENGTH: u64 = 3;
    /// Sponsor account has not been set up to create locks for the specified CoinType yet.
    const ESPONSOR_ACCOUNT_NOT_INITIALIZED: u64 = 4;
    /// Cannot update the withdrawal address because there are still active/unclaimed locks.
    const EACTIVE_LOCKS_EXIST: u64 = 5;

    ////////////////////////////////////////////////////////////////////////////////
    ///  Constants
    ////////////////////////////////////////////////////////////////////////////////
    ///

    ///
    const ResourceAccountSeed: vector<u8> = b"Value_Seed";
    ///
    const  FEE_PRECISION: u64 = 1_000_000_000;
    ///
    const  MAX_FEE:u64 = 500_000_000;

    #[view]
    /// Return the total number of locks created by the sponsor for the given CoinType.
    public fun total_locks(sponsor: address): u64 acquires Locks {
        assert!(exists<Locks>(sponsor), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));
        let locks = borrow_global<Locks>(sponsor);
        locks.total_locks
    }

    #[view]
    public fun locked_amount(sponsor: address, lockid: u64): u64 acquires Locks {
        assert!(exists<Locks>(sponsor), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));
        let locks = borrow_global<Locks>(sponsor);
        assert!(table::contains(&locks.locks, lockid), error::not_found(ELOCK_NOT_FOUND));
       table::borrow(&locks.locks, lockid).coins
    }

    #[view]
    public fun want_lock_time(sponsor: address, lockid: u64): u64 acquires Locks {
        assert!(exists<Locks>(sponsor), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));
        let locks = borrow_global<Locks>(sponsor);
        assert!(table::contains(&locks.locks, lockid), error::not_found(ELOCK_NOT_FOUND));
        table::borrow(&locks.locks, lockid).want_lock_time
    }

    #[view]
    public fun withdrawal_address(sponsor: address): address acquires Locks {
        assert!(exists<Locks>(sponsor), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));
        let locks = borrow_global<Locks>(sponsor);
        locks.withdrawal_address
    }

    #[view]
    public fun get_YieldFeeRecipient(sender: address):address acquires Yield {
        let yield = borrow_global<Yield>(sender);
        yield.yieldFeeRecipient
    }
    #[view]
    public fun get_YieldFeePercentage(sender: address):u64 acquires Yield {
        let yield = borrow_global<Yield>(sender);
        yield.yieldFeePercentage
    }
    #[view]
    public fun get_Pledge_switch(sender: address):bool acquires Pledge_switch {
        let pledge_switch = borrow_global_mut<Pledge_switch>(
            account::create_resource_address(
                &sender,
                ResourceAccountSeed
            )
        ).Pledge_switch;
        pledge_switch
    }

     fun init_module(sender: &signer) {
        let sender_address = address_of(sender);
        assert!(sender_address == @Pool, error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));
        let (resource_signer, _) = account::create_resource_account(
            sender,
            ResourceAccountSeed
        );
        move_to(
            &resource_signer,
            Pledge_switch {
                Pledge_switch: false
            });
        move_to(sender, Yield{
            yieldFeePercentage: MAX_FEE ,
            yieldFeeRecipient: sender_address,
        });
    }

    public entry fun begin_lockup(sponsor: &signer, withdrawal_address: address, amount: u64, want_lock_time: u64) acquires Pledge_switch {
        let pledge_switch = borrow_global<Pledge_switch>(
            account::create_resource_address(
                &@Pool,
                ResourceAccountSeed
            )
        ).Pledge_switch;
        assert!(pledge_switch == true, error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));

        let points = want_lock_time * amount;
        init_card(address_of(sponsor), points);
        deposits(sponsor, amount);
        let begin_lock_time = timestamp::now_seconds();

        let locks =  table::new();

        table::add(
            &mut locks,
            1,
            Lock { coins: amount, begin_lock_time, want_lock_time}
        );

        move_to(sponsor, Locks {
            locks,
            withdrawal_address,
            total_locks: 1,
        })
    }

    public entry fun update_withdrawal_address(
        sponsor: &signer, new_withdrawal_address: address) acquires Locks {
        let sponsor_address = signer::address_of(sponsor);
        assert!(exists<Locks>(sponsor_address), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));

        let locks = borrow_global_mut<Locks>(sponsor_address);
        assert!(locks.total_locks == 0, error::invalid_state(EACTIVE_LOCKS_EXIST));
        let old_withdrawal_address = locks.withdrawal_address;
        locks.withdrawal_address = new_withdrawal_address;

        event::emit(UpdateWithdrawalAddress {
            sponsor: sponsor_address,
            old_withdrawal_address,
            new_withdrawal_address,
        });
    }

    public entry fun batch_add_locked_coins(sponsor: &signer, amounts: vector<u64>, want_lock_times: vector<u64>) acquires Locks,Pledge_switch{

        let len = vector::length(&want_lock_times);
        assert!(len == vector::length(&amounts), error::invalid_argument(EINVALID_RECIPIENTS_LIST_LENGTH));
        vector::enumerate_ref(&amounts, |i, amount| {
            let want_lock_time = *vector::borrow(&want_lock_times, i);
            add_locked_coins(sponsor, *amount, want_lock_time);
        });
    }

    public entry fun add_locked_coins(sponsor: &signer, amount: u64, want_lock_time: u64) acquires Locks,Pledge_switch {
        let pledge_switch = borrow_global<Pledge_switch>(
            account::create_resource_address(
                &@Pool,
                ResourceAccountSeed
            )
        ).Pledge_switch;
        assert!(pledge_switch == true, error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));

        let sponsor_address = signer::address_of(sponsor);
        assert!(exists<Locks>(sponsor_address), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));

        let locks = borrow_global_mut<Locks>(sponsor_address);
        let points = amount * want_lock_time;
        add_points(address_of(sponsor), points);
        deposits(sponsor, amount);
        let begin_lock_time = timestamp::now_seconds();

        locks.total_locks = locks.total_locks + 1;

        table::add(
            &mut locks.locks,
            locks.total_locks,
            Lock { coins: amount, begin_lock_time, want_lock_time}
        );

    }


    public entry fun batch_cancel_lockup(sponsor: &signer, lockids: vector<u64>) acquires Locks,Pledge_switch {
        let sponsor_address = signer::address_of(sponsor);
        assert!(exists<Locks>(sponsor_address), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));

        vector::for_each_ref(&lockids, |lockid| {
            cancel_lockup(sponsor, *lockid);
        });
    }

    public entry fun cancel_lockup(sponsor: &signer, lockid: u64) acquires Locks,Pledge_switch {
        let sponsor_address = signer::address_of(sponsor);
        let pledge_switch = borrow_global<Pledge_switch>(
            account::create_resource_address(
                &@Pool ,
                ResourceAccountSeed
            )
        ).Pledge_switch;
        assert!(pledge_switch == true, error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));


        assert!(exists<Locks>(sponsor_address), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));
        let locks = borrow_global_mut<Locks>(sponsor_address);
        assert!(table::contains(&locks.locks, lockid), error::not_found(ELOCK_NOT_FOUND));
        let Lock { coins, want_lock_time, begin_lock_time: _ } = table::remove(&mut locks.locks, lockid);
        let points = coins * want_lock_time;
        reduce_points(sponsor_address , points);
        locks.total_locks = locks.total_locks - 1;
        withdraws(locks.withdrawal_address, coins);
        event::emit(
            CancelLockup {
                sponsor: sponsor_address,
                lockid,
                coins
            });
    }

    public entry fun batch_complete_lockup(sponsor: &signer, lockids: vector<u64>) acquires Locks {
        let sponsor_address = signer::address_of(sponsor);
        assert!(exists<Locks>(sponsor_address), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));

        vector::for_each_ref(&lockids, |lockid| {
            complete_lockup(sponsor, *lockid);
        });
    }

    public entry fun complete_lockup(sponsor: &signer, lockid: u64) acquires Locks {

        let sponsor_address = signer::address_of(sponsor);
        assert!(exists<Locks>(sponsor_address), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));
        let locks = borrow_global_mut<Locks>(sponsor_address);
        assert!(table::contains(&locks.locks, lockid), error::not_found(ELOCK_NOT_FOUND));
        let Lock { coins, want_lock_time, begin_lock_time } = table::remove(&mut locks.locks, lockid);
        let nowtime = timestamp::now_seconds();
        assert!(nowtime >= want_lock_time + begin_lock_time, error::not_found(1));
        locks.total_locks = locks.total_locks - 1;
        withdraws(locks.withdrawal_address, coins);
        event::emit(
            CompleteLockup {
                sponsor: sponsor_address,
                lockid,
                coins
            });
    }

    public entry fun claimYield(sender: &signer) acquires Yield,Pledge_switch {

        let pledge_switch = borrow_global<Pledge_switch>(
            account::create_resource_address(
                &address_of(sender),
                ResourceAccountSeed
            )
        ).Pledge_switch;
        assert!(pledge_switch == false, error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));


        let sender_address = address_of(sender);
        assert!(exists<Yield>(sender_address), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));

        let Yield {
            yieldFeePercentage,
            yieldFeeRecipient,
        } = borrow_global<Yield>(sender_address);

        let yield = get_Yield();

        let  yieldFee = yield * (*yieldFeePercentage) / FEE_PRECISION;

        claim_Yield(sender, *yieldFeeRecipient, yieldFee);

    }

    public entry fun setYieldFeeRecipient(sender: &signer, newYieldFeeRecipient: address) acquires Yield {
        let sender_address = address_of(sender);
        assert!(exists<Yield>(sender_address), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));
        let yield = borrow_global_mut<Yield>(sender_address);
        yield.yieldFeeRecipient = newYieldFeeRecipient;
    }

    public entry fun setYieldFeePercentage(sender: &signer, newYieldFeePercentage: u64) acquires Yield {
        assert!(newYieldFeePercentage <= MAX_FEE, error::not_found(1));
        let sender_address = address_of(sender);
        assert!(exists<Yield>(sender_address), error::not_found(ESPONSOR_ACCOUNT_NOT_INITIALIZED));
        let yield = borrow_global_mut<Yield>(sender_address);
        yield.yieldFeePercentage = newYieldFeePercentage;
    }

    public entry fun setwiner(sender: &signer){
        let  sender_address = address_of(sender);
        let  winer = Lottery_draw(sender_address);
        updata_yield_address(sender_address, winer);
    }

    public entry fun setPledge_switch(sender: &signer, newSwitch: bool) acquires Pledge_switch {
        let Pledge_switch{
            Pledge_switch: swithch} = borrow_global_mut<Pledge_switch>(
            account::create_resource_address(
                &address_of(sender),
                ResourceAccountSeed
            )
        );
        *swithch = newSwitch;
    }

}