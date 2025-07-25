import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

const USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID!;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID!;

if (!USER_POOL_ID || !CLIENT_ID) {
  throw new Error("Missing Cognito User Pool ID or Client ID in environment variables");
}

const poolData = {
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

export const signUp = (
  username: string,
  password: string,
  email: string
): Promise<void> => {
  const attributeList = [
    new CognitoUserAttribute({
      Name: "email",
      Value: email,
    }),
  ];

  return new Promise((resolve, reject) => {
    userPool.signUp(username, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      // result?.user contains the user object
      resolve();
    });
  });
};

export const confirmSignUp = (username: string, code: string): Promise<void> => {
  const user = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

export const signIn = (username: string, password: string): Promise<string> => {
  const user = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        resolve(token);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};
