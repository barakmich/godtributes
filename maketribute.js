var Bot = require('./node_modules/twit/examples/bot');
var config = require('./config');
var createWordnikSource = require('./wordniksource');
var tributeDemander = require('./tributedemander');
var figurepicker = require('./figurepicker');
var prepphrasepicker = require('./prepphrasepicker');
var logger = require('./logger');
var handleTwitterError = require('./handletwittererror');
var createChronicler = require('basicset-chronicler');
var emojiSource = require('./emojisource');
var behavior = require('./behaviorsettings');
var probable = require('probable');

var wordnikSource = createWordnikSource();
var bot = new Bot(config.twitter);

var simulationMode = (process.argv[2] === '--simulate');

logger.log('Tribute maker is running.');

var chronicler = createChronicler({
  dbLocation: 'tributes.db'
});

var emojiTopic = false;

function postTribute() {
  if (probable.roll(100) < behavior.emojiThresholdPercentage) {
    emojiTopic = true;
    postOnTopic(null, emojiSource.getRandomTopicEmoji());
  }
  else {
    wordnikSource.getTopic(postOnTopic);
  }
}

function postOnTopic(error, topic) {
  if (error) {
    handleTwitterError(error);
  }
  else {
    var demandOpts = {
      topic: topic,
      prepositionalPhrase: prepphrasepicker.getPrepPhrase(),
      tributeFigure: figurepicker.getMainTributeFigure(),
      isEmoji: emojiTopic
    };

    if (emojiTopic) {
      demandOpts.repeatNTimesToPluralize = 
        probable.roll(4) + probable.roll(4) + 2;
    }

    var tweetText = tributeDemander.makeDemandForTopic(demandOpts);

    if (simulationMode) {
      logger.log('Would have tweeted', tweetText);
    }
    else {
      bot.tweet(tweetText, function reportTweetResult(error, reply) {
        logger.log((new Date()).toString(), 'Tweet posted', reply.text);

      });
    }
    chronicler.recordThatTopicWasUsedInTribute(topic);    
  }
}

postTribute();
