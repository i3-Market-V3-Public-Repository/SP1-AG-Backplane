/*
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
*/

import {ApplicationConfig, BackplaneApplication} from './application';
import * as fs from 'fs';
import {OASModifier} from './utils/OASModifier';


export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const disableOptimizer = process.env.DISABLE_SERVER_OPTIMIZER
  if (disableOptimizer == null || !disableOptimizer) {
    await OASModifier.optimizeServers();
  }
  const app = new BackplaneApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);

  return app;
}

function getSecrets() {
  const secretsPath = process.env.SECRETS_PATH ?? './.secrets.json';
  try {
    return JSON.parse(fs.readFileSync(secretsPath).toString());
  } catch (e) {
    return {}
  }
}

if (require.main === module) {
  const secrets = getSecrets()

  // const certificatesPath = process.env.CERTS_PATH ?? './certificates';
  // const cert = fs.readFileSync(`${certificatesPath}/cert.crt`);
  // const key = fs.readFileSync(`${certificatesPath}/key.key`);
  // const caCert = fs.readFileSync(`${certificatesPath}/ca-cert.crt`);
  //
  // https.globalAgent.options.ca = caCert;
  // https.globalAgent.options.cert = cert;
  // https.globalAgent.options.key = key;
  // https.globalAgent.options.rejectUnauthorized = false;

  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        setServersFromRequest: true,
      },
      protocol: 'http',
      // minVersion: 'TLSv1.3',
      // key: key,
      // cert: cert,
      // ca: caCert,
      // rejectUnauthorized: false,
    },
    secrets: secrets,
    jwtKey: 'hey' //key
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}