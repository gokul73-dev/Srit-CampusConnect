const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');
const Project = require('./models/Project');
const Club = require('./models/Club');

<<<<<<< HEAD
// 🟢 Track online users per room
=======
//  Track online users per room
>>>>>>> 3c2a9eaf3886510eb35442d7ddd59fbefdd4f789
const onlineUsers = new Map(); // room -> Set(userIds)

module.exports = function init(server) {
  const io = new Server(server, {
    cors: {
<<<<<<< HEAD
      origin: 'http://localhost:3000', // change to 5173 if needed
=======
      origin: 'https://srit-campusconnect.vercel.app', // change to 5173 if needed
>>>>>>> 3c2a9eaf3886510eb35442d7ddd59fbefdd4f789
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ==================================================
  // 🔐 AUTH MIDDLEWARE
  // ==================================================
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

      if (!token) return next();

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name role');

      if (user) {
        socket.user = {
          _id: user._id.toString(),
          name: user.name,
          role: user.role,
        };
      }
    } catch (err) {
      console.log('❌ Socket auth failed');
    }

    next();
  });

  // ==================================================
  // 🔌 CONNECTION
  // ==================================================
  io.on('connection', (socket) => {
    console.log(
      '🔌 Socket connected:',
      socket.id,
      socket.user?.name || 'anonymous'
    );

    // ==================================================
    // 🏠 JOIN ROOM
    // ==================================================
    socket.on('join-room', async (room) => {
      try {
        if (!socket.user) return;

        const userId = socket.user._id;

        // ================================
        // GENERAL ROOM
        // ================================
        if (room === 'general') {
          socket.join('general');
          trackOnlineUser(room, userId);
<<<<<<< HEAD
          console.log('✅ Joined general room');
=======
          console.log(' Joined general room');
>>>>>>> 3c2a9eaf3886510eb35442d7ddd59fbefdd4f789
          return;
        }

        const [type, id] = room.split(':');
        if (!type || !id) return;

        // ================================
        // PROJECT ROOM
        // ================================
        if (type === 'project') {
          const project = await Project.findById(id);
          if (!project) return;

          const isFaculty =
            project.faculty?.toString() === userId;

          const isMember =
            project.members?.map(m => m.toString()).includes(userId);

          if (!isFaculty && !isMember) {
<<<<<<< HEAD
            console.log('🚫 Unauthorized project join blocked');
=======
            console.log(' Unauthorized project join blocked');
>>>>>>> 3c2a9eaf3886510eb35442d7ddd59fbefdd4f789
            return;
          }

          socket.join(room);
          trackOnlineUser(room, userId);
<<<<<<< HEAD
          console.log('✅ Joined project room:', room);
=======
          console.log(' Joined project room:', room);
>>>>>>> 3c2a9eaf3886510eb35442d7ddd59fbefdd4f789
          return;
        }

        // ================================
        // CLUB ROOM
        // ================================
        if (type === 'club') {
          const club = await Club.findById(id);
          if (!club) return;

          const isAdmin =
            club.admin?.toString() === userId;

          const isMember =
            club.members?.map(m => m.toString()).includes(userId);

          if (!isAdmin && !isMember) {
<<<<<<< HEAD
            console.log('🚫 Unauthorized club join blocked');
=======
            console.log('Unauthorized club join blocked');
>>>>>>> 3c2a9eaf3886510eb35442d7ddd59fbefdd4f789
            return;
          }

          socket.join(room);
          trackOnlineUser(room, userId);
<<<<<<< HEAD
          console.log('✅ Joined club room:', room);
=======
          console.log(' Joined club room:', room);
>>>>>>> 3c2a9eaf3886510eb35442d7ddd59fbefdd4f789
          return;
        }

      } catch (err) {
        console.error('join-room error:', err);
      }
    });

    // ==================================================
    // 🚪 LEAVE ROOM
    // ==================================================
    socket.on('leave-room', (room) => {
      socket.leave(room);
      removeOnlineUser(room, socket.user?._id);
    });

    // ==================================================
<<<<<<< HEAD
    // ✍ TYPING INDICATOR
=======
    //  TYPING INDICATOR
>>>>>>> 3c2a9eaf3886510eb35442d7ddd59fbefdd4f789
    // ==================================================
    socket.on('typing', (room) => {
      if (!socket.user) return;
      socket.to(room).emit('user-typing', {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    // ==================================================
    // 💬 SEND MESSAGE (WITH REPLY SUPPORT)
    // ==================================================
    socket.on('message', async ({ room, text, meta }) => {
      try {
        if (!socket.user) return;
        if (!room || !text) return;

        if (!socket.rooms.has(room)) {
          console.log(' Message blocked (not in room)');
          return;
        }

        const msg = await Message.create({
          room,
          text,
          meta: meta || {},
          from: socket.user._id,
          replyTo: meta?.replyTo || null,
        });

        await msg.populate([
          { path: 'from', select: 'name role' },
          {
            path: 'replyTo',
            populate: { path: 'from', select: 'name role' },
          },
        ]);

        const formattedMessage = {
          _id: msg._id,
          room: msg.room,
          text: msg.text,
          meta: msg.meta,
          replyTo: msg.replyTo
            ? {
                _id: msg.replyTo._id,
                text: msg.replyTo.text,
                from: msg.replyTo.from
                  ? {
                      _id: msg.replyTo.from._id,
                      name: msg.replyTo.from.name,
                      role: msg.replyTo.from.role,
                    }
                  : null,
              }
            : null,
          from: {
            _id: msg.from._id.toString(),
            name: msg.from.name,
            role: msg.from.role,
          },
          createdAt: msg.createdAt,
        };

        io.to(room).emit('message:new', formattedMessage);

      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    // ==================================================
<<<<<<< HEAD
    // ❌ DISCONNECT
=======
    //  DISCONNECT
>>>>>>> 3c2a9eaf3886510eb35442d7ddd59fbefdd4f789
    // ==================================================
    socket.on('disconnect', () => {
      if (!socket.user) return;

      onlineUsers.forEach((users, room) => {
        if (users.has(socket.user._id)) {
          users.delete(socket.user._id);
          io.to(room).emit('online-users', Array.from(users));
        }
      });

<<<<<<< HEAD
      console.log('🔌 Socket disconnected:', socket.id);
    });

    // ==================================================
    // 🟢 ONLINE USER HELPERS
=======
      console.log('Socket disconnected:', socket.id);
    });

    // ==================================================
    // ONLINE USER HELPERS
>>>>>>> 3c2a9eaf3886510eb35442d7ddd59fbefdd4f789
    // ==================================================
    function trackOnlineUser(room, userId) {
      if (!onlineUsers.has(room)) {
        onlineUsers.set(room, new Set());
      }

      onlineUsers.get(room).add(userId);

      io.to(room).emit(
        'online-users',
        Array.from(onlineUsers.get(room))
      );
    }

    function removeOnlineUser(room, userId) {
      if (!room || !userId) return;

      if (onlineUsers.has(room)) {
        onlineUsers.get(room).delete(userId);

        io.to(room).emit(
          'online-users',
          Array.from(onlineUsers.get(room))
        );
      }
    }
  });

  return io;
};
