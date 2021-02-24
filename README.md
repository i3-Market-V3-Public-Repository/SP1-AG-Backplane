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

To add more scopes or modify the used configurations, modify the constants found in [open-id-connect.options.ts](./src/auth/open-id-connect.options.ts):
```typescript
// OpenId configuration
export const OPEN_ID_METADATA:ClientMetadata = {
    client_id: process.env.CLIENT_ID as string,
    client_secret: process.env.CLIENT_SECRET as string,
    redirect_uris: [`${getPublicUri()}/auth/openid/callback`],
    application_type: 'web',
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_jwt',
    id_token_signed_response_alg: 'EdDSA',
    scope: 'openid vc'
}
```


## Keycloak

To use Keycloak as an OpenId Connect Provider, you can run it using docker:
```shell script
docker run -p 8080:8443 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -v D:\USUARIS\victor.divi\Development\i3Market\keycloak\keycloak.crt:/etc/x509/https/tls.crt -v D:\USUARIS\victor.divi\Development\i3Market\keycloak\keycloak.key:/etc/x509/https/tls.key -e KEYCLOAK_IMPORT=/tmp/example-realm.json -v D:\USUARIS\victor.divi\Development\i3Market\keycloak\i3-market-realm.json:/tmp/example-realm.json jboss/keycloak
```
Parts:
```shell script
docker run -p 8080:8443 
  -e KEYCLOAK_USER=admin                                      // Adds 'admin' as user
  -e KEYCLOAK_PASSWORD=admin                                  // Adds 'admin' as user password
  -e KEYCLOAK_IMPORT=/tmp/example-realm.json                  // Imports 'i3-Market' realm
  -v .\keycloak\keycloak.crt:/etc/x509/https/tls.crt          // Adds TLS certificate
  -v .\keycloak\keycloak.key:/etc/x509/https/tls.key          // Adds TLS key
  -v .\keycloak\i3-market-realm.json:/tmp/example-realm.json  // Adds 'i3-Market' realm file
  jboss/keycloak    
```

The created realm has no users, so some will have to be created using the [Keycloak admin console](https://localhost:8080/auth/admin/master/console).


## Environment Variables
```shell
CLIENT_ID = <client_id_openid>
CLIENT_SECRET = <client_secret_openid>
PUBLIC_URI = https://localhost:3000 (optional)
PORT = 3000 (optional)
PROVIDER_URI = https://oidc.i3m.gold.upc.edu
```