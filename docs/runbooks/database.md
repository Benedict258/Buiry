# Database Operations

## Start PostgreSQL
docker compose up -d postgres

## Connect to PostgreSQL
psql -h localhost -p 5432 -U buiry -d buiry

## Create Tables (when ready)
-- Will be defined when MemWal integration is added

## Backup
pg_dump -h localhost -p 5432 -U buiry buiry > backup.sql

## Restore
psql -h localhost -p 5432 -U buiry buiry < backup.sql

## Start Redis
docker compose up -d redis

## Check Redis
redis-cli ping  # Should return PONG
