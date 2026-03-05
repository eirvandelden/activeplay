module.exports = function (req, res, next) {
  // Added other domains you want the server to give access to
  // WARNING - Be careful with what origins you give access to
  var corsWhiteList = process.env.CORS_WHITE_LIST || '';
  var allowedHost = corsWhiteList.split(',').map(function (host) {
    return host.trim();
  }).filter(function (host) {
    return host.length > 0;
  });
  var origin = req.headers.origin;
  var host = req.headers.host;

  if (allowedHost.length === 0) {
    next();
    return;
  }

  if (allowedHost.indexOf(origin) > -1) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    console.log('ORIGIN: ' + origin);
    next();
  } else if (allowedHost.indexOf(host) > -1) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', host);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    console.log('HOST: ' + host);
    next();
  } else {
    console.log('ORIGIN: ' + origin);
    console.log('HOST: ' + host);
    res.status(403).send();
  }
};
