import { useState } from 'react';
import { Form, Button, Table } from 'react-bootstrap';

import { validateStacksAddress } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { useConnect } from '@stacks/connect-react';

import Editor, { Monaco } from '@monaco-editor/react';

import { makeSafeContract } from 'multisafe-contracts';
import safe from 'multisafe-contracts/contracts/safe.clar';

import { useAuth } from '../../common/auth';
import { logoutSvg } from '../../svg';

import './style.scss';

function Deployer({ userData }) {

    const { handleSignOut } = useAuth();
    const { doContractDeploy } = useConnect();

    const [name, setName] = useState('');
    const [network, setNetwork] = useState('testnet');
    const [owners, setOwners] = useState([]);
    const [owner, setOwner] = useState('');
    const [threshold, setThreshold] = useState(2);
    const [validation, setValidation] = useState({ name: '', owner: '', threshold: '' });

    const code = makeSafeContract(
        safe,
        owners,
        threshold
    )

    const updateValidation = (key, value) => {
        setValidation({ ...validation, [key]: value });
    }

    const nameChanged = (e) => {
        setName(e.target.value);
        updateValidation('name', '');
    }

    const networkChanged = (e) => {
        setNetwork(e.target.value);
    }

    const ownerChanged = (e) => {
        setOwner(e.target.value);
        updateValidation('owner', '');
    }

    const addOwner = () => {
        if (owner.trim() === '') {
            return;
        }

        if (!validateStacksAddress(owner.trim())) {
            updateValidation('owner', 'Not a valid stacks wallet address');
            return;
        }

        if (owners.find(x => x === owner.trim())) {
            updateValidation('owner', 'The address is already in the list');
            return;
        }

        setOwners([...owners, owner.trim()]);
        updateValidation('owner', '');
        setOwner('');
    }

    const deleteOwner = (o) => {
        setOwners([...owners.filter(x => x !== o)])
    }

    const thresholdChanged = (e) => {
        setThreshold(e.target.value);
        updateValidation('threshold', '');
    }

    const deploy = () => {
        if (!/^[a-zA-Z0-9-]+$/.test(name)) {
            updateValidation('name', 'Enter a valid safe name');
            return
        }

        if (owners.length === 0) {
            updateValidation('owner', 'At least one owner required');
            return;
        }

        if (threshold > owners.length) {
            updateValidation('threshold', 'Threshold is higher than total owner count');
            return;
        }

        doContractDeploy({
            network: network === 'mainnet' ? new StacksMainnet() : new StacksTestnet(),
            contractName: name,
            codeBody: code,
            onFinish: data => {
                console.log('finished stx transfer!', data);
            },
            onCancel: () => {
                console.log('popup closed!');
            },
        });
    }

    return <div className='deployer'>
        <div className='deployer-nav'>
            <div className='deployer-nav-brand'>
                <span className='brand-primary'>MultiSafe</span> deployer
            </div>
            <div className='deployer-account'>
                {userData.profile.stxAddress[network]}
                <Button variant='outline-light' size='sm' onClick={handleSignOut}>{logoutSvg}</Button>
            </div>
        </div>
        <div className='deployer-main'>
            <div className='deployer-options'>
                <Form>
                    <Form.Group controlId='safe-name' as='p'>
                        <Form.Label>Safe name</Form.Label>
                        <Form.Control
                            isInvalid={validation.name}
                            type='text'
                            autoFocus={true}
                            maxLength={40}
                            value={name}
                            onChange={nameChanged}
                        />
                        {!validation.name && <Form.Text muted>Only alphanumeric characters and '-'</Form.Text>}
                        {validation.name && <Form.Control.Feedback type='invalid'>{validation.name}</Form.Control.Feedback>}
                    </Form.Group>
                    <Form.Group controlId='network' as='p'>
                        <Form.Label>Network</Form.Label>
                        <Form.Select
                            value={network}
                            onChange={networkChanged}
                        >
                            <option value='mainnet'>Mainnet</option>
                            <option value='testnet'>Testnet</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group controlId='wallet' as='p'>
                        <Form.Label>Owners</Form.Label>
                        <Form.Control
                            isInvalid={validation.owner}
                            placeholder='Enter a wallet address and press enter' value={owner} onChange={ownerChanged}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    addOwner();
                                }
                            }}
                        />
                        {!validation.owner && <Form.Text muted>Maximum 20 owners</Form.Text>}
                        {validation.owner && <Form.Control.Feedback type='invalid'>{validation.owner}</Form.Control.Feedback>}
                        {owners.length > 0 && (
                            <Table striped bordered hover size='sm' style={{ marginTop: '10px' }}>
                                <tbody>
                                    {owners.map(o => <tr key={o}>
                                        <td><small>{o}</small></td>
                                        <td><Button size='sm' variant='danger' onClick={() => {
                                            deleteOwner(o)
                                        }}>X</Button> </td>
                                    </tr>)}
                                </tbody>
                            </Table>
                        )}
                    </Form.Group>
                    <Form.Group controlId='threshold' as='p'>
                        <Form.Label>Confirmation threshold</Form.Label>
                        <Form.Control
                            isInvalid={validation.threshold}
                            type='number'
                            value={threshold}
                            min={1}
                            max={20}
                            onChange={thresholdChanged}
                        />
                        {validation.threshold && <Form.Control.Feedback type='invalid'>{validation.threshold}</Form.Control.Feedback>}
                    </Form.Group>
                    <Button variant='primary' onClick={deploy}>Deploy</Button>
                </Form>
            </div>
            <div className='deployer-code'>
                <Editor
                    theme='vs-dark'
                    defaultValue={code}
                    value={code}
                />
            </div>
        </div>
    </div>
}

export default Deployer;