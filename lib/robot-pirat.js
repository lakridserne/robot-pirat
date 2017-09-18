"use strict";

const Bot = require('slackbots');

class robotPirat extends Bot {
    constructor(settings) {
        super(settings);
        this.settings = settings;
        this.settings.name = this.settings.name || 'robot-pirat';
        this.user = null;
    }

    run(){
        this.on('start', this._onStart);
        this.on('message', this._onMessage);

        console.log("Splitte mine bramsejl! Vi er på havet og i gang")
    }

    _onStart(){
        var self = this;
        this.user = this.users.filter((user) => (user.name == self.name))[0];
    }

    _onMessage(message){
        // Her skal du kalde dine funktioner

        switch(message.type) {
            case "channel_created":
                this.newChannel(message);
                break;
            case "team_join":
                this.newUser(message);
                break;
        }

    }

    newChannel(message){
        const msg = `(Bleep bloop!) Ny flaskepost fra robot-piraten!\n` +
                    `Der er oprettet kanalen <#${message.channel.id}|`  +
                    `${message.channel.name}>\n`                        +
                    `Kig forbi hvis du synes det lyder spændende!`

        this.postMessageToChannel(
            "annonceringer",
            msg,
            {as_user: true, icon_emoji: ':robot_face:'}
        );
    }

    newUser(message){
        const msg = `(Bleep bloop!) Ny flaskepost fra robot-piraten!\n` +
                    `Byd velkommen til <@${message.user['id']}>`

        this.postMessageToChannel(
            "annonceringer",
            msg,
            {as_user: true, icon_emoji: ':robot_face:'}
        );
    }
}

module.exports = robotPirat;