export const ABI = {
    "address": "0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7",
    "name": "todolist",
    "friends": [],
    "exposed_functions": [
      {
        "name": "complete_task",
        "visibility": "public",
        "is_entry": true,
        "is_view": false,
        "generic_type_params": [],
        "params": [
          "&signer",
          "u64"
        ],
        "return": []
      },
      {
        "name": "create_list",
        "visibility": "public",
        "is_entry": true,
        "is_view": false,
        "generic_type_params": [],
        "params": [
          "&signer"
        ],
        "return": []
      },
      {
        "name": "create_task",
        "visibility": "public",
        "is_entry": true,
        "is_view": false,
        "generic_type_params": [],
        "params": [
          "&signer",
          "0x1::string::String"
        ],
        "return": []
      }
    ],
    "structs": [
      {
        "name": "Task",
        "is_native": false,
        "abilities": [
          "copy",
          "drop",
          "store"
        ],
        "generic_type_params": [],
        "fields": [
          {
            "name": "address",
            "type": "address"
          },
          {
            "name": "content",
            "type": "0x1::string::String"
          },
          {
            "name": "completed",
            "type": "bool"
          }
        ]
      },
      {
        "name": "TodoList",
        "is_native": false,
        "abilities": [
          "key"
        ],
        "generic_type_params": [],
        "fields": [
          {
            "name": "tasks",
            "type": "vector<0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7::todolist::Task>"
          },
          {
            "name": "set_task_event",
            "type": "0x1::event::EventHandle<0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7::todolist::Task>"
          }
        ]
      }
    ]
  } as const


