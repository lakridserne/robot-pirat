#!/usr/bin/env node
"use strict";
const path = require('path')
const fs   = require('fs')

const pirateBot  = require(path.join(__dirname, 'lib', 'robot-pirat'));
const roboServer = require(path.join(__dirname, 'lib', 'server'));

const token        = process.env.BOT_API_KEY;
const userToken    = process.env.USER_API_KEY;
const name         = process.env.BOT_NAME;
const PORT         = process.env.PORT;
const joinChannels = JSON.parse(
	fs.readFileSync(path.join(__dirname, 'messages', 'joinChannels.json')));

const roboPirate = new pirateBot({
    token,
    name,
    channel: 'annonceringer',
    inviteChannel: 'testrobot'
});
const server = new roboServer({PORT, roboPirate, userToken, joinChannels});

server.run();
roboPirate.run();