#!/bin/bash
# When deploying to Heroku, run "release phase" tasks. These tasks occur after
# a build but before finishing deployment. If tasks fail here, the deployment
# will be cancelled. See more:
# https://devcenter.heroku.com/articles/release-phase#design-considerations

# Migrate Postgres database
npx sequelize db:migrate
