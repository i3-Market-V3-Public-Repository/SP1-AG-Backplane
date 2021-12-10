FROM node:15
ARG ADD_INTEGRATOR=0
ARG GITLAB_USER
ARG GITLAB_TOKEN
ARG INTEGRATOR_VERSION=1.0.18

RUN if [ "$ADD_INTEGRATOR" = 1 ]; then \
      npm i -g @loopback/cli@2.15.1 && \
      mkdir -p /integrator && \
      curl --request GET "https://$GITLAB_USER:$GITLAB_TOKEN@gitlab.com/api/v4/projects/21002959/packages/generic/integrator/$INTEGRATOR_VERSION/bulk_integrator" --output /integrator/bulk_integrator && \
      chmod +x /integrator/bulk_integrator; \
fi

USER node

RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node package*.json ./

RUN npm install
COPY --chown=node . .

RUN npm run build

CMD [ "node", "." ]