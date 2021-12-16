#!/bin/bash

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