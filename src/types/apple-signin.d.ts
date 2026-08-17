type AppleSignInConfig = {
  clientId: string;
  scope: string;
  redirectURI: string;
  state: string;
  nonce: string;
  usePopup: boolean;
};

type AppleSignInResponse = {
  authorization: {
    code: string;
    id_token: string;
    state: string;
  };
  user?: {
    email?: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
};

interface Window {
  AppleID?: {
    auth: {
      init: (config: AppleSignInConfig) => void;
      signIn: () => Promise<AppleSignInResponse>;
    };
  };
}
