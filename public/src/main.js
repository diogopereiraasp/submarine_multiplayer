import { createRenderer } from "./render/renderer.js";
import { createGame } from "./game/game.js";
import { setupHud } from "./ui/hud.js";
import { setupInput } from "./input/mouse.js";
import { WORLD } from "./config/world.js";

const canvas = document.getElementById("game");

const renderer = createRenderer(canvas, {
  backgroundColor: "#1A1A1D",
  world: WORLD,
});

const game = createGame({
  myColor: "#D2C1B6",
  otherColor: "#948979",
  world: WORLD,
});

const socket = io();

setupHud(socket, {
  onMyId: (id) => game.setMyId(id),
  onIds: (ids) => game.setConnectedIds(ids),
});

socket.on("players_state", (list) => {
  list.forEach(({ id, x, y }) => {
    game.setPlayerPosition(id, x, y);
  });
});

socket.on("player_state", ({ id, x, y }) => {
  game.setPlayerPosition(id, x, y);
});

// ===== SONAR EVENTS =====
socket.on("sonar_hit", (payload) => {
  game.onSonarHit(payload);
});

socket.on("sonar_confirm", (payload) => {
  game.onSonarConfirm(payload);
});

setupInput(canvas, game, renderer);

game.start(({ dt }) => {
  game.update(dt);

  const myPos = game.getMyPosition();
  if (myPos) socket.emit("player_state", myPos);

  // envia pulsos emitidos automaticamente enquanto move
  game.consumeSonarOutbox().forEach((p) => {
    socket.emit("sonar_emit", p);
  });

  renderer.clear();
  renderer.drawGame(game);
});
