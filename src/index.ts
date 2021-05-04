import {ApplicationConfig, BackplaneApplication} from './application';
import * as fs from 'fs';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
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
