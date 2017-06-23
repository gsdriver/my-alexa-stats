//
// Utility functions
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const utils = require('./utils');

module.exports = {
  // Generates the text for blackjack e-mail summary
  getRouletteText: function(callback) {
    const american = {spins: 0, players: 0};
    const european = {spins: 0, players: 0};
    const tournament = {spins: 0, players: 0};
    const adsPlayed = {};
    let spins;
    let text;

    // Loop thru to read in all items from the DB
    (function loop(firstRun, startKey) {
      const params = {TableName: 'RouletteWheel'};

      if (firstRun || startKey) {
        params.ExclusiveStartKey = startKey;

        const scanPromise = dynamodb.scan(params).promise();
        return scanPromise.then((data) => {
          // OK, let's see where you rank among American and European players
          let i;

          utils.getAdSummary(data, adsPlayed);
          for (i = 0; i < data.Items.length; i++) {
             if (data.Items[i].mapAttr && data.Items[i].mapAttr.M) {
               if (data.Items[i].mapAttr.M.highScore
                    && data.Items[i].mapAttr.M.highScore.M) {
                 // This is the old format

                 // Only counts if they spinned
                 const score = data.Items[i].mapAttr.M.highScore.M;
                 if (score.spinsAmerican && score.spinsAmerican.N) {
                   spins = parseInt(score.spinsAmerican.N);
                   american.spins += spins;
                   if (spins) {
                     american.players++;
                   }
                 }

                 if (score.spinsEuropean && score.spinsEuropean.N) {
                   spins = parseInt(score.spinsEuropean.N);
                   european.spins += spins;
                   if (spins) {
                     european.players++;
                   }
                 }
               } else {
                 let scoreData;

                 if (data.Items[i].mapAttr.M.american && data.Items[i].mapAttr.M.american.M) {
                   // This is the new format
                   scoreData = data.Items[i].mapAttr.M.american.M;

                   if (scoreData.spins && scoreData.spins.N) {
                     spins = parseInt(scoreData.spins.N);
                     american.spins += spins;
                     if (spins) {
                       american.players++;
                     }
                   }
                 }

                 if (data.Items[i].mapAttr.M.european && data.Items[i].mapAttr.M.european.M) {
                   // This is the new format
                   scoreData = data.Items[i].mapAttr.M.european.M;

                   if (scoreData.spins && scoreData.spins.N) {
                     spins = parseInt(scoreData.spins.N);
                     european.spins += spins;
                     if (spins) {
                       european.players++;
                     }
                   }
                 }

                 if (data.Items[i].mapAttr.M.tournament && data.Items[i].mapAttr.M.tournament.M) {
                   // This is the new format
                   scoreData = data.Items[i].mapAttr.M.tournament.M;

                   if (scoreData.spins && scoreData.spins.N) {
                     spins = parseInt(scoreData.spins.N);
                     tournament.spins += spins;
                     if (spins) {
                       tournament.players++;
                     }
                   }
                 }
               }
             }
           }

         if (data.LastEvaluatedKey) {
           return loop(false, data.LastEvaluatedKey);
         }
       });
     }
    })(true, null).then(() => {
      text = 'There are ' + (american.players + european.players) + ' roulette players ';
      text += 'who have done ' + (american.spins + european.spins) + ' spins. ';
      text += tournament.players + ' are in the current tournament. ';
      callback(text, {american: american, european: european,
              tournament: tournament, adsPlayed: utils.getAdText(adsPlayed)});
    }).catch((err) => {
      text = 'Error getting Roulette results. ';
      console.log(err);
      callback(text, null);
    });
  },
};
