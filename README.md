# i3-Market Backplane API

## Setup

Clone the repository, and download the dependencies:

```shell script
git clone git@gitlab.com:i3-market/code/wp4/backplane.git
cd backplane
npm install
```

### Enable HTTPS

To enable HTTPS during development, you need to generate a TLS certificate. There are two options available.

#### Obtain certificates from i3-Market dummy CA

A dummy Certificate Authority has been created to generate TLS certificates.

This CA can be found at [Gitlab](https://gitlab.com/i3-market/code/wp4/certificate-authority). 
To use it, follow the instructions found in the CA README.

Put the generated certificates at the [certificates folder](./certificates), 
with the names `cert.crt` and `key.key` for the certificate and key respectively.

#### Generate self-signed certificates

The second option is to generate a self-signed certificate using [openSSL](https://www.openssl.org/).

The following line will create a private key and certificate pair and put them in a folder called `certificates`. 
This folder is already included in the [.gitignore](.gitignore), so they won't be uploaded to the git repository.
The command will ask for several pieces of information, all can be skipped, but for Mutual TLS to work, 
enter `localhost` as the `Common Name (CN)`:

```bash
openssl req -x509 -newkey rsa:4096 -keyout ./certificates/key.key -out ./certificates/cert.crt
```


## Run the Backplane

From the project root directory, run the following command:
```shell script
npm start
```

The Backplane will start listening on port `3000`.


## OpenId Connect configuration

To set the openId provider, modify the `wellKnownUrl` variable in [application.ts](./src/application.ts) to the correct url for the desired OpenId Connect Provider.

```typescript
    //...
    // Keycloak WellKnown configuration url
    const wellKnownUrl = 'https://localhost:8080/auth/realms/i3-Market/.well-known/openid-configuration'; //<--This variable
    this.bind('authentication.oidc.well-known-url').to(wellKnownUrl);
    addExtension(
      this,
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      OpenIdConnectProvider,
      {
        namespace:
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      },
    );
    //...
```

To add more scopes or modify the used configurations, modify the constants found in [open-id-connect.strategy.ts](./src/auth/open-id-connect.strategy.ts):
```typescript
// OpenId configuration
const CLIENT_ID = 'Backplane';
const CALLBACK_URI = 'https://localhost:3000/auth/openid/callback';
const RESPONSE_TYPE = 'code';
const SCOPE = 'openid roles'; // <-- to add roles
```
