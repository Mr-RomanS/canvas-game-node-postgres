
// отрисовка двери
export function doorsDraw(array, spielBlock,ctx){

    let x = array.x * spielBlock;
    let y = array.y * spielBlock;
    

    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 1;

    ctx.strokeRect(x, y, spielBlock, spielBlock);

    ctx.fillStyle = 'black';


    let closeDoors = array.close;

    if(array.achse === 'up'){
ctx.fillRect(x, y, spielBlock, closeDoors);
ctx.strokeRect(x, y, spielBlock, closeDoors);

    }
    if(array.achse === 'left'){
        ctx.fillRect(x,y,closeDoors,spielBlock);
        ctx.strokeRect(x,y,closeDoors,spielBlock);
    }
    if(array.achse === 'right'){
    // растём вправо, но начинаем справа налево:
    // x + (spielBlock - closeDoors) — стартуем от правого края
    ctx.fillRect(x + (spielBlock - closeDoors), y, closeDoors, spielBlock);
    ctx.strokeRect(x + (spielBlock - closeDoors), y, closeDoors, spielBlock);
}

if(array.achse === 'botton'){ // оставляю твоё слово как есть
    // растём снизу вверх:
    // y + (spielBlock - closeDoors) — стартуем от нижнего края
    ctx.fillRect(x, y + (spielBlock - closeDoors), spielBlock, closeDoors);
    ctx.strokeRect(x, y + (spielBlock - closeDoors), spielBlock, closeDoors);
}

}
// движиение двери
export function doorsMowe(
  map,
  dt,
  spielBlock,
  playerX,
  playerY,
  playerSize,
  door,
  bonusZehler,
  ctx,
  keyCounter
) {
  // 1) находим клетку игрока (по центру)
  let offset = (spielBlock - playerSize) / 2;

  let centerX = playerX + offset + playerSize / 2;
  let centerY = playerY + offset + playerSize / 2;

  let playerTileX = Math.floor(centerX / spielBlock);
  let playerTileY = Math.floor(centerY / spielBlock);

  // 2) для каждой двери решаем: закрыта или открыта
  for (const d of door) {
    if (!map[d.y] || map[d.y][d.x] === undefined) continue;

    // расстояние в клетках по X и Y
    let distX = Math.abs(playerTileX - d.x);
    let distY = Math.abs(playerTileY - d.y);

    let shouldClose = false;
    // если далеко — дверь закрыта

    if (d.type === 'exit') {
      if(distX > 1 || distY > 1){
        shouldClose = true;

        if (d.close >= spielBlock) {
                d.close = spielBlock;
                map[d.y][d.x] = '#';
        }
      } else{
        if (d.close === spielBlock && (bonusZehler < 20 || keyCounter < d.needKeys)) {
            shouldClose = true;
            map[d.y][d.x] = '#';
          } else {
            shouldClose = false;
            map[d.y][d.x] = '.';
        }
        
    }
    }

    if(d.type === 'trap'){
        if(distX <= 1 && distY <= 1){
            shouldClose = true;
            if (d.close >= spielBlock) {
                map[d.y][d.x] = '#';
    }
            
        } else { 
            shouldClose = false;
            map[d.y][d.x] = '.';
        }
    }

    if (shouldClose) {
        d.close += d.growSpeed * dt;
    if (d.close >= spielBlock) d.close = spielBlock;
    } else {
             d.close -= d.growSpeed * dt;
    if (d.close < 0) d.close = 0;
        }
    if (d.close > 0) {
        doorsDraw(d, spielBlock, ctx);
    }
}
}
// Рисуем колючки 
export function trapDraw(trap, spielBlock, ctx) {
  let x = trap.x * spielBlock; 
  let y = trap.y * spielBlock;
  let half = spielBlock / 2;

  ctx.fillStyle = "red";

  if(trap.achse === 'bottom'){
     // 1) ЛЕВЫЙ треугольник
  ctx.beginPath();
  ctx.moveTo(x, y + spielBlock);          // левый низ
  ctx.lineTo(x + half / 2, y + half / 2);            // верх по центру левой половины
  ctx.lineTo(x + half, y + spielBlock);   // правый низ левой половины
  ctx.closePath();
  ctx.fill();

  // 2) ПРАВЫЙ треугольник
  ctx.beginPath();
  ctx.moveTo(x + half, y + spielBlock);       // левый низ правой половины
  ctx.lineTo(x + half + half / 2, y + half / 2);         // верх по центру правой половины
  ctx.lineTo(x + spielBlock, y + spielBlock); // правый низ
  ctx.closePath();
  ctx.fill();
  }

  if(trap.achse === 'up'){
    ctx.beginPath();
    ctx.moveTo(x + half / 2,y + half + half / 2);
    ctx.lineTo(x,y);
    ctx.lineTo(x + half,y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + spielBlock,y);
    ctx.lineTo(x + half + half / 2, y + half + half / 2);
    ctx.lineTo(x + half,y);
    ctx.closePath();
    ctx.fill();
  }

  if(trap.achse === 'right'){

    ctx.beginPath();
    ctx.moveTo(x + half / 2, y + half + half / 2);
    ctx.lineTo(x + spielBlock, y + spielBlock);
    ctx.lineTo(x + spielBlock, y + half);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + half / 2, y + half / 2);
    ctx.lineTo(x + spielBlock, y + half);
    ctx.lineTo(x + spielBlock, y);
    ctx.closePath();
    ctx.fill();
  }

   if(trap.achse === 'left'){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + half + half / 2, y + half / 2);
    ctx.lineTo(x, y + half)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath();
    ctx.moveTo(x, y + half);
    ctx.lineTo(x + half + half / 2, y + half + half / 2);
    ctx.lineTo(x, y + spielBlock);
    ctx.closePath();
    ctx.fill();
   }

}
//Рисуем обозначение колючек
export function warnungTrap(trap, spielBlock, ctx) {
  let x = trap.x * spielBlock;
  let y = trap.y * spielBlock;

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;

  ctx.beginPath();

    if (trap.achse === 'up') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + spielBlock, y);
  }
    if (trap.achse === 'left') {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + spielBlock);
  }
    if (trap.achse === 'right') {
    ctx.moveTo(x + spielBlock, y);
    ctx.lineTo(x + spielBlock, y + spielBlock);
  }
    if (trap.achse === 'bottom') {
    ctx.moveTo(x, y + spielBlock);
    ctx.lineTo(x + spielBlock, y + spielBlock);
  }

  ctx.stroke();
}
// движиение колючки
export function moveTrap(
    dt,
    traps,
    playerX,
    playerY,
    playerSize,
    spielBlock,
    ctx){
     // 1) находим клетку игрока (по центру)
  let offset = (spielBlock - playerSize) / 2;

  let centerX = playerX + offset + playerSize / 2;
  let centerY = playerY + offset + playerSize / 2;

  let playerTileX = Math.floor(centerX / spielBlock);
  let playerTileY = Math.floor(centerY / spielBlock);


  for(const trap of traps ){
        // расстояние в клетках по X и Y
    let distX = Math.abs(playerTileX - trap.x);
    let distY = Math.abs(playerTileY - trap.y);

    if( distX < 4 && distY < 4 ){ 
        warnungTrap(trap, spielBlock, ctx);
    }

    }
}
export function trapsLogic(
  dt,
  traps,
  playerX,
  playerY,
  playerSize,
  spielBlock,
  ctx,
  damageTrap
) {
  // клетка игрока (по центру)
  let offset = (spielBlock - playerSize) / 2;
  let centerX = playerX + offset + playerSize / 2;
  let centerY = playerY + offset + playerSize / 2;

  let playerTileX = Math.floor(centerX / spielBlock);
  let playerTileY = Math.floor(centerY / spielBlock);

  for (const trap of traps) {
    let distX = Math.abs(playerTileX - trap.x);
    let distY = Math.abs(playerTileY - trap.y);
    let near = (distX < 3 && distY < 3); // 0..3 клетка

    // 1) если игрок ушёл — trap должна исчезнуть сразу и сброситься
    if (!near) {
      trap.state = 'idle';
      trap.timer = 0;
      trap.didDamage = false;
      continue; // ничего не рисуем
    }
    // 2) игрок рядом. Логика цикла: active 2 сек -> cooldown 2 сек -> active...
    if (trap.state === 'idle') {
      trap.state = 'active';
      trap.timer = 2;
      trap.didDamage = false;  
    }

    trap.timer -= dt;

    if (trap.timer <= 0) {
      if (trap.state === 'active') {
        trap.state = 'cooldown';
        trap.timer = 2;
        trap.didDamage = false; 
      } else if (trap.state === 'cooldown') {
        trap.state = 'active';
        trap.timer = 2;
        trap.didDamage = false; 
      }
    }
    // 3) рисуем только когда active
    if (trap.state === 'active') {
      trapDraw(trap, spielBlock, ctx);
    }

     // ✅ урон: только один раз за фазу active
    const onTrapTile = (playerTileX === trap.x && playerTileY === trap.y);

    // урон: только если ловушка active + игрок на ней + ещё не били
    if (trap.state === 'active' && onTrapTile && !trap.didDamage) {
      damageTrap();          // (теперь это будет takeDamage)
      trap.didDamage = true;
    }

    // (необязательно) если игрок сошёл с клетки — разрешить ударить снова
    // даже в рамках той же active-фазы:
    if (!onTrapTile) {
      trap.didDamage = false;
    }
  }
}



// отрисовка и бонусов жизней и ключа
export function kreis(bonus,spielBlock,ctx) {
    // 1. Mittelpunkt des Blocks berechnen
    let centerX = bonus.x * spielBlock + spielBlock / 2;
    let centerY = bonus.y * spielBlock + spielBlock / 2;
    let radius = spielBlock / 2;

    // 2. Pfad für den Kreis beginnen
    ctx.beginPath();
    // arc(x, y, radius, startWinkel, endWinkel)
    // 2 * Math.PI entspricht 360 Grad (ein voller Kreis)
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = bonus.color;
    ctx.fill();
}
export function counterBonus(
  spielBlock,
  playerSize,
  playerX,
  playerY,
  bonus,
  bonusZehler,
  spanCounterBonus,
  keyCounter,
  spanCounterKey,
  lifeCounter,
  spanCounterLife
) {
  // 1) клетка игрока (по центру)
  let offset = (spielBlock - playerSize) / 2;

  let centerX = playerX + offset + playerSize / 2;
  let centerY = playerY + offset + playerSize / 2;

  let playerTileX = Math.floor(centerX / spielBlock);
  let playerTileY = Math.floor(centerY / spielBlock);

  for (const el of bonus) {
    if (el.state === "inActive") continue;

    const onTile = (playerTileX === el.x && playerTileY === el.y);
    if (!onTile) continue;

    // ✅ 1) ключ
    if (el.color === "yellow") {
      keyCounter++;
      spanCounterKey.textContent = keyCounter;
      el.state = "inActive";
      continue;
    }

    // ✅ 2) здоровье (макс 5)
    if (el.color === "red") {
      if (lifeCounter < 5) {
        lifeCounter++;
        spanCounterLife.textContent = lifeCounter;
        el.state = "inActive"; // забираем только если реально выдали жизнь
      }
      continue; // если lifeCounter == 5 — ничего не делаем, бонус остаётся
    }

    // ✅ 3) обычные бонусы (зелёные и т.п.)
    bonusZehler++;
    spanCounterBonus.textContent = bonusZehler;
    el.state = "inActive";
  }

  return { bonusZehler, keyCounter, lifeCounter };
}


