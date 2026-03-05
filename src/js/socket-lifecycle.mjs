export function disconnectSocket(socket) {
  if (socket && typeof socket.disconnect === 'function') {
    socket.disconnect();
  }
}
