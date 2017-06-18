//
// Handles bet of a single number - "Bet on five"
//

'use strict';
const blackjack = require('../blackjack');
const roulette = require('../roulette');
const slotmachine = require('../slotmachine');

module.exports = {
  handleIntent: function() {
    // Get the stats
    blackjack.getBlackjackText((blackjackText, blackjackResults) => {
      roulette.getRouletteText((rouletteText, rouletteResults) => {
        slotmachine.getSlotsText((slotmachineText, slotResults) => {
        console.log(blackjackResults);
          this.attributes['blackjack'] = blackjackResults;
          this.attributes['roulette'] = rouletteResults;
          this.attributes['slots'] = slotResults;
          this.emit(':ask', blackjackText + ' ' + rouletteText + ' ' + slotmachineText, 'What can I help you with?');
        });
      });
    });
  },
};
