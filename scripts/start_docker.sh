#!/bin/bash

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

# If ./specs is not mapped or empty, clone from OAS Repo
if [[ ! -d "specs" ]] || [[ $(ls -A "specs" | wc -l) -eq 0 ]] && [[ -n "$GITLAB_USER" ]] && [[ -n "$GITLAB_TOKEN" ]]; then
  mkdir -p specs && \
  git clone "https://$GITLAB_USER:$GITLAB_TOKEN@gitlab.com/i3-market/code/backplane/backplane-api-gateway/backplane-subsystems-oas" specs; \
fi

# Run integrator and update
if [[ -f "/integrator/bulk_integrator" ]]; then
  /integrator/bulk_integrator . specs && npm run build ;
fi

node .