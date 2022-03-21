import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from 'react-bootstrap';
import { Connect } from '@stacks/connect-react';
import Deployer from './Pages/Deployer';
import { Router, Link } from '@reach/router';

import "./App.scss";

// import { makeSafeContract } from "multisafe-contracts";
// import safe from "multisafe-contracts/contracts/safe.clar";

import { userDataState, userSessionState, useConnect } from './lib/auth';

function App() {

  const { authOptions, handleOpenAuth, handleSignOut } = useConnect();
  const [userSession] = useAtom(userSessionState);
  const [userData, setUserData] = useAtom(userDataState);

  const authenticated = userSession && userSession.isUserSignedIn();

  useEffect(() => {
    if (userSession?.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn();
    }
  }, [userSession, setUserData]);

  if (!authenticated) {
    return (
      <Connect authOptions={authOptions}>
        <Button onClick={handleOpenAuth}>Connect Hiro Wallet</Button>
      </Connect>
    );
  }

  //console.log(userData?.profile.stxAddress)

  if (userData) {
    return <Deployer path="/" userData={userData} />

  }

  return null;

  /*
  return (
    <Button onClick={handleSignOut}>Exit</Button>
  );
  */
}

export default App;
