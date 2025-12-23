import { createRenderer } from "./render/renderer.js";
import { createGame } from "./core/game.js";
import { WORLD } from "./core/world.js";
import { setupHud } from "./ui/hud.js";
import { setupInput } from "./input/mouse.js";
import { createSocketClient } from "./net/socketClient.js";

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

const net = createSocketClient({
  onConnectId: (id) => game.setMyId(id),
  onConnectedIds: (ids) => game.setConnectedIds(ids),
  onPlayersState: (list) => {
    list.forEach(({ id, x, y }) => {
      game.setPlayerPosition(id, x, y);
    });
  },
  onPlayerState: ({ id, x, y }) => {
    game.setPlayerPosition(id, x, y);
  },
  onSonarHit: (payload) => game.onSonarHit(payload),
  onSonarConfirm: (payload) => game.onSonarConfirm(payload),
});

// HUD continua usando o socket real para listar IDs (sem mexer no funcionamento)
setupHud(net.raw(), {
  onMyId: (id) => game.setMyId(id),
  onIds: (ids) => game.setConnectedIds(ids),
});

setupInput(canvas, game, renderer);

game.start(({ dt }) => {
  game.update(dt);

  const myPos = game.getMyPosition();
  if (myPos) net.sendPlayerState(myPos);

  game.consumeSonarOutbox().forEach((p) => {
    net.emitSonar(p);
  });

  renderer.clear();
  renderer.drawGame(game);
});
