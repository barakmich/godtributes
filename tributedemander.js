var canonicalizer = require('canonicalizer');
var isEmoji = require('is-emoji');

function makeDemandForTopic(opts) {
  var tributeFigure = (opts && opts.tributeFigure) ? 
    opts.tributeFigure.toUpperCase() : 'GOD';
  
  var prepositionalPhrase = (opts && opts.prepositionalPhrase) ? 
    opts.prepositionalPhrase.toUpperCase() : 'FOR THE';

  var forms;

  if (opts.isEmoji) {
    var pluralFormArray = [];
    for (var i = 0; i < opts.repeatNTimesToPluralize; ++i) {
      pluralFormArray.push(opts.topic);
    }
    forms = [opts.topic, pluralFormArray.join(' ')];
  }
  else {
    forms = canonicalizer.getSingularAndPluralForms(opts.topic);
  }
  
  var postEmojiSpace = '';

  if (opts.isEmoji) {
    postEmojiSpace  = ' ';
  }
  else {
    forms = forms.map(function upperize(s) { return s.toUpperCase(); });
  }

  var demand = forms[1] + ' ' + postEmojiSpace + 
    prepositionalPhrase + ' ' + 
    forms[0] + ' ' + postEmojiSpace + tributeFigure;

  return demand;
}

function decorateWithEmojiOpts(demandOpts) {
  if (isEmoji(demandOpts.topic)) {
    demandOpts.isEmoji = true;
    demandOpts.repeatNTimesToPluralize = 
      probable.roll(3) + probable.roll(3) + 2;
  }
  return demandOpts;
}

module.exports = {
  makeDemandForTopic: makeDemandForTopic,
  decorateWithEmojiOpts: decorateWithEmojiOpts
};
