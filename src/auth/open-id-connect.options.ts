/* eslint-disable @typescript-eslint/naming-convention */
import {ClientMetadata} from "openid-client";
import {getPublicUri} from "./auth.options";

export const OPEN_ID_METADATA:ClientMetadata = {
    client_id: process.env.CLIENT_ID as string,
    client_secret: process.env.CLIENT_SECRET as string,
    redirect_uris: [`${getPublicUri()}/auth/openid/callback`],
    application_type: 'web',
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_jwt',
    id_token_signed_response_alg: 'EdDSA',
}



