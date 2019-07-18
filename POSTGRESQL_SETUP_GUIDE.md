# Setting up PostgreSQL .

## Installing PostgreSQL 10
Open any of the links below and follow the installation instructions.
- [Windows ](https://www.postgresql.org/download/windows/)
- [Mac](https://www.postgresql.org/download/macosx/) (Postgres.app will work!)
- [Linux](https://www.postgresql.org/download/linux/)
- [Heroku](https://devcenter.heroku.com/articles/heroku-postgresql)

##  Set up Seqeulize ORM
- Run `npm install` to install [sequelize](https://www.npmjs.com/package/sequelize) and [sequelize-cli](https://www.npmjs.com/package/sequelize-cli)
- Update the `env` variable `PGUSER` and `PGPASSWORD`(Your Postgres username and password) - these can be left blank if your local database is not secured.
- Run `npx sequelize db:create`
- Then run `npx sequelize db:migrate`
