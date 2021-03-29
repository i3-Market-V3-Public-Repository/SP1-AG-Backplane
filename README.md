# i3-Market Backplane API

## Setup

Clone the repository, and download the dependencies:

```shell script
git clone git@gitlab.com:i3-market/code/wp4/backplane.git
cd backplane
npm install
```

### Enable HTTPS

By default, the Backplane has TLS active, and so it requires certificates to be run.
You have two options:

- Get TLS certificates  
  For that purpose, a dummy Certificate Authority has been created to generate TLS certificates.

  This CA can be found at [Gitlab](https://gitlab.com/i3-market/code/wp4/certificate-authority).
  To use it, follow the instructions found in the CA README.
  
  Put the generated certificates in a folder called `certificates` at the project root (same level as this README),
  with the names `cert.crt` and `key.key` for the certificate and key respectively.
  You will also need to add the CA certificate to this same folder (available [here](https://gitlab.com/i3-market/code/wp4/certificate-authority/-/blob/master/certificates/ca-cert.crt)), with the name `ca-cert.crt`.


- Disable HTTPS  
  To do that, make the following changes in [src/index.ts](src/index.ts):
  ```typescript
  if (require.main === module) {
    const secretsPath = process.env.SECRETS_PATH ?? './.secrets.json';
    const secrets = JSON.parse(fs.readFileSync(secretsPath).toString());
  
    // ---------------- Comment or delete from here ----------------
    const certificatesPath = process.env.CERTS_PATH ?? './certificates';
    const cert = fs.readFileSync(`${certificatesPath}/cert.crt`);
    const key = fs.readFileSync(`${certificatesPath}/key.key`);
    const caCert = fs.readFileSync(`${certificatesPath}/ca-cert.crt`);
  
    https.globalAgent.options.ca = caCert;
    https.globalAgent.options.cert = cert;
    https.globalAgent.options.key = key;
    https.globalAgent.options.rejectUnauthorized = false;
    // ---------------------------- To here ----------------------------
  
    const config = {
      rest: {
        port: +(process.env.PORT ?? 3000),
        host: process.env.HOST,
        gracePeriodForClose: 5000, // 5 seconds
        openApiSpec: {
          setServersFromRequest: true,
        },
        protocol: 'https',                      //Change to http
        minVersion: 'TLSv1.3',                  //Comment or remove line
        key: key,                               //Comment or remove line
        cert: cert,                             //Comment or remove line
        ca: caCert,                             //Comment or remove line
        rejectUnauthorized: false,
      },
      secrets: secrets
    };
    main(config).catch(err => {
      console.error('Cannot start the application.', err);
      process.exit(1);
    });
  }
  ```

### Subsystems secrets

If you haven't integrated any subsystem with the Backplane or you have integrated a subsystem using the Subsystem Integration Tool in this project, skip this step.

The Backplane needs a secret for each subsystem integrated with it, and these secrets must be provided through a file
named `.secrets.json`, located in the project root (same level as this README).  
This file must contain a single object, with key-value pairs corresponding to the subsystems name and its secret:
```json
{
  "<Subsystem name>": "<Subsystem secret>",
  "greeter": "jasghfjwgifxguiwegmfgmwzuiegmfiu"
}
```

### OpenId Connect configuration

To be able to authenticate to the Backplane, you will need to register the Backplane as a client (Relying party) for the desired OIDC provider. Do that first and then come back.  
Once registered as a Relying party, set the three following environment variables:
- `OIDC_CLIENT_ID`  
  Client ID of the Backplane in the OIDC Provider, obtained when registering the Backplane.
  

- `OIDC_CLIENT_SECRET`  
  Client secret of the Backplane in the OIDC Provider, obtained when registering the Backplane.
  

- `OIDC_PROVIDER_WELL_KNOWN_URL`  
  URL of the well-knwon endpoint of the OIDC Provider (it should end in `.well-known/openid-configuration`)


#### Keycloak

If, for development purposes, you want to use a local OpenId Connect provider, you can use the docker image of Keycloak with the following command:
```shell script
docker run -p 8080:8443 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -v .\keycloak\keycloak.crt:/etc/x509/https/tls.crt -v .\keycloak\keycloak.key:/etc/x509/https/tls.key -e KEYCLOAK_IMPORT=/tmp/example-realm.json -v .\i3Market\keycloak\i3-market-realm.json:/tmp/example-realm.json jboss/keycloak
```
Parts:
```shell script
docker run 
  -p 8080:8443                                                // Port mapping, the docker will listen on port 8080 
  -e KEYCLOAK_USER=admin                                      // Adds 'admin' as user
  -e KEYCLOAK_PASSWORD=admin                                  // Adds 'admin' as user password
  -e KEYCLOAK_IMPORT=/tmp/example-realm.json                  // Imports 'i3-Market' realm
  -v .\keycloak\keycloak.crt:/etc/x509/https/tls.crt          // Adds TLS certificate
  -v .\keycloak\keycloak.key:/etc/x509/https/tls.key          // Adds TLS key
  -v .\keycloak\i3-market-realm.json:/tmp/example-realm.json  // Adds 'i3-Market' realm file
  jboss/keycloak                                              // Name of the docker image
```

The created realm has no users, so some will have to be created using the [Keycloak admin console](https://localhost:8080/auth/admin/master/console).

Then set the `OIDC_PROVIDER_WELL_KNOWN_URL` env variable to the proper value (if followed the instructions above, 
it should be `https://localhost:8080/auth/realms/i3-Market/.well-known/openid-configuration`)

## Environment Variables
The following list shows the different environment variables the Backplane uses
```shell
# OIDC ENV VARIABLES
OIDC_CLIENT_ID=<Backplane's OIDC client Id>
OIDC_CLIENT_SECRET=<Backplane's OIDC client >
OIDC_PROVIDER_WELL_KNOWN_URL=<OIDC Provider well-known url>

# BACKPLANE ENV VARIABLES
PUBLIC_URI=<Backplane's public uri>
PORT=<Backplane's public port>(3000)
HOST=<Backplane's listening host>(0.0.0.0)

# Only set if you have created the `certificates` folder in a different location (defaults to ./certificates)
CERTS_PATH=<Path to the certificates directory>
# You probably won't have to set that one never
SECRETS_PATH=<Path to the secrets file>
```

## Run the Backplane

From the project root directory, run the following command:
```shell script
npm start
```

The Backplane will start listening on port `3000`.

## Running the Backplane with docker

You can use docker compose to run the backplane.  
To do so, follow the same setup instructions as above, and create a file called `.env` placed at the project root directory (same level as this README), containing all the necessary environment variables.
A template is provided ([.env.template](.env.template)) for ease.

Then, just build and run using:
```shell
docker-compose build
docker-compose up
```
