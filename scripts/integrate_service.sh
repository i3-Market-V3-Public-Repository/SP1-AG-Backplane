#!/bin/bash

trap "exit 1" TERM
export TOP_PID=$$

to_kebab_case() {
  echo "$1" | sed -r 's/[A-Z]/\L&/g' | sed -r 's/([-_ ]+)([0-9a-z])/-\L\2/g'
}

welcome() {
  echo "Welcome to the i3-Market Service Integration Manager"
}

ask_service_name() {
  echo "Enter the name of the service to integrate" >/dev/tty
  read -r service_name
  service_name=$(to_kebab_case "$service_name")
  if [ -d "./src/services/$service_name" ]; then
    echo "A service named the same is already integrated. Do you want to overwrite it? [y/N]: " >/dev/tty
    read -r confirmation
    if [ "$confirmation" = "Y" ] || [ "$confirmation" = "y" ]; then
      echo "Existing service will be overwritten" >/dev/tty
      rm -rf "./src/controllers/$service_name"
      rm -rf "./src/datasources/$service_name"
      rm -rf "./src/models/$service_name"
      rm -rf "./src/repositories/$service_name"
      rm -rf "./src/services/$service_name"
    else
      echo "Operation aborted" >/dev/tty
      kill -s TERM $TOP_PID
    fi
  fi
  echo "$service_name"
}

create_integration_files() {
  echo "Enter the OpenAPI spec url or file path: "
  read -r path
  if output=$(lb4 openapi "$path" --client --yes --datasource="$1" 2>&1); then
    mkdir "./src/controllers/$service_name"
    mkdir "./src/datasources/$service_name"
    mkdir "./src/models/$service_name"
    mkdir "./src/repositories/$service_name"
    mkdir "./src/services/$service_name"
    create_lines=$(echo "$output" | grep "create")
    for line in $create_lines; do
      if ! [ "$line" = "create" ]; then
        mv "$line" ""
        fi
    done
  else
    echo "Something went wrong"
  fi
}

welcome
service_name=$(ask_service_name)
create_integration_files "$service_name"
