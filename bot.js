#!/usr/local/bin/node
"use strict";

const path = require('path')
const pirateBot = require(path.join(__dirname, 'lib', 'robot-pirat'));


const token = process.env.BOT_API_KEY;
const name  = process.env.BOT_NAME;
const roboPirate = new pirateBot({token, name, channel: 'annonceringer'});

roboPirate.run();