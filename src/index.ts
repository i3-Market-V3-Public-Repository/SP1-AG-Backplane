import {ApplicationConfig, BackplaneApplication} from './application';
import * as https from 'https';
import * as fs from 'fs';

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
  const cert = fs.readFileSync('./certificates/cert.crt');
  const key = fs.readFileSync('./certificates/key.key');

 // https.globalAgent.options.ca = fs.readFileSync('./certificates/ca-cert.crt'); TODO set ca-cert and uncomment
  https.globalAgent.options.cert = cert;
  https.globalAgent.options.key = key;
  https.globalAgent.options.rejectUnauthorized = false;

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
     // ca: fs.readFileSync('./certificates/ca-cert.crt'), TODO set ca-cert and uncomment
      rejectUnauthorized: false,
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}

export const PUBLIC_URI:string = process.env.PUBLIC_URI ?? `https://localhost:${process.env.PORT as string}`;