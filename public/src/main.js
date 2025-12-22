import { createRenderer } from "./render/renderer.js";
import { createGame } from "./game/game.js";
import { setupHud } from "./ui/hud.js";
import { setupInput } from "./input/mouse.js";
import { WORLD } from "./config/world.js";

const canvas = document.getElementById("game");
const renderer = createRenderer(canvas, {
  backgroundColor: "#211832",
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

socket.on("player_state", ({ id, x, y }) => {
  game.setPlayerPosition(id, x, y);
});

setupInput(canvas, game, renderer);

game.start(({ dt }) => {
  game.update(dt);

  const myPos = game.getMyPosition();
  if (myPos) socket.emit("player_state", myPos);

  renderer.clear();
  renderer.drawGame(game);
});
