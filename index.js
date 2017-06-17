//
// Main handler for Alexa slot machine skill
//

'use strict';

const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
const blackjack = require('./blackjack');
const roulette = require('./roulette');
const slotmachine = require('./slotmachine');

const APP_ID = 'amzn1.ask.skill.924abe38-caee-4ccd-9c6d-812cdff92f5c';

// Handlers for our skill
const handlers = {
  'NewSession': function() {
    // I don't really respond to anything - just spit out stats
    blackjack.getBlackjackText((blackjackText) => {
      roulette.getRouletteText((rouletteText) => {
        slotmachine.getSlotsText((slotmachineText) => {
          this.emit(':tell', blackjackText + ' ' + rouletteText + ' ' + slotmachineText);
        });
      });
    });
  },
  'AMAZON.HelpIntent': function() {
    this.emit(':tell', 'Just say open');
  },
};

exports.handler = function(event, context, callback) {
  AWS.config.update({region: 'us-east-1'});
  const alexa = Alexa.handler(event, context);

  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
