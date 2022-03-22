import { useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { AppConfig, UserSession } from '@stacks/connect-react';
import { showConnect } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data'], document.location.href);

export const userSessionState = atom(new UserSession({ appConfig }));
export const userDataState = atom();
export const authResponseState = atom();

export const useConnect = () => {
  const [userSession] = useAtom(userSessionState);
  const setUserData = useUpdateAtom(userDataState);
  const setAuthResponse = useUpdateAtom(authResponseState);

  const onFinish = async payload => {
    setAuthResponse(payload.authResponse);
    const userData = await payload.userSession.loadUserData();
    setUserData(userData);
  };

  const authOptions = {
    onFinish,
    userSession,
    redirectTo: "/",
    manifestPath: "/manifest.json",
    appDetails: {
      name: "MultiSafe Deployer",
      icon: "/logo400.png",
    },
  };

  const handleOpenAuth = () => {
    showConnect(authOptions);
  };

  const handleSignOut = useCallback(() => {
    userSession?.signUserOut("/");
  }, [userSession]);

  return { handleOpenAuth, handleSignOut, authOptions };
};