export function setupHud(socket, { onIds, onMyId } = {}) {
  const idsEl = document.getElementById("ids");

  socket.on("connect", () => {
    onMyId?.(socket.id);
  });

  socket.on("connected_ids", (ids) => {
    idsEl.innerHTML = "";
    ids.forEach((id) => {
      const li = document.createElement("li");
      li.innerHTML = `<code>${id}</code>${id === socket.id ? " (você)" : ""}`;
      idsEl.appendChild(li);
    });

    onIds?.(ids);
  });
}
