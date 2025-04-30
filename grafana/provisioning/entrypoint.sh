#!/bin/sh

echo "[entrypoint] Substituting variables in datasource template"

sed -e "s|DB_NAME|${DB_NAME}|g" \
    -e "s|DB_USER|${DB_USER}|g" \
    -e "s|DB_PASSWORD|${DB_PASSWORD}|g" \
    /etc/grafana/provisioning/datasources/datasources.template.yaml \
    > /etc/grafana/provisioning/datasources/datasources.yaml

echo "[entrypoint] Starting Grafana"
/run.sh
