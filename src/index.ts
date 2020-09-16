import {ApplicationConfig, BackplaneApplication} from './application';
import * as fs from 'fs';
import * as https from 'https';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new BackplaneApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  const cert = fs.readFileSync('./certificates/cert.pem');
  const key = fs.readFileSync('./certificates/key.key');

  https.globalAgent.options.ca = fs.readFileSync('../greeter-service/certificates/cert.pem');
  https.globalAgent.options.cert = cert;
  https.globalAgent.options.key = key;
  https.globalAgent.options.passphrase = 'pass';

  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        setServersFromRequest: true,
      },
      protocol: 'https',
      minVersion: 'TLSv1.3',
      key: key,
      cert: cert,
      passphrase: 'pass',
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
