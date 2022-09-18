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

# syntax=docker/dockerfile:1
ARG flavour=16.14-bullseye-slim

FROM alpine:3.14 as get-integrator
ARG INTEGRATOR_VERSION=2.3.0
ARG GITLAB_USER
ARG GITLAB_TOKEN
RUN apk add curl ca-certificates git
RUN --mount=type=secret,id=GITLAB_USER \
    --mount=type=secret,id=GITLAB_TOKEN \
    mkdir -p /integrator && \
    curl --request GET "https://$(cat /run/secrets/GITLAB_USER || echo $GITLAB_USER):$(cat /run/secrets/GITLAB_TOKEN || echo $GITLAB_TOKEN)@gitlab.com/api/v4/projects/21002959/packages/generic/integrator/$INTEGRATOR_VERSION/bulk_integrator" --output /integrator/bulk_integrator && \
    chmod +x /integrator/bulk_integrator


FROM node:${flavour} as builder
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node package*.json ./
RUN npm install
COPY --chown=node . .
RUN chmod +x ./scripts/* && npm run build


FROM node:${flavour} as with-integrator
ARG LOOPBACK_CLI_VERSION=3.1.0
RUN apt-get -y update && apt-get -y upgrade
RUN npm i -g @loopback/cli@$LOOPBACK_CLI_VERSION
COPY --from=get-integrator --chown=node /integrator/bulk_integrator /integrator/bulk_integrator
COPY --from=builder --chown=node /home/node/app /home/node/app
USER node
WORKDIR /home/node/app
EXPOSE 3000
CMD ./scripts/start_docker_with_integrator.sh


FROM node:${flavour} as base
RUN apt-get -y update && apt-get -y upgrade
COPY --from=builder --chown=node /home/node/app /home/node/app
USER node
WORKDIR /home/node/app
EXPOSE 3000
CMD [ "node", "." ]