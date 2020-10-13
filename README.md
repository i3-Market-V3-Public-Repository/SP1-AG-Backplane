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
The command will ask for several pieces of information, all can be skipped, but for [Mutual TLS](#enable-mutual-tls) to work, 
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
