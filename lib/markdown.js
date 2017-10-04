var REGEX_IMAGE = /^http(s?)\:\/\/([^?#]*\.(?:jpe?g|gif|png))(?:\?([^#]*))?(?:#(.*))?$/i;
var REGEX_URL = /^http(s?)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?\/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*$/;
var REGEX_MD = /^\[([^\]]+)\]\(([^)]+)\)$/;
var REGEX_MD_TEXT = /^\[([^\]]+)\]/;
var REGEX_MD_URL = /\(([^\)]+)\)$/;

exports.parse = function (message) {
  if (message.text.search(REGEX_IMAGE) === 0) {
    message.html = "<a href='" + message.text + "' target='_blank'><img src='" + message.text + "'></a>";
    message.text = null;
  } else if (message.text.search(REGEX_URL) === 0) {
    if (message.text.startsWith('http')) message.html = "<a href='" + message.text + "' target='_blank'>" + message.text + '</a>';
    else message.html = "<a href='http://" + message.text + "' target='activeplay'>" + message.text + '</a>';
    message.text = null;
  } else if (message.text.search(REGEX_MD) === 0) {
    try {
      var link_text = message.text.match(REGEX_MD_TEXT)[1];
      var link_url = message.text.match(REGEX_MD_URL)[1];
      if (link_url.search(REGEX_URL) === 0) {
        message.html = "<a href='" + link_url + "' target='_blank'>" + link_text + '</a>';
        message.text = null;
      }
    } catch (ex) {
      console.log(ex);
    }
  }
};
