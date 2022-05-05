/*

Fichier SQL associé à la création de la base de données et des schema de base 
Ce fichier est appelé par 01-CreationBDD.sh

Création user / BD :
prod: u_aaq_prod / aaq_prod
preprod : u_aaq_preprod / aaq_preprod
Integ: u_aaq_integ / aaq_integ

Dev: u_aaq_dev / aaq_dev

*/

create database aaq_dev;

create schema data;

-- creation du user
create user u_aaq_dev WITH password 'A@kou@t1k!';
-- CREATE ROLE

grant all privileges on schema data to u_aaq_dev;

ALTER DEFAULT PRIVILEGES IN SCHEMA data
    GRANT INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLES
    TO u_aaq_dev;

-- Grant pour le user srav_dev
GRANT USAGE ON SCHEMA data TO u_aaq_dev;
-- GRANT

 grant all privileges on schema data to u_aaq_dev;
-- GRANT

set search_path = data;
