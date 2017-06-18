//
// Handles bet of a single number - "Bet on five"
//

'use strict';

module.exports = {
  handleIntent: function() {
    // Let's see which one they want to read
    const skill = getSkillType(this.event.request.intent.slots);
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

function getSkillType(slots) {
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
}

