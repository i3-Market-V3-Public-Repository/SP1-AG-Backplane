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
#

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