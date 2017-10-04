module.exports = function (req, res, next) {
  // Added other domains you want the server to give access to
  // WARNING - Be careful with what origins you give access to
  var allowedHost = process.env.CORS_WHITE_LIST.split(',');

  if (allowedHost.indexOf(req.headers.origin) > -1) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    console.log('ORIGIN: ' + req.headers.origin);
    next();
  } else if (allowedHost.indexOf(req.headers.host) > -1) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.host);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    console.log('HOST: ' + req.headers.host);
    next();
  } else {
    console.log('ORIGIN: ' + req.headers.origin);
    console.log('HOST: ' + req.headers.host);
    res.status = 403;
    res.send();
  }
};
