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

## Running on Heroku
Provision the Heroku Postgres addon first.

```
heroku run npx sequelize db:migrate --app <heroku app id>
```
you DO NOT need to run db:create; in fact you cannot, and Heroku will give you a permission denied error as you do not have permissions to do create your own db. Heroku will create your db when you provision the add-on. the database name is outside of your control (random string, not whatever you want to set it as)

note that this actually runs sequelize cli exposed under the sequelize-cli package, which is located in deps (not devvdeps)

Undocumented verbose output via this env var:
DEBUG=sequelize* 

so you can see exactly what is going on w/ heroku by running:
heroku run 'DEBUG=sequalize* npx sequelize db:migrate' --app <heroku app id>
note the quotes around the command

