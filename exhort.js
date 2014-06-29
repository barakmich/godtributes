// var Bot = require('./node_modules/twit/examples/bot');
var Twit = require('twit');
var config = require('./config');
var createWordnikSource = require('./wordniksource');
var tributeDemander = require('./tributedemander');
var probable = require('probable');
var _ = require('lodash');
var queue = require('queue-async');
var nounfinder = require('./nounfinder');
var figurepicker = require('./figurepicker');

var twit = new Twit(config.twitter);

console.log('Exhort is running.');

function exhort() {
  twit.get('followers/ids', function exhortFollowers(error, response) {
    if (error) {
      handleError(error);
    }
    else {
      var usersToExhort = response.ids;
      console.log('Found followers:', usersToExhort);
      usersToExhort.forEach(exhortUser);
    }
  });

  // wordnikSource.getTopic(function postOnTopic(error, topic) {
  //   if (error) {
  //     handleError(error);
  //   }
  //   else {
  //     bot.tweet(tributeDemander.makeDemandForTopic(topic), 
  //       function reportTweetResult(error, reply) {
  //         console.log((new Date()).toString(), 'Tweet posted:', reply.text);
  //       }
  //     );
  //   }
  // });  
}

function exhortUser(userId) {
  twit.get('statuses/user_timeline/:user_id', {
    user_id: userId
  },
  tweetRepliesToStatuses);
}

function tweetRepliesToStatuses(error, response) {
  var notGodTributesRTs = response.filter(isNotARetweetOfSelf);
  var nonReplies = notGodTributesRTs.filter(isNotAReply);
  nonReplies = _.sample(nonReplies, ~~(nonReplies.length/3));

  filterStatusesForInterestingNouns(nonReplies, 
    function useNounsToReply(error, nounGroups) {
      if (error) {
        console.log(error);
      }
      else {
        nounGroups.forEach(function replyIfTheresEnoughMaterial(nounGroup, i) {
          // If there's two nouns, definitely do it. If there's one, it's a 
          // coin flip.
          if (nounGroup.length > 0 && probable.roll(2) < nounGroup.length) {
            replyToStatusWithNouns(nonReplies[i], nounGroup);
          }
        });
      }
    }
  );
}

function filterStatusesForInterestingNouns(statuses, done) {
  var texts = _.pluck(statuses, 'text');
  var q = queue();
  texts.forEach(function addToQueue(text) {
    q.defer(getReplyNounsFromText, text);
  });
  q.awaitAll(done);
}

// Assumes nouns has at least one element.
function replyToStatusWithNouns(status, nouns) {
  var selectedNouns = _.sample(nouns, 2);
  debugger;
  var primaryTribute = tributeDemander.makeDemandForTopic({
    topic: selectedNouns[0],
    tributeFigure: figurepicker.getMainTributeFigure()    
  });

  if (selectedNouns.length > 1) {
    var secondaryTribute = tributeDemander.makeDemandForTopic({
      topic: selectedNouns[1],
      tributeFigure: figurepicker.getSecondaryTributeFigure()
    });
  }

  var replyText = '@' + status.user.screen_name + ' ' + primaryTribute;
  if (secondaryTribute) {
    replyText += ('! ' + secondaryTribute);
  }
  console.log('Replying to status', status.text, 'with :', replyText);  
}

function getReplyNounsFromText(text, done) {
  nounfinder.getNounsFromText(text, function filterReplyNouns(error, nouns) {
    if (error) {
      console.log(error);
    }
    else {
      if (nouns.length > 0) {
        nounfinder.filterNounsForInterestingness(nouns, 34, done);
      }
      else {
        done(null, []);
      }
    }
  });
}

function isNotAReply(status) {
  return !status.in_reply_to_user_id && !status.in_reply_to_status_id && 
    !status.in_reply_to_screen_name;
}

function isNotARetweetOfSelf(status) {
  var isRTOfSelf = 
    (status.retweeted_status && 
     status.retweeted_status.user.screen_name === 'godtributes') ||
    status.text.indexOf('RT @godtributes') !== -1 ||
    status.text.indexOf('"@godtributes') !== -1 ||
    status.text.indexOf('\u201C@godtributes') !== -1;
    
  // if (isRTOfSelf) {
  //   console.log('Found RT of self:', status.text);
  // }
  return !isRTOfSelf;
}

function handleError(error) {
  console.error('Response status:', error.statusCode);
  console.error('Data:', error.data);
}

exhort();
