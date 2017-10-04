var Chance = require('chance');
var chance = new Chance();

function ladder (result) {
  var _val;
  switch (result) {
    case 8:  _val = 'Legendary!'; break;
    case 7:  _val = 'Epic!'; break;
    case 6:  _val = 'Fantastic!'; break;
    case 5:  _val = 'Superb!'; break;
    case 4:  _val = 'Great!'; break;
    case 3:  _val = 'Good!'; break;
    case 2:  _val = 'Fair!'; break;
    case 1:  _val = 'Average!'; break;
    case 0:  _val = 'Mediocre!'; break;
    case -1: _val = 'Poor!'; break;
    case -2: _val = 'Terrible!'; break;
    default: _val = ''; break;
  }
  return _val;
}

function format_text (roll) {
  var _val;
  switch (roll) {
    case -1: _val = '[-]'; break;
    case 0:  _val = '[_]'; break;
    case 1:  _val = '[+]'; break;
  }
  return _val;
}

function format_html (roll) {
  var _val;
  switch (roll) {
    case -1: _val = '<i class="fa fa-minus-square"></i>'; break;
    case 0:  _val = '<i class="fa fa-square"></i>'; break;
    case 1:  _val = '<i class="fa fa-plus-square"></i>'; break;
  }
  return _val;
}

function toss () {
  try {
    return (chance.rpg('1d3', {sum: true})) - 2;
  } catch (err) {
    return err;
  }
}

exports.roll = function (bonus) {
  var raw  = [0, 0, 0, 0];
  var text = [0, 0, 0, 0];
  var html = [0, 0, 0, 0];

  var total = 0;

  for (var f = 0; f < raw.length; f++) {
    raw[f]  = toss();
    text[f] = format_text(raw[f]);
    html[f] = format_html(raw[f]);
    total = total + raw[f];
  }

  total += bonus;
  var boni = ((bonus) ? ((bonus > 0) ? ' + ' + bonus : ' - ' + (bonus * -1)) : '');

  return {
    raw: raw.join('+') + boni + ' = ' + total + ' ' + ladder(total),
    text: text.join('') + boni  + ' = ' + total + ' ' + ladder(total),
    html: html.join(' ') + boni  + ' = ' + total + ' ' + ladder(total),
    total: total
  };
};
