import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import APT from "../lib/aptos";
import { Network } from "@aptos-labs/ts-sdk";

function List(props) {
    const size = {
        row: [12],
    };

    let [hash, setHash]=useState("0xab61910eb5eecc335bca4512ab3fc0d8b84cef3743f0a55c8b0a86e52375384b");
    let [result,setResult]=useState("Loading...");

    const self={
        
    };

    useEffect(() => {
        const type="transaction";
        APT.view(hash,type,(res)=>{
            console.log(res);
            setResult(JSON.stringify(res[0].changes));
        },Network.DEVNET);
    }, []);

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <h4>Transaction list:</h4>
            </Col>
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <small>Hash:{hash}</small>
                <textarea 
                    className="form-control"
                    disabled={true} 
                    rows="10" 
                    value={result}
                    onChange={(ev)=>{

                    }}
                ></textarea>
            </Col>
        </Row>
    )
}

export default List;