var mongoose = require('mongoose'),
    config = require('config')

mongoose.connect(config.db.url)
