//
// Main handler for Alexa slot machine skill
//

'use strict';

const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
const Launch = require('./intents/Launch');
const Ads = require('./intents/Ads');
const Details = require('./intents/Details');

const APP_ID = 'amzn1.ask.skill.924abe38-caee-4ccd-9c6d-812cdff92f5c';

// Handlers for our skill
const handlers = {
  'NewSession': function() {
    this.emit('LaunchRequest');
  },
  'LaunchRequest': Launch.handleIntent,
  'AdIntent': Ads.handleIntent,
  'DetailsIntent': Details.handleIntent,
  'AMAZON.HelpIntent': function() {
    this.emit(':ask', 'What can I help you with?', 'What can I help you with?');
  },
  'Unhandled': function() {
    this.emit(':ask', 'Sorry, I didn\'t get that. What can I help you with?', 'What can I help you with?');
  },
};

exports.handler = function(event, context, callback) {
  AWS.config.update({region: 'us-east-1'});
  const alexa = Alexa.handler(event, context);

  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
