#!/bin/bash
dropdb artbrowser_dev
createdb artbrowser_dev
npm run knex migrate:latest
npm run knex seed:run

