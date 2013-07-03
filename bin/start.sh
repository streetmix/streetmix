#!/bin/bash

if [[ -z $NODE_ENV || $NODE_ENV == 'development' ]]; then 
    supervisor --ignore public/js/*.AUTO.js server.js
else
    node server.js
fi