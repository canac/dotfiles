#!/usr/bin/env bash
# generates .env.staging.local

cru application secrets read --name mpdx_api --keys DB_ENV_POSTGRESQL_DB,DB_ENV_POSTGRESQL_PASS,DB_ENV_POSTGRESQL_USER,DB_PORT_5432_TCP_ADDR,SECRET_KEY_BASE
