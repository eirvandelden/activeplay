var REGEX_POLY = /((\d*d\d+)( ?[-+/] ?\d+)?)(?!d)/gi;
var REGEX_FATE = /(\ddf+|fate)( ?[-+/] ?\d+)?(?!d)/gi;
var REGEX_DICE = /\d*d\d+/gi;
var REGEX_BONI = / ?[-+/] ?\d+/gi;
var REGEX_NAME = /(^"(?:\\?.)*?")|(^\w*)/i;
var REGEX_SCRB = /[^0-9A-Za-z \-\(\)\[\]]/g;

var reggie = {

  name: function (data) {
    var name  = data.match(REGEX_NAME);
    if (name != null) {
      return name[0].replace(/["]/g, '');
    } else {
      return '';
    }
  },

  poly: function (data) {
    return data.match(REGEX_POLY);
  },

  fate: function (data) {
    return data.match(REGEX_FATE);
  },

  dice: function (data) {
    return data.match(REGEX_DICE).toString();
  },

  bonus: function (data) {
    return data.match(REGEX_BONI);
  },
  
  nameScrubber: function (name) {
    return name.replace(REGEX_SCRB, ' ');
  }

};

module.exports = reggie;
