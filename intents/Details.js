//
// Handles details about a specific skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Let's see which one they want to read
    const skill = utils.getSkillType(this.event.request.intent.slots);
    let speech = '';
    const reprompt = 'What else can I help with?';
    let mySkill;

    if (!skill) {
      speech = 'Sorry, I didn\'t understand the skill name. ';
    } else {
      mySkill = this.attributes[skill];
      if (skill == 'blackjack') {
        speech = 'For blackjack there are ' + mySkill.players + ' players with ' + mySkill.rounds + ' sessions.';
      } else if (skill == 'roulette') {
        let game;
        for (game in mySkill) {
          if (game && (game !== 'adsPlayed')) {
            speech += (game + ' has ' + mySkill[game].players + ' players with ' + mySkill[game].spins + ' spins. ');
          }
        }
      } else {
        let game;
        for (game in mySkill.results) {
          if (game) {
            const hand = mySkill.results[game];

            speech += (game + ' has ' + hand.players + ' players with ' + hand.totalSpins + ' spins');
            if (hand.coins) {
              speech += (' and ' + hand.coins + ' coins played. ');
            } else {
              speech += '. ';
            }
          }
        }
      }
    }

    this.emit(':ask', speech, reprompt);
  },
};

