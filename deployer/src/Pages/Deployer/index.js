import { useState, useCallback } from "react";
import { Form, Button, InputGroup, Table } from "react-bootstrap";
import Editor, { Monaco } from '@monaco-editor/react';

import { logoutSvg } from "../../svg";
import { makeSafeContract } from "multisafe-contracts";
import safe from "multisafe-contracts/contracts/safe.clar";

import { useConnect } from '../../lib/auth';

import "./index.scss";

function Deployer({ userData }) {
    const { handleSignOut } = useConnect();

    const [network, setNetwork] = useState("mainnet");
    const [owners, setOwners] = useState(
        [userData.profile.stxAddress.mainnet]
    );
    const [minConfirmation, setMinConfirmation] = useState(2);
    const [owner, setOwner] = useState("");

    const code = makeSafeContract(
        safe,
        owners,
        minConfirmation
    )

    const deploy = () => {

    }
    
    return <div className="deployer">
        <div className="deployer-nav">
            <div className="deployer-nav-brand">
               <span className="brand-primary">MultiSafe</span> deployer
            </div>
            <div className="deployer-account">
                {userData.profile.stxAddress[network]}
                <Button variant="outline-primary" size="sm" onClick={handleSignOut}>{logoutSvg}</Button>
            </div>
        </div>
        <div className="deployer-main">
            <div className="deployer-options">
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Network</Form.Label>
                        <Form.Select
                            value={network}
                            onChange={(e) => {
                                setNetwork(e.target.value);
                            }}
                        >
                            <option value="mainnet">Mainnet</option>
                            <option value="testnet">Testnet</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Owners</Form.Label>
                        <InputGroup className="mb-3">
                            <Form.Control
                                placeholder="Wallet address" value={owner} onChange={(e) => {
                                    setOwner(e.target.value);
                                }}
                            />
                            <Button variant="outline-primary" onClick={() => {
                                setOwners([...owners, owner]);
                                setOwner('');
                            }}>
                                Add
                            </Button>
                        </InputGroup>
                        <Table striped bordered hover size="sm">
                            <tbody>
                                {owners.map(o => <tr>
                                    <td><small>{o}</small></td>
                                    <td><Button size="sm" variant="danger" onClick={() => {
                                        setOwners([...owners.filter(x => x !== o)])
                                    }}>X</Button> </td>
                                </tr>)}
                            </tbody>
                        </Table>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Confirmation threshold</Form.Label>
                        <Form.Control
                            type="number"
                            value={minConfirmation}
                            min={1}
                            max={20}
                            onChange={(e) => {
                                setMinConfirmation(e.target.value);
                            }}
                        />
                    </Form.Group>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button variant="primary" onClick={deploy}>Deploy</Button>
                    </div>
                </Form>
            </div>
            <div className="deployer-code">
                <Editor
                    theme="vs-dark"
                    defaultValue={code}
                    value={code}
                   
                />
            </div>
        </div>
    </div>
}

export default Deployer;