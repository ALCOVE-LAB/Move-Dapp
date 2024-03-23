import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

// import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
// import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
//import { useWallet } from "@aptos-labs/wallet-adapter-react";
// import { PetraWallet } from "petra-plugin-wallet-adapter";
// import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

import { Network } from "@aptos-labs/ts-sdk";
import APT from "../lib/aptos";

function Contact(props) {

    //const { account } = useWallet();
    
    let [hash, setHash]=useState("0xd4fe0ab916af86b1ecdc3dd2345c21d12b758aad6540e205178e9e3876285635");
    let [info, setInfo]=useState("");
    let [result,setResult]=useState("Loading...");


    const size = {
        row: [12],
        info:[8,4],
    };

    const self={
        clickCall:(ev)=>{
            APT.generate((pair)=>{
                APT.contact(pair,hash,{content:"hello"},(res)=>{
                    console.log(res);
                },Network.DEVNET);
            });
        }
    };

    useEffect(() => {
        
    }, []);

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <h4>Contact calling</h4>
            </Col>
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <small>{hash}</small>
                <textarea 
                    className="form-control"
                    disabled={true} 
                    rows="3" 
                    value={result}
                    onChange={(ev)=>{

                    }}
                ></textarea>
            </Col>
            <Col className="pt-2" lg={size.info[0]} xl={size.info[0]} xxl={size.info[0]} >
                {info}
            </Col>
            <Col className="text-end pt-2" lg={size.info[1]} xl={size.info[1]} xxl={size.info[1]} >
                <button className="btn btn-md btn-primary" onClick={(ev)=>{
                    self.clickCall(ev);
                }} >Call Contact</button>

            </Col>
        </Row>
    )
}

export default Contact;