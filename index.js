const chalk = require('chalk')
const app = require('./app')

app.listen(app.locals.config.port, () => {
  console.log(chalk`{yellow.bold Streetmix is running!} {white.bold Go here in your browser:} {greenBright.bold http://localhost:${app.locals.config.port}}`)
})
