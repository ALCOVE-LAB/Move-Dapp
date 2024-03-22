module inter::interview {
    use std::vector;
    use aptos_framework::object::Object;

    struct Interview has key,store,drop,copy {
        interviewer: address,
        interviewee: address,
        time_slot: u64,
    }

    struct Interviews has key,drop,copy {
        interviews: vector<Interview>,
    }

    public entry fun schedule_interview(
        sender: &signer,
        addr:address,
        interviewer: address,
        interviewee: address,
        time_slot: u64,
    ) acquires Interviews {
        let interviews = borrow_global_mut<Interviews>(addr);
        let new_interview = Interview {
            interviewer,
            interviewee,
            time_slot,
        };
        vector::push_back(&mut interviews.interviews, new_interview);
    }

    public entry fun cancel_interview(sender: &signer,addr:address, interview_index: u64) acquires Interviews {
        let interviews = borrow_global_mut<Interviews>(addr);
        vector::remove(&mut interviews.interviews, interview_index);
    }

    #[view]
    public  fun get_scheduled_interviews(addr:address): vector<Interview> acquires Interviews {
        let interviews = borrow_global<Interviews>(addr);
        interviews.interviews
    }

    fun init_module(sender:&signer) {
        let interviews = Interviews { interviews: vector::empty() };
        move_to(sender, interviews);
    }

}
