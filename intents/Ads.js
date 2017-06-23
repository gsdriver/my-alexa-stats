//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Let's see which one they want to read
    const skill = utils.getSkillType(this.event.request.intent.slots);
    let speech;
    const reprompt = 'What else can I help with?';

    if (!skill) {
      speech = 'Sorry, I didn\'t understand the skill name. ';
    } else {
      speech = 'For your ' + skill + ' skill ' + this.attributes[skill].adsPlayed;
    }

    this.emit(':ask', speech, reprompt);
  },
};


