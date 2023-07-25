import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();
import envConfig from "./config/envConfig";
import { IMachineMetrics } from "./types/objectTypes";

const socketio = new Server(envConfig.port, {
  cors: {
    origin: "*",
  },
});

socketio.on("connection", (socket) => {
  const secret = socket.handshake.auth.secret;
  let machineIp: string | undefined = undefined;

  if (!secret || !envConfig.secrets.includes(secret)) {
    socket.emit("errorConnection", "Invalid secret!");
    socket.disconnect();
  }

  if (secret === process.env.NODE_CLIENTS_SECRET) {
    // if node client add to the nodeClients room
    socket.join("nodeClients");
  } else {
    // if react client add to the reactClients room
    socket.join("reactClients");
  }

  // send metrics to the react clients
  socket.on("metrics", (data: IMachineMetrics) => {
    if (!machineIp) {
      machineIp = data.ip;
      socketio
        .to("reactClients")
        .emit("connectionStatus", { isAlive: true, machineIp });
    }

    socketio.to("reactClients").emit("machineMetrics", data);
  });

  // when node client disconnects emit to react clients
  socket.on("disconnect", () => {
    socketio
      .to("reactClients")
      .emit("connectionStatus", { isAlive: false, machineIp });
  });
});
