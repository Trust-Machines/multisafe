import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";

import { Form, Button } from "react-bootstrap";

import { useState } from "react";

import { makeSafeContract } from "multisafe-contracts";
import safe from "multisafe-contracts/contracts/safe.clar";

function App() {
  const [network, setNetwork] = useState("mainnet");
  const [owners, setOwners] = useState("");
  const [minConfirmation, setMinConfirmation] = useState(2);
  const [step, setStep] = useState(1);

  const next = () => {
    setStep(2);
  }

  const back = () => {
    setStep(1);
  }

  const deploy = () => {
    
  }

  const code =
    step === 2
      ? makeSafeContract(
          safe,
          [owners.split("\n").map(x => x.trim())],
          minConfirmation
        )
      : "";

  return (
    <div className="App">
      {step === 1 && (
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
            <Form.Control
              as="textarea"
              rows={3}
              value={owners}
              onChange={(e) => {
                setOwners(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Minimum confirmation</Form.Label>
            <Form.Control
              type="number"
              value={minConfirmation}
              onChange={(e) => {
                setMinConfirmation(e.target.value);
              }}
            />
          </Form.Group>

          <Button variant="primary" onClick={next}>Next</Button>
        </Form>
      )}

      {step === 2 && (
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Contract</Form.Label>
            <Form.Control as="textarea" rows={10} value={code} readOnly={true} />
          </Form.Group>
          <Button variant="secondary">Back</Button>
          <Button variant="primary" onClick={deploy}>Deploy</Button>
        </Form>
      )}
    </div>
  );
}

export default App;
