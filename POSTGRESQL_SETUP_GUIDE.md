# Setting up PostgreSQL .

## Installing PostgreSQL 10
Open any of the links below and follow the installation instructions.
- [Windows ](https://www.postgresql.org/download/windows/)
- [Mac](https://www.postgresql.org/download/macosx/)
- [Linux](https://www.postgresql.org/download/linux/)
- [Heroku](https://devcenter.heroku.com/articles/heroku-postgresql)

##  Set up Seqeulize ORM
- Run  `npm install` to install [sequelize](https://www.npmjs.com/package/sequelize) and [sequelize-cli](https://www.npmjs.com/package/sequelize-cli)
- Update the `env` variable `PG_USERNAME` and `PG_PASSWORD`(Your Postgres username and password) 
- From the terminal, navigate to the `app/db/` 
- Run `node_modules/.bin/sequelize init:migration`
