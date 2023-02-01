#!/bin/bash

base_dir="container-volumes"
dirs=( "db-customer/data" "db-products/data" "db-shopping/data" "rabbitmq/data" "rabbitmq/logs" )

for dir in "${dirs[@]}"; do
  mkdir -pv "$base_dir/$dir"
done
