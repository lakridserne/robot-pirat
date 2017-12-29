'use strict';
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser')
const https = require('https')

class roboServer {
    constructor(settings) {
        this.app = express();
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.PORT = settings.PORT || 8080;
        this.roboPirate = settings.roboPirate ?
            settings.roboPirate : console.error("Robot ikke fundet");
        this.userToken = settings.userToken;
        this._joinChannels = settings.joinChannels;
    }

    handleInvite(req, res, roboPirate) {
        if (req.body.name && req.body.email){
            roboPirate.requestInvite(req.body);
            res.end("<meta charset='UTF-8'>Du er nu inviteret. Vent på at du bliver accepteret og tjek din mailboks.");
        } else {
            res.end(`<meta charset='UTF-8'>
                    Vi har lavet en fejl. Prøv venligst igen.<br>
                    <button onclick='window.history.back()'>Tilbage</button>`);
        }

    }

    handleAnswer(req, res, userToken, channels='') {
        const payload = JSON.parse(req.body.payload);
        if(payload.actions[0].value === "yes") {
            res.status(200).send({...payload.original_message, "attachments": [
                {
                    "fallback": "Robot Kaptajnen er i land og ikke i stand til at svare på din forespørgsel. Prøv igen senere.",
                    "callback_id": "allow_member",
                    "color": "#3AA3E3",
                    "text": `:white_check_mark: <@${payload.user.id}> godkendte`
                }
            ]});
            https.get(`https://slack.com/api/users.admin.invite?token=${userToken}&email=${payload.original_message.text.match(/\|([a-zA-Z]*@.*)>/)[1]}&channels=${channels}`)
        } else if (payload.actions[0].value === "no") {
            res.status(200).send({...payload.original_message, "attachments": [
                {
                    "fallback": "Robot Kaptajnen er i land og ikke i stand til at svare på din forespørgsel. Prøv igen senere.",
                    "callback_id": "forbid_member",
                    "color": "#3AA3E3",
                    "text": `:x: <@${payload.user.id}> afviste`
                }
            ]});
        } else {
            res.status(200).send(req.body["original_message"]);
        }

    }

    async run() {
        // Handles invites from the website
        this.app.post('/invite', (req, res) => this.handleInvite(req, res, this.roboPirate));
        // Handles commands sent from Slack
        this.app.post('/command', (req, res) => this.handleAnswer(req, res, this.userToken, this.joinChannels));
        // Starts the server
        this.app.listen(this.PORT)
        // This finds the channels ids that are needed for inviting people
        this.joinChannels = (await Promise.all(this._joinChannels.map(
            ch => this.roboPirate.getChannel(ch)
        ))).map(x => x.id).join(',');
    }
}

module.exports = roboServer;
