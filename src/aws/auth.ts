import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';
const USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
if (!USER_POOL_ID || !CLIENT_ID) {
  throw new Error("Missing Cognito User Pool ID or Client ID in environment variables");
}
const poolData = {
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID
};

const userPool = new CognitoUserPool(poolData);

export const signIn = (username: string, password: string): Promise<any> => {
  const user = new CognitoUser({
    Username: username,
    Pool: userPool
  });

  const authDetails = new AuthenticationDetails({
    Username: username,
    Password: password
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        resolve(token);
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  });
};
