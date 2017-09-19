"use strict";

const Bot  = require('slackbots');
const fs   = require('fs');
const path = require('path');

class robotPirat extends Bot {
    constructor(settings) {
        super(settings);
        this.settings = settings;
        this.settings.name = this.settings.name || 'robot-pirat';
        this.user = null;
        this.newUserChannel;
        this.messages = {
            'newUser': fs.readFileSync(
                path.join(__dirname, '..', 'messages', 'newUser.txt')
            ).toString()
        }
    }

    async run() {
        this.newUserChannel = (await this.getChannel("annonceringer")).id;

        this.on('start', this._onStart);
        this.on('message', this._onMessage);

        console.log("Splitte mine bramsejl! Vi er på havet og i gang")
    }

    async _onStart() {
        var self = this;
        this.user = this.users.filter((user) => (user.name == self.name))[0];
    }

    async _onMessage(message) {
        // Her skal du kalde dine funktioner

        switch(true) {
            case message.type === "channel_created":
                this.newChannel(message);
                break;
            case message.type === "member_joined_channel" && message.channel === this.newUserChannel:
                const user = await this.getUserById(message.user)
                this.newUser(user);
                break;
        }

    }

    newChannel(message) {
        let msg = `(Bleep bloop!) Ny flaskepost fra robot-piraten!\n` +
                  `Der er oprettet kanalen <#${message.channel.id}|`  +
                  `${message.channel.name}>\n`                        +
                  `Kig forbi hvis du synes det lyder spændende!`

        this.postMessageToChannel(
            "annonceringer",
            msg,
            {as_user: true, icon_emoji: ':robot_face:'}
        );
    }

    async newUser(user) {
        let msg = await this.replaceChannelNames(this.messages['newUser']);

        this.postMessageToUser(
            user.name,
            msg,
            {as_user: true, icon_emoji: ':robot_face:'}
        );
    }


    async replaceChannelNames(msg) {
        const channelNames = msg.match(/#[a-zA-Z_-]+/g).map(n => n.substr(1))
        const replacements = await Promise.all(
            channelNames.map(name => this.getChannel(name))
        )

        replacements.forEach((replacement, i) => {
            msg = msg.replace(
                new RegExp(`#${channelNames[i]}`, 'g'),
                `<#${replacement.id}|${replacement.name}>`
            )
        })

        return msg;
    }
}

module.exports = robotPirat;