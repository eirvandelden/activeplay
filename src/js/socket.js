var socket = io(ap_sok);

// Socket events
socket.on('connect', function () {
  ApCore.sendLogin();

  // UPDATE TIMESTAMPS
  $('[data-timestamp]').each(function () {
    var local = new moment(new Date($(this).data('timestamp')));
    $(this).text(local.calendar(null, {sameElse: 'MMM Do YYYY'}));
  });
});

socket.on('welcome', function (user) {
  $('.ap-v1-status-gear i').removeClass('fa-ban fa-gear fa-spin');
  $('.ap-v1-status-gear i').addClass('fa-comments');

  ApCore.setUser(user);
  socket.emit('onlineUsers');
});

socket.on('userJoined', function (user) {
  socket.emit('onlineUsers');
});

socket.on('userLeft', function (user) {
  socket.emit('onlineUsers');
});

socket.on('onlineUsers', function (users) {
  ApStore.users = users;
  ApCore.$emit('evt-toggleActiveUsers');
});

socket.on('message', function (message) {
  ApCore.addMessage(message);
});

socket.on('buff3r', function (buff3r) {
  ApCore.addBuff3r(buff3r);
});

socket.on('loadInitiative', function (initiative) {
  initiative.turn = parseInt(initiative.turn, 10) || 0;
  initiative.round = parseInt(initiative.round, 10) || 0;
  initiative.entities = JSON.parse(initiative.entities);
  ApCore.loadInitiative(initiative);
});

socket.on('initiative:setTurn', function (message) {
  ApCore.setTurn(message);
});

socket.on('initiative:setEntities', function (message) {
  ApCore.setEntities(message);
});

socket.on('disconnect', function (data) {
  $('.ap-v1-status-gear i').removeClass('fa-ban');
  $('.ap-v1-status-gear i').removeClass('fa-comments');
  $('.ap-v1-status-gear i').addClass('fa-gear fa-spin');
});

socket.on('expired', function () {
  $('.ap-v1-status-gear i').removeClass('fa-comments');
  $('.ap-v1-status-gear i').removeClass('fa-gear fa-spin');
  $('.ap-v1-status-gear i').addClass('fa-ban');
  new_token(campaign);
});
