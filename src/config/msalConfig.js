export const msalConfig = {
  auth: {
    clientId: "TU_CLIENT_ID_AQUI", // Lo obtendremos en el siguiente paso
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Mail.Send"],
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphMailEndpoint: "https://graph.microsoft.com/v1.0/me/sendMail",
};

