var colors = require('colors');
var Chance = require('chance');
var chance = new Chance();

function format_text (roll) {
  return '[' + roll + ']';
}

function format_html (roll) {
  return roll;
}

function toss (dice) {
  try {
    if (dice.indexOf('d') > 3 || dice.length > 7) {
      throw new Error('invalid dice!');
    } else {
      return chance.rpg(dice);
    }
  } catch (err) {
    return err;
  }
}

exports.roll = function (dice, bonus) {
  var raw  = toss(dice);
  var text = [];
  var html = [];

  var total = 0;

  for (var f = 0; f < raw.length; f++) {
    text[f] = raw[f];
    html[f] = format_html(raw[f]);

    total = total + raw[f];
  }

  total += bonus;
  var boni = ((bonus) ? ((bonus > 0) ? ' + ' + bonus : ' - ' + (bonus * -1)) : '');

  return {
    raw: raw.join('+') + boni + ' = ' + total,
    text: dice + ' (' + text.join(',') + ')' + boni + ' = ' + total,
    html: '<strong>' + dice + ' (</strong>' + html.join(',') + '<strong>)' + boni + ' = ' + total + '</strong>',
    total: total
  };
};
