import { Layout, Row, Col, Button, Spin, Checkbox, List, Input} from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";

//switch to testnet, this is an account property
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(aptosConfig);
// address
const moduleAddress = "0x24a31a3ce511f3344d7cd3b2007b743e36061074a1a983ec174a090fae6a3af9";


type Task = {
  address: string;
  completed: boolean;
  content: string;
  task_id: string;
};

function App() {

  //Extract the account object from the wallet adapter
  const { account, signAndSubmitTransaction } = useWallet();
  //create a local state to store whether the account has a list:
  //[variable, function]
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  //trace the state of sending transactions, this will be used when updating the todoList
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  // update the Task{} and show them when the state changes, here the type of 'tasks' is Task[]
  const [tasks, setTasks] = useState<Task[]>([]);
  // trace the state of the newTask's content
  const [newTask, setNewTask] = useState<string>("");
  
  // when the 'account?.address' changes(eg: connected), the 'fetchList()' will be called
  useEffect(() => {
    fetchList(); // when connecting an account, get the lists
  }, [account?.address]);// if fetchList is a const function that won't change, ignore this warning

  // get the list in the account, this should be called when an account log in, because we need to show the tasklists
  const fetchList = async () => {
    if (!account) return [];
    try {
      // try to fetch the todoList
      const todoListResource = await aptos.getAccountResource(
        {
          accountAddress:account?.address, // account address
          resourceType:`${moduleAddress}::todolist::TodoList` // get the resource via type
        }
      ); 
      // if works, update the state(whether has tasklist)
      setAccountHasList(true); 

      //tasks table handle, to fetch a table item
      // seen as 'any' to avoid the error of unknown types
      const tableHandle = (todoListResource as any).tasks.handle;
		  // tasks table counter
      const taskCounter = (todoListResource as any).task_counter;

      let tasks = [];
      let counter = 1;
      while (counter <= taskCounter) {
      // through this below we can get the value_type by 'aptos.getTableItem'
      const tableItem = { //table::upsert(&mut todo_list.tasks, counter, new_task);
        key_type: "u64",
        value_type: `${moduleAddress}::todolist::Task`,
        key: `${counter}`, // => key_type, this is the value of the key, so it should be renewed
      };
      const task = await aptos.getTableItem<Task>({handle:tableHandle, data:tableItem});
      tasks.push(task);
      counter++;
    }
		// set tasks in local state
    setTasks(tasks);
    } catch (e: any) {
      setAccountHasList(false);
    }
  };
  
  //create new list
  const addNewList = async () => {
    if (!account) return []; //need connect an account first
    setTransactionInProgress(true);
    // define a transaction that creates a list
    const transaction:InputTransactionData = {
        data: {
          function:`${moduleAddress}::todolist::create_list`, // call the function in the contract
          functionArguments:[]
        }
      }
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});
      setAccountHasList(true);
    } catch (error: any) {
      setAccountHasList(false);
    } finally { // 'finally' means whatever happens the function below will always be called
      setTransactionInProgress(false);
    }
  };
  
  // will be called whatever is typed in the input text
  const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewTask(value);
  };
  
  //
  const onTaskAdded = async () => {
    // check for connected account
    if (!account) return;
    setTransactionInProgress(true);
    const transaction:InputTransactionData = {
      data:{
        function:`${moduleAddress}::todolist::create_task`,
        functionArguments:[newTask] // this will be updated when typing in words, for the onWriteTask called
      }
    }
    // hold the latest task.task_id from our local state
    const latestId = tasks.length > 0 ? parseInt(tasks[tasks.length - 1].task_id) + 1 : 1;
    // build a newTaskToPush object into our local state
    const newTaskToPush = {
      address: account.address,
      completed: false,
      content: newTask,
      task_id: latestId + "",
    };
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});

      // Create a new array based on current state:
      let newTasks = [...tasks];
      // Add item to the tasks array
      newTasks.push(newTaskToPush);
      // Set state
      setTasks(newTasks); //task[], update this array
      // clear input text
      setNewTask("");
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };
  
  // when click the checkbox(finish the tasks), this function will be trigger to update the TodoList state
  const onCheckboxChange = async (
    event: CheckboxChangeEvent,
    taskId: string
  ) => {
    if (!account) return;
    //if the checkbox is selected => True, contiune; else return
    if (!event.target.checked) return;
    setTransactionInProgress(true);
    const transaction:InputTransactionData = {
      data:{
        function:`${moduleAddress}::todolist::complete_task`,
        functionArguments:[taskId]
      }
    }
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});
      
      // update local state
      setTasks((prevState) => {// the privateState is the state: the old task before changed by setTasks() 
        // map will traverse the arr: [Task, Task...], the obj represents the single Task element that will be traversed
        const newState = prevState.map((obj) => {
          // the whole Task[] will be traversed and updated
          // if task_id equals the checked taskId, update completed property
          if (obj.task_id === taskId) {
            return { ...obj, completed: true };
          }
          // otherwise return object as is
          return obj;
        });
        // setTasks(newStates)
        return newState;
      });
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };
  

  return (
    <>
    <Layout>
      <Row align="middle">
        <Col span={10} offset={2}>
          <h1>Our todolist</h1>
        </Col>
        <Col span={12} style={{ textAlign: "right", paddingRight: "200px" }}>
          <WalletSelector />
        </Col>
      </Row>
    </Layout>
    <Spin spinning={transactionInProgress}>
    {
    !accountHasList ? (
      <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
        <Col span={8} offset={8}>
          <Button
            disabled={!account}
            block
            onClick={addNewList}
            type="primary"
            style={{ height: "40px", backgroundColor: "#3f67ff" }}
          >
            Add new list
          </Button>
        </Col>
      </Row>
    ) : (
      <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
        <Col span={8} offset={8}>
      <Input.Group compact>
        <Input
          onChange={(event) => onWriteTask(event)}
          style={{ width: "calc(100% - 60px)" }}
          placeholder="Add a Task"
          size="large"
          value={newTask}
        />
        <Button
          onClick={onTaskAdded}
          type="primary"
          style={{ height: "40px", backgroundColor: "#3f67ff" }}
        >
          Add
        </Button>
      </Input.Group>
    </Col>
        <Col span={8} offset={8}>
          {tasks && (
            <List
              size="small"
              bordered
              dataSource={tasks}
              renderItem={(task: any) => (// when the content inside the checkbox changes, this event will trigger the function onCheckboxChange
              <List.Item
              actions={[
                <div>
                  {task.completed ? (
                    <Checkbox defaultChecked={true} disabled />
                  ) : (
                    <Checkbox
                      onChange={(event) =>
                        onCheckboxChange(event, task.task_id)
                      }
                    />
                  )}
                </div>,
              ]}
            >
                <List.Item.Meta
                    title={task.content}
                    description={
                      <a
                        href={`https://explorer.aptoslabs.com/account/${task.address}/`}
                        target="_blank"
                      >{`${task.address.slice(0, 6)}...${task.address.slice(-5)}`}</a>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Col>
      </Row>
    ) //;
    }
    </Spin>
  </>
  );
}

export default App;
