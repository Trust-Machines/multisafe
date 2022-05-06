import axios from 'axios';
import {
    AnchorMode,
    broadcastTransaction,
    makeContractCall,
    PostConditionMode,
    SignedContractCallOptions,
    uintCV
} from '@stacks/transactions';
import {StacksMainnet} from '@stacks/network';
import {assertEnvVars} from './util';