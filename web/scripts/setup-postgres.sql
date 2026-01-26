-- Setup script for MFAI PostgreSQL database
-- Run as postgres superuser: sudo -u postgres psql -f setup-postgres.sql

-- Create user
CREATE USER mfai_user WITH PASSWORD 'mfai_password';

-- Create database
CREATE DATABASE mfai_db OWNER mfai_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mfai_db TO mfai_user;

-- Connect to the database and grant schema privileges
\c mfai_db
GRANT ALL ON SCHEMA public TO mfai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mfai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mfai_user;
