var assert = require('assert');
var tributeDemander = require('../tributedemander');

function topicsTest(opts) {
  var demands = opts.topics.map(tributeDemander.makeDemandForTopic);
  demands.forEach(function checkDemand(demand, i) {
    assert.equal(demand, opts.expectedDemands[i]);
  });
}

suite('Praise generator', function tributeDemanderSuite() {
  test('Make demands for singular topics', function singularTopicsTest() {
    topicsTest({
      topics: [
        'pipewrench',
        'karate manual',
        'hand sanitizer',
        'car battery',
        'interior flat paint'
      ],
      expectedDemands: [
        'PIPEWRENCHES FOR THE PIPEWRENCH GOD',
        'KARATE MANUALS FOR THE KARATE MANUAL GOD',
        'HAND SANITIZERS FOR THE HAND SANITIZER GOD',
        'CAR BATTERIES FOR THE CAR BATTERY GOD',
        'INTERIOR FLAT PAINTS FOR THE INTERIOR FLAT PAINT GOD'
      ]
    });
  });

  test('Make demands for singular topics that end in s', 
    function singularTopicsThatEndInSTest() {
      topicsTest({
        topics: [
          'epidermis',
          'kiss'
        ],
        expectedDemands: [
          'EPIDERMISES FOR THE EPIDERMIS GOD',
          'KISSES FOR THE KISS GOD'
        ]
      });
    }
  );

  test('Make demands for plural topics', function pluralTopicsTest() {
    topicsTest({
      topics: [
        'sandwiches',
        'grappling hooks',
        'harmonicas'
      ],
      expectedDemands: [
        'SANDWICHES FOR THE SANDWICH GOD',
        'GRAPPLING HOOKS FOR THE GRAPPLING HOOK GOD',
        'HARMONICAS FOR THE HARMONICA GOD'
      ]
    });

  });

  test('Make demands for with mass nouns that are the same', 
    function massNounTopicsTest() {
      topicsTest({
        topics: [
          'corn syrup',
          'toilet paper',
          'milk',
          'mayonnaise',
          'blood', 
          'sweatpants',
          'growth',
          'sourness',
          'counseling'
        ],
        expectedDemands: [
          'CORN SYRUP FOR THE CORN SYRUP GOD',
          'TOILET PAPER FOR THE TOILET PAPER GOD',
          'MILK FOR THE MILK GOD',
          'MAYONNAISE FOR THE MAYONNAISE GOD',
          'BLOOD FOR THE BLOOD GOD',
          'SWEATPANTS FOR THE SWEATPANT GOD',
          'GROWTH FOR THE GROWTH GOD',
          'SOURNESS FOR THE SOURNESS GOD',
          'COUNSELING FOR THE COUNSELING GOD'
        ]
      });
    }
  );

  test('Make demands for possessive topics', function pluralTopicsTest() {
    topicsTest({
      topics: [
        'butcher\'s'
      ],
      expectedDemands: [
        'BUTCHERS FOR THE BUTCHER GOD'
      ]
    });
  });

});

