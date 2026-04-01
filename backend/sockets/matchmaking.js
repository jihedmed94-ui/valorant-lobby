export function registerMatchmakingHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('lobby:created', (payload) => {
      io.emit('lobby:created', payload);
    });

    socket.on('request:created', (payload) => {
      io.emit('request:created', payload);
    });
  });
}
