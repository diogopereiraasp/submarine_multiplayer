import { createRenderer } from "./render/renderer.js";
import { createGame } from "./core/game.js";
import { setupHud } from "./ui/hud.js";
import { setupInput } from "./input/mouse.js";
import { createSocketClient } from "./net/socketClient.js";
import { CONFIG } from "./core/config.js";

const canvas = document.getElementById("game");

const renderer = createRenderer(canvas, {
  backgroundColor: CONFIG.visuals.backgroundColor,
  world: CONFIG.world,
});

const game = createGame({
  myColor: CONFIG.visuals.players.myColor,
  otherColor: CONFIG.visuals.players.otherColor,
  world: CONFIG.world,
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

setupHud(net.raw(), {
  onMyId: (id) => game.setMyId(id),
  onIds: (ids) => game.setConnectedIds(ids),
});

setupInput(canvas, game, renderer);

game.start(({ dt }) => {
  game.update(dt);

  const myPos = game.getMyPosition();
  if (myPos && game.isSpawned?.()) net.sendPlayerState(myPos);

  game.consumeSonarOutbox().forEach((p) => {
    net.emitSonar(p);
  });

  renderer.clear();
  renderer.drawGame(game);
});
