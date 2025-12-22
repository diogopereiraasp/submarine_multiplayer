export function createPingMeter(socket, { intervalMs = 1000, timeoutMs = 1200 } = {}) {
  let pingMs = null;
  let timer = null;

  function sendPing() {
    if (!socket.connected) return;

    const t0 = performance.now();

    // ✅ usa timeout + ACK do Socket.IO (bem robusto)
    socket.timeout(timeoutMs).emit("rtt", t0, (err) => {
      if (err) {
        pingMs = null;
        return;
      }
      pingMs = Math.round(performance.now() - t0);
    });
  }

  function start() {
    if (timer) return;

    const onConnect = () => {
      sendPing();
    };

    const onDisconnect = () => {
      pingMs = null;
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // ✅ começa o loop só depois de conectar (evita setInterval "morto")
    if (socket.connected) {
      sendPing();
      timer = setInterval(sendPing, intervalMs);
    } else {
      // assim que conectar, inicia o intervalo
      socket.once("connect", () => {
        sendPing();
        timer = setInterval(sendPing, intervalMs);
      });
    }
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    pingMs = null;
  }

  function getPingMs() {
    return pingMs;
  }

  return { start, stop, getPingMs };
}
