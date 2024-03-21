module todolist_addr::todolist {

  use aptos_framework::account;
  use aptos_framework::event;
  use std::signer;
  use std::vector;
  use std::string::String;
  

  const E_NOT_INITIALIZED: u64 = 1;
  const ETASK_DOESNT_EXIST: u64 = 2;
  const ETASK_IS_COMPLETED: u64 = 3;

  struct TodoList has key {
    tasks: vector<Task>,
    set_task_event: event::EventHandle<Task>,
  }

  struct Task has store, drop, copy {
    address:address,
    content: String,
    completed: bool,
  }

  public entry fun create_list(account: &signer){
    let wish_list = TodoList {
      tasks: vector::empty(),
      set_task_event: account::new_event_handle<Task>(account),
    };
    
    move_to(account, wish_list);
  }

  public entry fun create_task(account: &signer, content: String) acquires TodoList {

    let signer_address = signer::address_of(account);
    
    assert!(exists<TodoList>(signer_address), E_NOT_INITIALIZED);
    
    let wish_list = borrow_global_mut<TodoList>(signer_address);
    
    let new_task = Task {
      address: signer_address,
      content,
      completed: false
    };
    
    let length = vector::length(&wish_list.tasks);
    vector::insert(&mut wish_list.tasks, length, new_task);
    
    event::emit_event<Task>(
      &mut borrow_global_mut<TodoList>(signer_address).set_task_event,
      new_task,
    );
  }

  public entry fun complete_task(account: &signer, task_id: u64) acquires TodoList {
    
    let signer_address = signer::address_of(account);
		
    assert!(exists<TodoList>(signer_address), E_NOT_INITIALIZED);
    
    let wish_list = borrow_global_mut<TodoList>(signer_address);
  
    assert!(task_id < vector::length(&wish_list.tasks), ETASK_DOESNT_EXIST);
    
    let task_record = vector::borrow_mut(&mut wish_list.tasks, task_id);
    
    assert!(task_record.completed == false, ETASK_IS_COMPLETED);
    
    task_record.completed = true;
  }
}
