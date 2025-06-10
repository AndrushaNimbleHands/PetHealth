const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');
require('dotenv').config();
require('./utils/cron');


const app = express();
app.use(cors({origin: 'http://localhost:3000', credentials: true}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));

app.get('/', (req, res) => {
    res.send('Backend працює');
});
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/user'));
app.use('/api/species', require('./routes/species'));
app.use('/api/procedures', require('./routes/procedure'));
app.use('/api/users', require('./routes/usersAdmin'));
app.use('/api/petcards', require('./routes/petCards'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/client', require('./routes/petCardsClient'));
app.use('/api/products', require('./routes/product'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/shop', require('./routes/shop'));
app.use('/api/admin/orders', require('./routes/adminOrders'));
app.use('/api/recipes', require('./routes/recipe'));


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }
});

io.on('connection', socket => {
    console.log('🟢 Клієнт підключився через Socket.IO');

    socket.on('disconnect', () => {
        console.log('🔴 Клієнт відключився');
    });
});


module.exports = { server, io };

server.listen(process.env.PORT || 3001, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3001}`);
});
