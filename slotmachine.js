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
  getSlotsText: function(callback) {
    let text = '';

    getEntriesFromDB((err, results, newads) => {
      if (err) {
        console.log(err);
        callback(null, null);
      } else {
        const games = {};
        let thisGame;
        let i;

        for (i = 0; i < results.length; i++) {
          if (!games[results[i].game]) {
            games[results[i].game] = {players: 0, totalSpins: 0, totalJackpots: 0, maxSpins: 0};
          }

          thisGame = games[results[i].game];
          thisGame.players++;
          thisGame.totalSpins += results[i].spins;
          thisGame.totalJackpots += results[i].jackpot;

          if (results[i].spins > thisGame.maxSpins) {
            thisGame.maxSpins = results[i].spins;
          }
        }

        text = 'For slots ';
        let game;
        for (game in games) {
          if (game) {
            text += ' there are ' + games[game].players + ' players of ' + game;
            text += (' with a total of ' + games[game].totalSpins + ' spins. ');
          }
        }

        // I need to learn promises
        getProgressive('progressive', (coins) => {
          games['progressive'].coins = coins;
          getProgressive('wild', (coins) => {
            games['wild'].coins = coins;
            getProgressive('basic', (coins) => {
              games['basic'].coins = coins;
              callback(text, {results: games, adsPlayed: utils.getAdText(newads)});
            });
          });
        });
      }
    });
  },
};

// Function to get all the entries from the Database
function getEntriesFromDB(callback) {
  const results = [];
  const newads = [];

  // Loop thru to read in all items from the DB
  (function loop(firstRun, startKey) {
    const params = {TableName: 'Slots'};

    if (firstRun || startKey) {
      params.ExclusiveStartKey = startKey;

      const scanPromise = dynamodb.scan(params).promise();
      return scanPromise.then((data) => {
        let i;

        utils.getAdSummary(data, newads);
        for (i = 0; i < data.Items.length; i++) {
          if (data.Items[i].mapAttr && data.Items[i].mapAttr.M) {
            let game;

            for (game in data.Items[i].mapAttr.M) {
              if (game) {
                const entry = getEntryForGame(data.Items[i], game);
                if (entry) {
                  results.push(entry);
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
    callback(null, results, newads);
  }).catch((err) => {
    callback(err, null), null;
  });
}

function getEntryForGame(item, game) {
  let entry;

  if (item.mapAttr && item.mapAttr.M
    && item.mapAttr.M[game] && item.mapAttr.M[game].M) {
     if (item.mapAttr.M[game].M.spins) {
       const spins = parseInt(item.mapAttr.M[game].M.spins.N);

       entry = {game: game};
       entry.spins = isNaN(spins) ? 0 : spins;
       if (item.mapAttr.M[game].M.high) {
         const high = parseInt(item.mapAttr.M[game].M.high.N);
         entry.high = isNaN(high) ? 0 : high;
       }

      if (item.mapAttr.M[game].M.jackpot) {
        const jackpot = parseInt(item.mapAttr.M[game].M.jackpot.N);

        entry.jackpot = isNaN(jackpot) ? 0 : jackpot;
      } else {
        entry.jackpot = 0;
      }
    }
  }

  return entry;
}

function getProgressive(game, callback) {
  // Read from Dynamodb
  dynamodb.getItem({TableName: 'Slots', Key: {userId: {S: 'game-' + game}}},
          (err, data) => {
    if (err || (data.Item === undefined)) {
      callback(undefined);
    } else {
      // Do we have
      let coins;

      if (data.Item.coins && data.Item.coins.N) {
        coins = parseInt(data.Item.coins.N);
      }

      callback(coins);
    }
  });
}
