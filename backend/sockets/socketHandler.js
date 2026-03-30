const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        socket.on('join-kitchen', () => {
            socket.join('kitchen');
            console.log(`👨‍🍳 Socket ${socket.id} joined kitchen room`);
        });

        socket.on('join-dashboard', () => {
            socket.join('dashboard');
            console.log(`📊 Socket ${socket.id} joined dashboard room`);
        });

        socket.on('order-status-update', (data) => {
            io.to('kitchen').emit('order-updated', data);
            io.to('dashboard').emit('order-updated', data);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });
    });
};

module.exports = socketHandler;
