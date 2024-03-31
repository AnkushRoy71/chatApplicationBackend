const app = require("express")();

const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const uuid = require("uuid");

io.use((socket, next) => {
  const userName = socket.handshake.auth.username;
  if (!userName) {
    return next(new Error("invalid UserName"));
  }

  socket.username = userName;
  socket.userId = uuid.v4();

  next();
});
io.on("connection", (socket) => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userId: socket.userId,
      username: socket.username,
    });
  }
  socket.emit("users", users);
  socket.emit("session", { userId: socket.userId, username: socket.username });
  socket.broadcast.emit("user connected", {
    userId: socket.userId,
    username: socket.username,
  });
  socket.on("new message", (message) => {
    socket.broadcast.emit("new messages", {
      userId: socket.userId,
      username: socket.username,
      message,
    });
  });
});

server.listen(5000, () => {
  console.log("Server is listening at port 5000...");
});
