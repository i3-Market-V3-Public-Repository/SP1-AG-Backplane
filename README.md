<!---
#  Copyright 2020-2022 i3-MARKET Consortium:
#
#  ATHENS UNIVERSITY OF ECONOMICS AND BUSINESS - RESEARCH CENTER
#  ATOS SPAIN SA
#  EUROPEAN DIGITAL SME ALLIANCE
#  GFT ITALIA SRL
#  GUARDTIME OU
#  HOP UBIQUITOUS SL
#  IBM RESEARCH GMBH
#  IDEMIA FRANCE
#  SIEMENS AKTIENGESELLSCHAFT
#  SIEMENS SRL
#  TELESTO TECHNOLOGIES PLIROFORIKIS KAI EPIKOINONION EPE
#  UNIVERSITAT POLITECNICA DE CATALUNYA
#  UNPARALLEL INNOVATION LDA
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
-->

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
      }
    };
    main(config).catch(err => {
      console.error('Cannot start the application.', err);
      process.exit(1);
    });
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
  
You can use the [Node OIDC Provider of WP3](https://gitlab.com/i3-market/code/wp3/t3.1-self-sovereign-identity-and-access-management/node-oidc-provider).  
A deployed version is available at (https://oidc.i3m.gold.upc.edu/)[https://oidc.i3m.gold.upc.edu/].

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
# Optional - Disable de smart subsystem's server election on startup
DISABLE_SERVER_OPTIMIZER=true
```

## Run the Backplane

From the project root directory, run the following command:
```shell script
npm start
```

The Backplane will start listening on port `3000`.

## Running the Backplane with docker locally

You can use docker compose to run the backplane.  
To do so, follow the same setup instructions as above, and create a file called `.env` placed at the project root directory (same level as this README), containing all the necessary environment variables.
A template is provided ([.env.template](.env.template)) for ease.

If your certificates folder or the secrets.json file is not located at the root directory of the projecte, modify the 
corresponding paths in the [docker-compose.yaml](docker-compose.yaml) to the correct ones.

Then, just build and run using:
```shell
docker-compose build
docker-compose up
```

### Backplane with integrator
Backplane Dockerfile allows including the integrator executable providing on demand OAS integration.
[docker-compose.yaml](docker-compose.yaml) defines the service *backplane-with-integrator* as an example. It includes
the integrator during bulding phase, following the entrypoint checks if there is any OAS inside backplane container 
`/home/node/app/specs` directory. If so, the integrator will be executed following the server, otherwise the integration
phase will be skipped.
#### Dockerfile Build Variables

* <b>GITLAB_USER</b>: Deploy user used for downloading the integrator manager executable
* <b>GITLAB_TOKEN</b>: Deploy token used for downloading the integrator manager executable
* <b>INTEGRATOR_VERSION</b>: Integrator manager version to use 
  * Optional, by default: 1.0.18

#### Use cases
* <b>Integrate specified OAS and run the Backplane</b>:
  * Mount your local OAS specs directory to `/home/node/app/specs` container's path (use docker bind mount)

## Remote images
You can find the remote images in the public repositories managed by the consortium (Gitlab and Nexus). Currently, there are 2 flavours available:
 - major.minor.patch
 - major.minor.path-with-integrator

Both include the latest OAS files, whereas the `-with-integrator` version it also includes 
 the latest integrator executable available compatible with the current backplane version 
 (located inside `/integrator/`). 

## Further Information

## Contributing

## License
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.