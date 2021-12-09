import {BootMixin} from '@loopback/boot';
import {addExtension, ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {Middleware, RestApplication, RestBindings} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {AuthenticationBindings, AuthenticationComponent} from '@loopback/authentication';
import {JWTAuthStrategyProvider, JWTSpecEnhancer} from './auth/jwt.strategy';
import express from 'express';
import {OpenIdConnectProvider, OpenIdSpecEnhancer} from './auth/open-id-connect.strategy';
import {
  AuthorizationBindings,
  AuthorizationComponent,
  AuthorizationDecision,
  AuthorizationOptions,
  AuthorizationTags,
} from '@loopback/authorization';
import {AuthorizationProvider} from './auth/authorizer.provider';
import { OpenIdConnectAuthenticationStrategyBindings} from './services';
import {OPEN_ID_METADATA, OPEN_ID_WELL_KNOWN_URL} from './auth/open-id-connect.options';
import {CustomSendProvider} from './providers/custom-send.provider';
import {CustomRejectProvider} from './providers/custom-reject.provider';

export {ApplicationConfig};

export class BackplaneApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.bind('config.secrets').to(options.secrets);
    this.bind('config.jwt.key').to(options.jwtKey);

    // Set up the custom sequence
    this.sequence(MySequence);

    this.addMiddleware();

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.expressMiddleware(express.json);
    this.expressMiddleware(express.urlencoded, {extended: false});

    // AUTH
    this.component(AuthenticationComponent);
    addExtension(
      this,
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      JWTAuthStrategyProvider,
      {
        namespace:
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      },
    );

    // WellKnown configuration url
    this.bind(OpenIdConnectAuthenticationStrategyBindings.WELL_KNOWN_URL).to(OPEN_ID_WELL_KNOWN_URL);
    addExtension(
      this,
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      OpenIdConnectProvider,
      {
        namespace:
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      },
    );

    this.bind(OpenIdConnectAuthenticationStrategyBindings.CLIENT_METADATA).to(OPEN_ID_METADATA);

    this.bind(OpenIdConnectAuthenticationStrategyBindings.DEFAULT_OPTIONS).to({
      isLoginEndpoint: false,
    });

    const authorizationOptions: AuthorizationOptions = {
      precedence: AuthorizationDecision.DENY,
      defaultDecision: AuthorizationDecision.DENY,
    };

    this.configure(AuthorizationBindings.COMPONENT).to(authorizationOptions);
    this.component(AuthorizationComponent);

    this.bind('authorizationProviders.authorization-provider')
      .toProvider(AuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);

    this.add(createBindingFromClass(JWTSpecEnhancer));
    this.add(createBindingFromClass(OpenIdSpecEnhancer));

    //Bind custom sender
    this.bind(RestBindings.SequenceActions.SEND).toProvider(CustomSendProvider);
    this.bind(RestBindings.SequenceActions.REJECT).toProvider(CustomRejectProvider);
    this.bind(RestBindings.ERROR_WRITER_OPTIONS).to({safeFields: ['responseBody']});

    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  private addMiddleware() {
    const log: Middleware = async (middlewareCtx, next) => {
      const {request} = middlewareCtx;
      console.log('Request: %s %s', request.method, request.originalUrl);
      try {
        const result = await next();
        console.log(
            'Response: %s %s ',
            request.method,
            request.originalUrl,
        );
        return result;
      } catch (err) {
        console.error(
            'Error received for %s %s',
            request.method,
            request.originalUrl,
        );
        throw err;
      }
    };

    this.middleware(log);
  }
}