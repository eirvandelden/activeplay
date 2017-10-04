var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

if (process.env.ENV === 'development') {
  
  var fakeEntities = [
    { id: '1', name: 'Kobolds', residentName: 'GM', type: 'Creature', initiative: 0, stance: 0  },
    { id: '2', name: 'Helacious the Distraught', residentName: 'Veep', type: 'Character', initiative: 0, stance: 2 },
    { id: '3', name: 'Kursics', residentName: 'Razune Khazar', type: 'Character', initiative: 0, stance: 1 },
    { id: '4', name: 'Daimus Dromund', residentName: 'Maddy', type: 'Character', initiative: 0, stance: 1 },
    { id: '5', name: 'DarQaun', residentName: 'Packard', type: 'Character', initiative: 0, stance: 0 }
  ];

  var fakeUsers = [
    { name: 'GM', residentId: '7a8efa6d-3172-4a57-aca1-8c1535a20fa2', characterId: '88576141-5e0f-4a93-9cc0-74aa376f2da0', campaignId: '4d811cbd-3d80-41a9-b430-61199350966e'},
    { name: 'Helacious the Distraught', residentId: '81944e3d-058b-4157-8297-add2772b7453', characterId: '5e5c4d8d-c2d0-42a6-af74-f0cb0ac56c8f', campaignId: 'bb2121ed-846d-4d3e-a923-10c1684ecdb8'},
    { name: 'Kursics', residentId: '95eddba1-7e64-4338-af17-20bb37068c9c', characterId: '1b8e6254-3274-4cf0-bc8a-31ec472efdaf', campaignId: 'bb2121ed-846d-4d3e-a923-10c1684ecdb8'},
    { name: 'Daimus Dromund', residentId: '7097287c-a142-4fa2-9cbe-7199940113a2', characterId: '2c7f1203-5b4a-44e0-a940-7dc7d5f4506b', campaignId: 'bb2121ed-846d-4d3e-a923-10c1684ecdb8'},
    { name: 'DarQaun', residentId: '0a7db5e4-1758-4a14-a2b6-796e86b99d53', characterId: '94a5dbd6-abd8-48c7-8883-b596c08bda88', campaignId: 'bb2121ed-846d-4d3e-a923-10c1684ecdb8'}
  ];

  router.get('/ap', function (req, res, next) {
    var user = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
    user.exp = Math.round((new Date().getTime() / 1000)) + 5;

    user.color = (user.name === 'GM') ? '#cc0000' : '#4e74a5';
    var token = jwt.sign(user, process.env.ACTIVEPLAY_SECRET);

    user.exp = Math.round((new Date().getTime() / 1000)) + 10000;
    var test_token = jwt.sign(user, process.env.ACTIVEPLAY_SECRET);
    res.render('activeplay', { title: 'ActivePlay™', token: token, campaignId: user.campaignId, test_token: test_token });
  });
}

module.exports = router;
