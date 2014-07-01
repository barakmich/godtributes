var levelwrap = require('basicset-levelwrap');
var db = levelwrap.createLevelWrap('tributes.db');

function createDoc(id) {
  db.saveDoc({
      id: id
    }, 
    function done(error) {
      if (error) {
        console.log(error);
      }
    }
  );
}

function recordThatTweetWasRepliedTo(tweetId) {
  db.saveObject({
    doc: 'tweetsrepliedto',
    id: tweetId
  },
  logError);
}

function recordThatUserWasRepliedTo(userId) {
  db.saveObject({
    doc: 'lastreplydatesforusers',
    id: userId,
    date: (new Date()).toISOString()
  },
  logError);
}

function recordThatTopicWasUsedInReplyToUser(topic, userId) {
  db.saveObject({
    doc: 'topics-sent-to-' + userId,
    topic: topic
  },
  logError);
}

function tweetWasRepliedTo(tweetId, done) {
  db.getObject(tweetId, 'tweetsrepliedto', function checkResult(error, index) {
    var replied = (!error);
    done(null, replied);
  });
}

function whenWasUserLastRepliedTo(userId, done) {
  db.getObject(userId, 'lastreplydatesforusers', 
    function reconstituteDate(error, record) {
      var date = null;
      if (!error || !error.notFound) {
        date = new Date(record.date);
      }
      done(error, date);
    }
  );
}

function topicWasUsedInReplyToUser(topic, userId, done) {
  db.getObject(topic, 'topics-sent-to-' + userId, function checkResult(error) {
    done(null, (!error || !error.notFound));
  });
}

function logError(error) {
  if (error) {
    console.log(error);
  }
}

(function initialize() {
  db.getDoc('tweetsrepliedto', function done(error, doc) {
    if (error && error.name === 'NotFoundError') {
      createDoc('tweetsrepliedto');
    }
  });
  db.getDoc('lastreplydatesforusers', function done(error, doc) {
    if (error && error.name === 'NotFoundError') {
      createDoc('lastreplydatesforusers');
    }
  });
})();

module.exports = {
  recordThatTweetWasRepliedTo: recordThatTweetWasRepliedTo,
  recordThatUserWasRepliedTo: recordThatUserWasRepliedTo,
  recordThatTopicWasUsedInReplyToUser: recordThatTopicWasUsedInReplyToUser,
  tweetWasRepliedTo: tweetWasRepliedTo,
  whenWasUserLastRepliedTo: whenWasUserLastRepliedTo,
  topicWasUsedInReplyToUser: topicWasUsedInReplyToUser
};
