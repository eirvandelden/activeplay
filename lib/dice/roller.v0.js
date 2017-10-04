var Poly = require('./poly.v0');
var Fate = require('./fate.v0');
var Reggie = require('../../lib/reggie.js');

function dice_pool (data) {
  var obj = { name: {}, poly: {}, fate: {} };

  obj.poly = Reggie.poly(data);
  obj.fate = Reggie.fate(data);
  obj.name = Reggie.name(data);

  return obj;
}

function formatter (data, flag) {
  var name = (data.name) ? data.name + ': ' : '';
  var pretty = '<strong>' + name + '<span class="ap-dice-total">' + data.total + '</span>' + '</strong>';

  for (var i = 0; i < data.results.length; i++) {
    pretty += '<div class="ap-dice-roll">' + data.results[i].html + '</div>';
  }

  return pretty;
}

function bones (data, next) {
  var R = { name: '', total: 0, results: [] };
  try {

    var dataObj = dice_pool(data);
    var poly = dataObj.poly;
    var fate = dataObj.fate;

    R.name = dataObj.name;

    if (poly === null && fate === null) {
      next('invalid roll', null);
    }

    // PARSE POLY ROLLS
    if (poly !== null) {
      for (var p = 0; p < poly.length; p++) {
        var dice = Reggie.dice(poly[p]);  // poly[p].match(REGEX_DICE).toString();
        var bonus = Reggie.bonus(poly[p]);// poly[p].match(REGEX_BONI);

        bonus = (bonus) ? parseInt(bonus.toString().replace(/\s+/g, ''), 10) : 0;

        R.results.push(Poly.roll(dice, bonus));
      }
    }

    // PARSE FATE ROLLS
    if (fate !== null) {
      for (var f = 0; f < fate.length; f++) {
        var bonus = Reggie.bonus(fate[f]); //fate[f].match(REGEX_BONI);
        bonus = (bonus) ? parseInt(bonus.toString().replace(/\s+/g, ''), 10) : 0;

        R.results.push(Fate.roll(bonus));
      }
    }

    // ADD IT ALL UP
    for (var x = 0; x < R.results.length; x++) {
      R.total += R.results[x].total;
    }

    next(null, formatter(R));
  } catch (err) {
    next(err, null);
  }
}

exports.roll = function (data) {
  return new Promise(function (resolve, reject) {
    bones(data, function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};
