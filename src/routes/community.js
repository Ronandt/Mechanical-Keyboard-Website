const communityRouter = require('express').Router();
const userMessage = require('../Utilities');
const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');

communityRouter.route('/').get((req, res) => {
    res.render('./customers/page-community');
});

communityRouter.use((req, res, next) => {
    if (req.isUnauthenticated()) {
        req.flash('info', 'Please login to chat!');
        return res.redirect('/');
    }

    next();
});

communityRouter.route('/chat/:room').get(async (req, res) => {
    var numClients = {};
    const io = req.app.get('socketio');
    const check_room = await Room.findOne({
        where: { name: req.params.room ?? '' },
    });
    console.log(check_room);
    console.log(req.params.room);
    const user = await User.findByPk(req.user.id);
    const all_rooms = (await Room.findAll()).map((x) => x.dataValues.name);
    const room = check_room?.name ?? '';
    if (room == '') {
        req.flash('No such chat avaliable!');
        console.log('fifjsffsd');
        return res.redirect('/community');
    }
    const messages = (
        await Message.findAll({ where: { RoomId: check_room.id } })
    ).map((x) => x.dataValues);

    io.once('connection', (socket) => {
        console.log('hoi');
        socket.once('joinRoom', () => {
            console.log('hi');
            numClients['Main'] = 1;
            if (numClients[room] == undefined) {
                numClients[room] = 1;
            } else {
                numClients[room]++;
            }
            socket.join(room);

            console.log('New connection...');
            io.to(socket.id).emit(
                'message',
                userMessage('KeyHub Bot', `Welcome to ${room} channel!`)
            );
            console.log(socket.rooms);
            socket.broadcast
                .to(room)
                .emit(
                    'message',
                    userMessage(
                        'KeyHub Bot',
                        `${req.user.username} has joined the chat`
                    )
                );
            console.log(req.query.room);
            socket.on('chatMessage', (msg) => {
                io.to(room).emit(
                    'message',
                    userMessage(`${req.user.username}`, msg)
                );
                console.log(room);
                console.log('bruh');

                Message.create({
                    text: msg,
                    userID: req.user.id,
                    RoomId: check_room.id,
                    username: req.user.username,
                });
            });

            /*io.to(room).emit("roomUsers", {

            })
*/
        });

        socket.on('disconnect', () => {
            io.emit(
                'message',
                userMessage(
                    'KeyHub Bot',
                    `${req.user.username} has left the chat`
                )
            );
            numClients[room]--;
            io.emit('disconnected');
        });
    });

    res.render('./customers/page-community-chat', {
        username: req.user.username,
        room,
        all_rooms,
        messages,
        user_count: numClients[room],
    });
});

communityRouter.route('/chat/create-room').post(async (req, res) => {
    if (!(await Room.findOne({ where: { name: req.body.name } }))) {
        Room.create({
            name: req.body.name,
        });
    }
    res.redirect('/community/chat');
});

communityRouter.route('/chat/delete-room').post(async (req, res) => {
    const name = req.body.delete;
    await Room.destroy({ where: { name } });
    res.redirect('/community/chat');
});

communityRouter.route('/chat/update-room').post(async (req, res) => {
    const room = await Room.findOne({ where: { name: req.body.prev_name } });
    room.name = req.body.name;
    await room.save();
    res.redirect('/community/chat');
});

communityRouter.route('/chat').get(async (req, res) => {
    const all_rooms = (await Room.findAll()).map((x) => x.dataValues.name);
    console.log(await Room.count());
    if ((await Room.count()) == 0 || !all_rooms.includes('Main')) {
        const a = Room.build({ name: 'Main' });
        await a.save();
        console.log(a);
    }
    console.log(all_rooms);

    return res.redirect('/community/chat/Main');
});

module.exports = communityRouter;
