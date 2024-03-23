import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import APT from "../lib/aptos";
import { Network } from "@aptos-labs/ts-sdk";

function Current(props) {
    const size = {
        row: [12],
    };

    let [result,setResult]=useState("Loading...");

    const self={
        
    };

    useEffect(() => {
        APT.height(Network.DEVNET,(res)=>{
            setResult(JSON.stringify(res));
        },Network.DEVNET);
    }, []);

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <h4>Block height details:</h4>
            </Col>
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <textarea 
                    className="form-control"
                    disabled={true} 
                    rows="4" 
                    value={result}
                    onChange={(ev)=>{

                    }}
                ></textarea>
            </Col>
        </Row>
    )
}

export default Current;