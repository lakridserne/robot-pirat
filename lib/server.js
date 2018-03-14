'use strict';
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser')
const fetch = require('node-fetch');

class roboServer {
    constructor(settings) {
        this.app = express();
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.PORT = settings.PORT || 8080;
        this.roboPirate = settings.roboPirate ?
            settings.roboPirate : console.error("Robot ikke fundet");
        this.userToken = settings.userToken;
        this._childChannels = settings.childChannels;
        this._volunteerChannels = settings.volunteerChannels;
        this.verificationToken = settings.verificationToken;
        this.joinChannels = {}
    }

    handleInvite(req, res, roboPirate) {
        if (req.body.name && req.body.email && req.body.type){
            roboPirate.requestInvite(req.body);
            res.end("Du bliver inviteret hurtigst muligt. Vent " +
                "venligst og tjek din mailboks for svar.");
        } else {
            res.end(`Vi har lavet en fejl. Prøv venligst igen.<br>
                    <button onclick='window.history.back()'>Tilbage</button>`);
        }

    }

    handleAnswer(req, res, userToken, channels, verificationToken) {
        const payload = JSON.parse(req.body.payload);

        // Check if message is really from Slack
        if(payload.token !== verificationToken) {
            console.error("This is not a valid verification token");
            return -1;
        }

        const email = payload.original_message.text.match(/\<mailto:([*])\|/)[1]
        if(payload.actions[0].value === "yes-barn") {
            res.status(200).send({...payload.original_message, "attachments": [
                {
                    "fallback": "Robot Kaptajnen er i land og ikke i stand til at svare" +
                        "på din forespørgsel. Prøv igen senere.",
                    "callback_id": "allow_member",
                    "color": "#3AA3E3",
                    "text": `:white_check_mark: <@${payload.user.id}> godkendte`
                }
            ]});
            fetch(`https://slack.com/api/users.admin.invite?token=${userToken}&channels=${channels.childChannels}&email=${email}&restricted=true`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(x => x.json()).then(console.log).catch(console.log)
        } else if (payload.actions[0].value === "yes-frivillig") {
            res.status(200).send({...payload.original_message, "attachments": [
                {
                    "fallback": "Robot Kaptajnen er i land og ikke i stand til at svare" +
                        "på din forespørgsel. Prøv igen senere.",
                    "callback_id": "allow_member",
                    "color": "#3AA3E3",
                    "text": `:white_check_mark: <@${payload.user.id}> godkendte`
                }
            ]});
            fetch(`https://slack.com/api/users.admin.invite?token=${userToken}&channels=${channels.volunteerChannels}&email=${email}`, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(x => x.json()).then(console.log).catch(console.log)
        } else if (payload.actions[0].value === "no") {
            res.status(200).send({...payload.original_message, "attachments": [
                {
                    "fallback": "Robot Kaptajnen er i land og ikke i stand til at svare" +
                        "på din forespørgsel. Prøv igen senere.",
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
        // This finds the channels ids that are needed for inviting people
        this.childChannels = (await Promise.all(this._childChannels.map(
            ch => this.roboPirate.getChannel(ch).catch(err => this.roboPirate.getGroup(ch))
        ))).map(x => x.id).join(',');
        this.volunteerChannels = (await Promise.all(this._volunteerChannels.map(
            ch => this.roboPirate.getChannel(ch).catch(err => this.roboPirate.getGroup(ch))
        ))).map(x => x.id).join(',');

        this.joinChannels = {
            volunteerChannels: this.volunteerChannels,
            childChannels: this.childChannels
        }

        // Handles invites from the website
        this.app.post('/invite', (req, res) =>
            this.handleInvite(req, res, this.roboPirate));
        // Handles commands sent from Slack
        this.app.post('/command', (req, res) =>
            this.handleAnswer(req, res,
                this.userToken,
                this.joinChannels,
                this.verificationToken
            )
        );
        // Starts the server
        this.app.listen(this.PORT)
    }
}

module.exports = roboServer;
