module todolist_addr::todolist{
    use aptos_framework::event;
    use std::string::String; // already have it, need to modify
    use std::signer;
    use aptos_std::table::{Self, Table};
    use aptos_framework::account;
    #[test_only] // only used in test block
    use std::string;
    
    
    // Errors
    const E_NOT_INITIALIZED: u64 = 1;
    const ETASK_DOESNT_EXIST: u64 = 2;
    const ETASK_IS_COMPLETED: u64 = 3;


    // use key to store the Todolist in a certain assigned account
    struct TodoList has key{ // key: means this is a resource, only exsists when assigned to an account
        //so need to assign it to an account
        tasks: Table<u64, Task>,
        //EventHandle: Storage can use this handle to prove the total number of events that happened in the past.
        // handle how many Tasks happened in the past
        set_task_event: event::EventHandle<Task>, 
        task_counter: u64
    }

    // can be stored in another struct, can be copied and drop end of scope
    struct Task has store, drop, copy{
        task_id: u64,
        address: address,
        content: String,
        completed: bool,
    }

    // entry: can be called via transaction, signer: sb who sogned the transaction
    //we need the signer so that to use the resource TodoList
    public entry fun create_list(account: &signer){
        //create a new TodoList resource use a assigned signer
        let tasks_holder = TodoList{
            tasks: table::new(),
            set_task_event: account::new_event_handle<Task>(account),
            task_counter : 0
        };
        // move to the signer's account
        move_to(account, tasks_holder);
    }

    public entry fun create_task(account: &signer, content: String)acquires TodoList{
        //get signer address
        let signer_address = signer::address_of(account);
        // assert signer has created a list
        assert!(exists<TodoList>(signer_address), E_NOT_INITIALIZED);
        //get TodoList resource from signer's account
        let todo_list = borrow_global_mut<TodoList>(signer_address);
        //increase task counter
        let counter = todo_list.task_counter + 1;
        //create a new task
        let new_task = Task{
            task_id: counter,
            address: signer_address,
            content,
            completed: false
        };
        //insert the new task into TodoList's table <u64, Task>
        table::upsert(&mut todo_list.tasks, counter, new_task);
        // update the task_counter in the TodoList
        todo_list.task_counter = counter;
        // fires a new_task created event
        event::emit_event<Task>( // use eventhandle(set_task_event) to emit a event: new_task, number is mentioned
            &mut borrow_global_mut<TodoList>(signer_address).set_task_event,
            new_task
        );
    }

     public entry fun complete_task(account: &signer, task_id: u64)acquires TodoList{
        let signer_address = signer::address_of(account);
        // assert signer has created a list
        assert!(exists<TodoList>(signer_address), E_NOT_INITIALIZED);
        // get the resource TodoList via the signer'address
        let todo_list = borrow_global_mut<TodoList>(signer_address);
        //assert the task exsists
        assert!(table::contains(&todo_list.tasks, task_id), ETASK_DOESNT_EXIST);
        //get the fished task from the TodoList.tasks(by id)=>Task
        let task_record = table::borrow_mut(&mut todo_list.tasks, task_id);
        //if haven't been fished
        assert!(task_record.completed == false, ETASK_IS_COMPLETED);
        task_record.completed = true;
    }

    #[test(admin = @0x123)]
    public entry fun test_flow(admin: signer)acquires TodoList{// entry is needed because we are testing a entry function
    // create an account for test => sender: &signer, this one is MUST needed
    account::create_account_for_test(signer::address_of(&admin));
    //initialize the contract with the admin address
    create_list(&admin);
    //create task
    create_task(&admin, string::utf8(b"New Task"));
    // here we just check not modify, so we don't use 'mut'
    let task_count = event::counter(&borrow_global<TodoList>(signer::address_of(&admin)).set_task_event);
    assert!(task_count == 1, 4);

    let todo_list = borrow_global<TodoList>(signer::address_of(&admin));
    assert!(todo_list.task_counter == 1, 5);
    // get task via task_id
    let task_record = table::borrow(&todo_list.tasks, todo_list.task_counter);
    assert!(task_record.task_id == 1, 6);
    assert!(task_record.completed == false, 7);
    assert!(task_record.content == string::utf8(b"New Task"), 8);
    assert!(task_record.address == signer::address_of(&admin), 9);

    //complete the task
    complete_task(&admin, 1);
    //check if completed
    let todo_list = borrow_global<TodoList>(signer::address_of(&admin));
    let task_record = table::borrow(&todo_list.tasks, 1);
    assert!(task_record.task_id == 1, 10);
    assert!(task_record.completed == true, 11);
    assert!(task_record.content == string::utf8(b"New Task"), 12);
    assert!(task_record.address == signer::address_of(&admin), 13);
    }

    #[test(admin = @0x123)]
    #[expected_failure(abort_code = E_NOT_INITIALIZED)]
    public entry fun account_can_not_update_task(admin: signer)acquires TodoList{
        account::create_account_for_test(signer::address_of(&admin));
        //test the fn complete_task()
        complete_task(&admin, 2);
    }
}
/*"Result": {
    "transaction_hash": "0xdaa1d8dd00e7d8351807e75d3f68ba96e8fb955af5a2cf4f304b33383a8cc329",
    "gas_used": 2181,
    "gas_unit_price": 100,
    "sender": "24a31a3ce511f3344d7cd3b2007b743e36061074a1a983ec174a090fae6a3af9",
    "sequence_number": 0,
    "success": true,
    "timestamp_us": 1710426244226944,
    "version": 966853919,
    "vm_status": "Executed successfully"
  }
  /*