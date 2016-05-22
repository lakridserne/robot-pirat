"use strict";

var util = require('util');
var Bot = require('slackbots');


var robotPirat = function Constructor(settings){
    this.settings = settings;
    this.settings.name = this.settings.name || 'robot-pirat';

    this.user = null;

    this.run = function(){
        robotPirat.super_.call(this, this.settings);

        this.on('start', this._onStart);
        this.on('message', this._onMessage);
    }

    this._onStart = function (){
        var self = this;
        this.user = this.users.filter(
            function(user){return user.name == self.name;}
        )[0];
    }

    this._onMessage = function(message){
        if(message.type === "channel_created"){
            this.newChannel(message);
        }
        // Her skal du kalde dine funktioner

    }

    this.newChannel = function(message){
        var msg = "Bip bip!, ny flaksepost fra robot-piraten!\n"
        msg += "Der er lige blevet opretet en #" + message.channel.name;
        msg += " tråd.\n Kig forbi hvis du synes det lyder spændende!";
        this.postMessageToChannel("annonceringer", msg, {as_user: true});
    }
    // Her kan du tilføje dine funktioner
}




util.inherits(robotPirat, Bot);

module.exports = robotPirat;
