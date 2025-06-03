import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';
import config from '../secrets/config';
const poolData = {
  UserPoolId: config.USER_POOL_ID,
  ClientId: config.CLIENT_ID
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
