import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import APT from "../lib/aptos";
import { Network } from "@aptos-labs/ts-sdk";

function Generate(props) {
    const size = {
        row: [12],
        info:[8,4],
    };

    let [info, setInfo]=useState("");
    let [result,setResult]=useState("");

    const self={
        clickGenerate:(ev)=>{
            APT.generate((res)=>{
                console.log(res);
                setResult(`accountAddress: ${res.accountAddress.toString()}\npublicKey: ${res.publicKey.key.toString()}
                `);
                //setInfo(res.to)
            });
        },
    };

    useEffect(() => {
        
    }, []);

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <h4>Generate:</h4>
            </Col>
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
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
                    self.clickGenerate(ev);
                }} >New account</button>
            </Col>
        </Row>
    )
}

export default Generate;