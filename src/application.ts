import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, CoreTags, createBindingFromClass} from '@loopback/core';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {
  AuthenticationBindings,
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {jwtAuthStrategy} from './auth/jwt.strategy';
import {JWT_DEFAULT_OPTIONS, JWTAuthenticationStrategyBindings} from './auth/jwt.options';
import {localAuthStrategy} from './auth/local.strategy';
import express from 'express';
import cookieParser from 'cookie-parser';
import {JWTSpecEnhancer, LocalSpecEnhancer} from './auth/spec.enhancer';
import {OpenIdConnectAuthenticationStrategy} from './auth/open-id-connect.strategy';

export {ApplicationConfig};

export class BackplaneApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.add(createBindingFromClass(LocalSpecEnhancer));
    this.add(createBindingFromClass(JWTSpecEnhancer));

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.expressMiddleware(express.json);
    this.expressMiddleware(cookieParser);

    // AUTH
    this.component(AuthenticationComponent);
    this.bind(JWTAuthenticationStrategyBindings.DEFAULT_OPTIONS).to(JWT_DEFAULT_OPTIONS);
    this
      .bind('authentication.strategies.basicAuthStrategy')
      .to(localAuthStrategy)
      .tag({
        [CoreTags.EXTENSION_FOR]:
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      });
    this
      .bind('authentication.strategies.jwtAuthStrategy')
      .to(jwtAuthStrategy)
      .tag({
        [CoreTags.EXTENSION_FOR]:
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      });
    registerAuthenticationStrategy(this, OpenIdConnectAuthenticationStrategy);
    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
