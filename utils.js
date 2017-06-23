//
// Utility functions
//

'use strict';

const speechutils = require('alexa-speech-utils')();

module.exports = {
  getAdSummary: function(data, adsPlayed) {
    let i;

    for (i = 0; i < data.Items.length; i++) {
      // Any ads played?
      if (data.Items[i].mapAttr && data.Items[i].mapAttr.M
              && data.Items[i].mapAttr.M.adsPlayed
              && data.Items[i].mapAttr.M.adsPlayed.M) {
        const ads = data.Items[i].mapAttr.M.adsPlayed.M;
        let ad;

        for (ad in ads) {
          if (adsPlayed[ad]) {
            adsPlayed[ad]++;
          } else {
            adsPlayed[ad] = 1;
          }
        }
      }
    }
  },
  getAdText: function(adsPlayed) {
    let ad;
    const adText = [];

    if (adsPlayed) {
      for (ad in adsPlayed) {
        if (ad) {
          // Remove .txt
          let adName = ad.toLowerCase();
          const i = adName.indexOf('.txt');

          if (i > -1) {
            adName = adName.substr(0, i);
          }

          adText.push('the ' + adName + ' ad played ' + adsPlayed[ad] + ' times');
        }
      }
    }

    return speechutils.and(adText);
  },
  getSkillType: function(slots) {
    const skillMapping = {'blackjack': 'blackjack',
      'roulette': 'roulette',
      'slots': 'slots',
      'slot machine': 'slots'};
    let skill;

    if (slots && slots.SkillType && slots.SkillType.value) {
      const skillName = slots.SkillType.value.toLowerCase();

      if (skillMapping[skillName]) {
        skill = skillMapping[skillName];
      }
    }

    return skill;
  },
};
