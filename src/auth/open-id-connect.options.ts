/* eslint-disable @typescript-eslint/naming-convention */
import {ClientMetadata} from "openid-client";


export const OPEN_ID_METADATA: ClientMetadata = {
    client_id: process.env.OIDC_CLIENT_ID as string,
    client_secret: process.env.OIDC_CLIENT_SECRET as string,
    redirect_uris: [`${process.env.PUBLIC_URI}/auth/openid/callback`],
    application_type: 'web',
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_jwt',
    id_token_signed_response_alg: 'EdDSA',
    scope: 'openid vc'
}

export const OPEN_ID_WELL_KNOWN_URL = process.env.OIDC_PROVIDER_WELL_KNOWN_URL;



