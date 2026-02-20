export function playerDraw(
  spielBlock,
  playerSize,
  playerX,
  playerY,
  ctx,
  playerNormImg,
  playerSadImg,
  playerImgLoaded,
  blinkActive,
  blinkUntil
) {

  let offset = (spielBlock - playerSize) / 2;
  let drawX = playerX + offset;
  let drawY = playerY + offset;

  if (!playerImgLoaded) return;

  // 👇 ВОТ ТВОЯ ЧАСТЬ — ОСТАВЛЯЕМ
  const scale = 1.3;
  const w = playerSize * scale;
  const h = playerSize * scale;
  const imgX = drawX - (w - playerSize) / 2;
  const imgY = drawY - (h - playerSize) / 2;

  // 👇 Выбор картинки
  let img = playerNormImg;

  if (blinkActive) {
    const now = performance.now();
    if (now < blinkUntil) {
      const blinkOn = Math.floor(now / 120) % 2 === 0;
      img = blinkOn ? playerSadImg : playerNormImg;
    }
  }

  ctx.drawImage(img, imgX, imgY, w, h);
}

//управление персонажем
export function movePlayer(
    stepX,
    stepY,
    playerX,
    playerY,
    spielBlock,
    playerSize,
    map
) {
let newCellX = playerX + stepX;
let newCellY = playerY + stepY;


    let offset = (spielBlock - playerSize) / 2;

    let realX = newCellX + offset;
    let realY = newCellY + offset

  // индексы клеток, где будут углы игрока после шага
  let left   = Math.floor(realX / spielBlock);
  let right  = Math.floor((realX + playerSize - 1) / spielBlock);
  let top    = Math.floor(realY / spielBlock);
  let bottom = Math.floor((realY + playerSize - 1) / spielBlock);

  // защита от выхода за границы карты (иначе будут undefined)
  if (
    !map[top] || 
    !map[bottom] || 
    map[top][left] === undefined || 
    map[top][right] === undefined
) {
    return { playerX, playerY };

  }

  // если все 4 клетки НЕ стена — разрешаем движение
  if (
    map[top][left] !== '#' &&
    map[top][right] !== '#' &&
    map[bottom][left] !== '#' &&
    map[bottom][right] !== '#'
  ) {
    playerX = newCellX;
    playerY = newCellY;
  }
return { playerX, playerY };

}