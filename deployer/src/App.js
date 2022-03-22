import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from 'react-bootstrap';
import { Connect } from '@stacks/connect-react';
import Deployer from './Pages/Deployer';

import "./App.scss";

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
        <div className='landing'>
          <div className='landing-brand'> <span className='brand-primary'>MultiSafe</span> deployer</div>
          <Button onClick={handleOpenAuth}>Connect Hiro Wallet</Button>
        </div>
      </Connect>
    );
  }

  if (userData) {
    return <Connect authOptions={authOptions}><Deployer userData={userData} /></Connect>
  }

  return null;
}

export default App;
