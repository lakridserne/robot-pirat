#!/usr/local/bin/node

"use strict";

var pirateBot = require("../lib/robot-pirat");


var token = process.env.BOT_API_KEY;
var name  = process.env.BOT_NAME;

var roboPirate = new pirateBot({token : token, name : name})


roboPirate.run();
