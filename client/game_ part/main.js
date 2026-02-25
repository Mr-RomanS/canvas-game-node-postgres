
// переменные (размер клетки, размер игрока, скорость игрока и т.д.)
import { spielBlock, playerSize, playerSpeed, } from "./state.js";

// карта (2D массив символов)
import { map } from "./position_const/map.js";

// массивы объектов уровня (позиции бонусов, дверей, врагов, ловушек)
import { bonus } from "./position_const/bonus.js";
import { door } from "./position_const/door.js";
import { enemys } from "./position_const/enemys.js";
import { traps } from "./position_const/traps.js";

// отрисовка карты (рисует всю карту по 2D массиву)
import { drawMap } from "./renderMap.js";

// двери/ловушки/подбор бонусов/круги
import { doorsMowe, moveTrap, trapsLogic, counterBonus, kreis } from "./doorsAndTaps.js";

// враги
import { drawGegner, moveGegner } from "./enemys.js";

// игрок
import { playerDraw, movePlayer } from "./player.js";

// коллизия прямоугольников
import { isRectCollision } from "./collisions.js";

// генерация рандомных бонусов
import { generateBonus } from "./randomSpawn.js";


// =======================
// DOM / CANVAS
// =======================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const lobbyScreen = document.getElementById('lobbyScreen');
const btnPlayNow = document.getElementById('btn_playNow');

const counters = document.getElementById('countersBox');
const spanCounterLife = document.getElementById('spanCounterLife');
const spanCounterBonus = document.getElementById('spanCounterBonus');
const spanCounterKey = document.getElementById('spanCounterKey');
const spanCounterTime = document.getElementById('spanCounterTime');
const spanCounterTry = document.getElementById('spanCounterTry');

const divX = document.getElementById('zehlerX');
const divY = document.getElementById('zehlerY');


// =======================
// CAMERA SETTINGS (ДОБАВЛЕНО)
// =======================

// Сколько клеток видно на экране (это размер "окна камеры")
const viewCols = 13; // ширина окна в клетках 
const viewRows = 9;  // высота окна в клетках 

// Мёртвая зона: игрок может двигаться внутри этой зоны, камера не дёргается
// Если поставить 4x4 — это прям как ты хотел: "в пределах 4 клеток"
const deadZoneTilesX = 4;
const deadZoneTilesY = 4;

// Камера хранит "левый верхний угол окна" в мировых координатах (пиксели)
const camera = { x: 0, y: 0 };

// Размер мира (карты) в пикселях
function getWorldWidthPx() {
  return map[0].length * spielBlock;
}
function getWorldHeightPx() {
  return map.length * spielBlock;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Обновление камеры с dead-zone: камера двигается только когда игрок выходит за рамки зоны
function updateCameraWithDeadZone(playerX, playerY) {
  const worldW = getWorldWidthPx();
  const worldH = getWorldHeightPx();

  // Центр игрока (в мире)
  const pCenterX = playerX + playerSize / 2;
  const pCenterY = playerY + playerSize / 2;

  // Центр экрана (в мире) = camera + половина окна
  const screenCenterX = camera.x + canvas.width / 2;
  const screenCenterY = camera.y + canvas.height / 2;

  // Размер dead-zone (половины) в пикселях
  const dzHalfW = (deadZoneTilesX * spielBlock) / 2;
  const dzHalfH = (deadZoneTilesY * spielBlock) / 2;

  // Границы зоны в мире
  const left = screenCenterX - dzHalfW;
  const right = screenCenterX + dzHalfW;
  const top = screenCenterY - dzHalfH;
  const bottom = screenCenterY + dzHalfH;

  // Если игрок вышел — двигаем камеру ровно настолько, чтобы вернуть его на границу зоны
  if (pCenterX < left) camera.x -= (left - pCenterX);
  if (pCenterX > right) camera.x += (pCenterX - right);
  if (pCenterY < top) camera.y -= (top - pCenterY);
  if (pCenterY > bottom) camera.y += (pCenterY - bottom);

  // Ограничиваем камеру границами мира
  camera.x = clamp(camera.x, 0, worldW - canvas.width);
  camera.y = clamp(camera.y, 0, worldH - canvas.height);
}


// =======================
// GAME STATE
// =======================

let lastTime = 0;
let isPaused = false;

// неуязвимость игрока (после урона)
let playerInvulnerable = false;

// мигание игрока (переключение картинок)
let blinkUntil = 0;
let blinkActive = false;

// счётчики
let lifeCounter = 3;
let keyCounter = 0;
let tryCount = 1;
let bonusZehler = 0;

// флаг столкновения за кадр (чтобы урон сработал 1 раз)
let gotHit = false;

// позиция игрока в МИРЕ (пиксели)
let playerX = 17 * spielBlock;
let playerY = 20 * spielBlock;

// управление
let moveUp = false;
let moveDown = false;
let moveLeft = false;
let moveRight = false;

// таймер
let gameTime = 0;
let timerRunning = false;

// =======================
// INITIAL SNAPSHOT (для resetGame)
// =======================

const initial = {
  lifeCounter: 3,
  keyCounter: 0,
  bonusZehler: 0,
  playerX: playerX,
  playerY: playerY,
  gameTime: 0,

  map: map.map(row => row.slice()),

  bonus: bonus.map(b => ({ ...b })),
  door: door.map(d => ({ ...d })),
  traps: traps.map(t => ({ ...t })),
  enemys: enemys.map(e => ({ ...e })),
};


// =======================
// IMAGES
// =======================

const keyImg = new Image();
keyImg.src = "./image/key.svg";
let keyImgLoaded = false;
keyImg.onload = () => { keyImgLoaded = true; };

const bonusImg = new Image();
bonusImg.src = "./image/sack-dollar.svg";
let bonusImgLoaded = false;
bonusImg.onload = () => { bonusImgLoaded = true; };

const healthImg = new Image();
healthImg.src = "./image/medizin.svg";
let healthImgLoaded = false;
healthImg.onload = () => { healthImgLoaded = true; };

const enemyImg = new Image();
enemyImg.src = "./image/ghost-enemy.svg";
let enemyImgLoaded = false;
enemyImg.onload = () => { enemyImgLoaded = true; };

const scullImg = new Image();
scullImg.src = "./image/skull.svg";
let scullImgLoaded = false;
scullImg.onload = () => { scullImgLoaded = true; };

const playerSadImg = new Image();
playerSadImg.src = "./image/face-grin.svg";

const playerNormImg = new Image();
playerNormImg.src = "./hero2.png";

// флаг "хотя бы нормальная картинка загрузилась"
let playerImgLoaded = false;
playerNormImg.onload = () => { playerImgLoaded = true; };


// =======================
// HELPERS
// =======================

// увеличивает попытки (твой счётчик tries)
function counterTry() {
  tryCount += 1;
  spanCounterTry.textContent = tryCount;
}

// урон: снимаем жизнь + включаем неуязвимость и мигание 1.5 сек
function takeDamage() {
  if (playerInvulnerable) return;

  lifeCounter -= 1;
  spanCounterLife.textContent = lifeCounter;

  playerInvulnerable = true;

  blinkActive = true;
  blinkUntil = performance.now() + 1500;

  setTimeout(() => {
    playerInvulnerable = false;
    blinkActive = false;
  }, 1500);

  if (lifeCounter <= 0) {
    resetGame();
    newRoundBonus();
    counterTry();
  }
}
// =======================
// TIMER
// =======================

function startGameTimer() {
  gameTime = 0;
  timerRunning = true;
}

function updateGameTimer(dt) {
  if (!timerRunning) return;
  gameTime += dt;
}

function updateTimerUI() {
  const total = Math.floor(gameTime);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  spanCounterTime.textContent =
    minutes.toString().padStart(2, '0') +
    ':' +
    seconds.toString().padStart(2, '0');
}
// =======================
// PAUSE / RESET
// =======================

// пауза: переключаем флаг и сбрасываем lastTime, чтобы dt не прыгнул
function togglePaused(now) {
  isPaused = !isPaused;
  lastTime = now;
}
// reset: возвращаем всё в исходное состояние (числа, карта, объекты)
function resetGame() {
  // числа
  lifeCounter = initial.lifeCounter;
  keyCounter = initial.keyCounter;
  bonusZehler = initial.bonusZehler;
  gameTime = initial.gameTime;

  spanCounterLife.textContent = lifeCounter;
  spanCounterKey.textContent = keyCounter;
  spanCounterBonus.textContent = bonusZehler;
  updateTimerUI();

  // позиция игрока
  playerX = initial.playerX;
  playerY = initial.playerY;

  // карта
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x] = initial.map[y][x];
    }
  }

  // массивы объектов (обновляем существующие объекты, не заменяем ссылки)
  for (let i = 0; i < bonus.length; i++) Object.assign(bonus[i], initial.bonus[i]);
  for (let i = 0; i < door.length; i++) Object.assign(door[i], initial.door[i]);
  for (let i = 0; i < traps.length; i++) Object.assign(traps[i], initial.traps[i]);
  for (let i = 0; i < enemys.length; i++) Object.assign(enemys[i], initial.enemys[i]);

  // сброс нажатий
  moveUp = moveDown = moveLeft = moveRight = false;

  // сброс времени кадра
  lastTime = performance.now();

  // снимаем паузу
  isPaused = false;

  // === CAMERA RESET (ДОБАВЛЕНО)
  // чтобы после ресета камера не оставалась где-то в стороне
  camera.x = 0;
  camera.y = 0;
}
// генерация бонусов: сохраняем фиксированные (yellow/red), остальное рандом
function newRoundBonus() {
  let fixed = [];
  for (let b of bonus) {
    if (b.color === "yellow" || b.color === "red") {
      fixed.push({ x: b.x, y: b.y, color: b.color, state: "active" });
    }
  }

  let randomBonus = generateBonus(map, 22, 1);

  bonus.length = 0;

  for (let f of fixed) bonus.push(f);
  for (let rb of randomBonus) bonus.push(rb);
}
// =======================
// MAIN LOOP (GAMELOOP)
// =======================

function gameloop(timestamp) {
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // пауза
  if (isPaused) {
    requestAnimationFrame(gameloop);
    return;
  }

  gotHit = false;


  // =======================
  // 1) ЛОГИКА (движение игрока)
  // =======================

  if (moveUp) {
    const r = movePlayer(0, -playerSpeed, playerX, playerY, spielBlock, playerSize, map);
    playerX = r.playerX;
    playerY = r.playerY;
  }
  if (moveDown) {
    const r = movePlayer(0, playerSpeed, playerX, playerY, spielBlock, playerSize, map);
    playerX = r.playerX;
    playerY = r.playerY;
  }
  if (moveLeft) {
    const r = movePlayer(-playerSpeed, 0, playerX, playerY, spielBlock, playerSize, map);
    playerX = r.playerX;
    playerY = r.playerY;
  }
  if (moveRight) {
    const r = movePlayer(playerSpeed, 0, playerX, playerY, spielBlock, playerSize, map);
    playerX = r.playerX;
    playerY = r.playerY;
  }

    // прямоугольник игрока (для коллизии с врагами)
 const hitScalePlayer = 0.7; // ✅ меньше = коллизия позже
const playerRect = {
  x: playerX + (playerSize * (1 - hitScalePlayer)) / 2,
  y: playerY + (playerSize * (1 - hitScalePlayer)) / 2,
  w: playerSize * hitScalePlayer,
  h: playerSize * hitScalePlayer
};

  // подбор бонусов / ключей / аптечек (обновляет счётчики)
  const picked = counterBonus(
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
  );
  bonusZehler = picked.bonusZehler;
  keyCounter = picked.keyCounter;
  lifeCounter = picked.lifeCounter;

  // таймер
  updateGameTimer(dt);
  updateTimerUI();

  // =======================
  // 2) КАМЕРА (ДОБАВЛЕНО)
  // =======================

  // Размер окна камеры: 10x6 клеток
  // (делаем тут, чтобы точно применялось)
  canvas.width = viewCols * spielBlock;
  canvas.height = viewRows * spielBlock;

  // обновляем камеру ПОСЛЕ движения игрока
  updateCameraWithDeadZone(playerX, playerY);

  // очищаем только видимое окно
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // =======================
  // 3) РИСОВАНИЕ (внутри translate)
  // =======================

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  // карта
  drawMap(ctx, map, spielBlock);

  // бонусы
  for (const el of bonus) {
    if (el.state !== "active") continue;

    const x = el.x * spielBlock;
    const y = el.y * spielBlock;

    if (el.color === "yellow") {
      if (keyImgLoaded) ctx.drawImage(keyImg, x, y, spielBlock, spielBlock);
      else kreis(el, spielBlock, ctx);

    } else if (el.color === "green") {
      if (bonusImgLoaded) ctx.drawImage(bonusImg, x, y, spielBlock, spielBlock);
      else kreis(el, spielBlock, ctx);

    } else if (el.color === "red") {
      if (healthImgLoaded) ctx.drawImage(healthImg, x, y, spielBlock, spielBlock);
      else kreis(el, spielBlock, ctx);

    } else {
      kreis(el, spielBlock, ctx);
    }
  }

  // враги: двигаем + рисуем + считаем столкновение
  for (const enemy of enemys) {
    moveGegner(enemy, spielBlock, map);

const scale = enemy.size || 0.7;
const w = spielBlock * scale;
const h = spielBlock * scale;
const offsetX = (spielBlock - w) / 2;
const offsetY = (spielBlock - h) / 2;

// ✅ хитбокс врага = там же, где картинка
const enemyRectX = enemy.x + offsetX;
const enemyRectY = enemy.y + offsetY;

const hit = isRectCollision(
  playerRect.x, playerRect.y, playerRect.w, playerRect.h,
  enemyRectX, enemyRectY, w, h
);

    if (hit && !playerInvulnerable) {
      gotHit = true;
    }

    // выбор картинки врага по виду
    let img = null;
    let loaded = false;

    if (enemy.art === "ghost") { img = enemyImg; loaded = enemyImgLoaded; }
    else if (enemy.art === "scull") { img = scullImg; loaded = scullImgLoaded; }

    if (img && loaded) {
  const scale = enemy.size || 1;
  const w = spielBlock * scale;
  const h = spielBlock * scale;
  const offsetX = (spielBlock - w) / 2;
  const offsetY = (spielBlock - h) / 2;

  ctx.drawImage(img, enemy.x + offsetX, enemy.y + offsetY, w, h);
} else {
  drawGegner(ctx, enemy, spielBlock);
}
}


  // один раз после цикла врагов
  if (gotHit) takeDamage();

  // ловушки (камера влияет только на рисование, логика та же)
  moveTrap(dt, traps, playerX, playerY, playerSize, spielBlock, ctx);
  trapsLogic(dt, traps, playerX, playerY, playerSize, spielBlock, ctx, takeDamage);

  // двери
  doorsMowe(
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
  );

  // игрок
  playerDraw(
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
  );

  ctx.restore();

  requestAnimationFrame(gameloop);
}


// =======================
// EVENTS
// =======================

// пауза на Space (на отпускание)
window.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    togglePaused(performance.now());
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") moveUp = true;
  if (event.key === "ArrowDown") moveDown = true;
  if (event.key === "ArrowLeft") moveLeft = true;
  if (event.key === "ArrowRight") moveRight = true;
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowUp") moveUp = false;
  if (event.key === "ArrowDown") moveDown = false;
  if (event.key === "ArrowLeft") moveLeft = false;
  if (event.key === "ArrowRight") moveRight = false;
});

// кнопка "играть"
btnPlayNow.addEventListener("click", (e) => {
  if (e) {
    lobbyScreen.style.display = "none";
    canvas.style.display = "block";
    counters.style.display = "flex";
    startGameTimer();
  } else {
    lobbyScreen.style.display = "block";
    canvas.style.display = "none";
    counters.style.display = "none";
  }
});

// клик по канвасу: показываем координаты клетки
// ВАЖНО: при камере нужно прибавлять camera.x/camera.y
canvas.addEventListener("click", (e) => {
  const tileX = Math.floor((e.offsetX + camera.x) / spielBlock);
  const tileY = Math.floor((e.offsetY + camera.y) / spielBlock);

  if (divX && divY !== "") {
    divX.textContent = tileX;
    divY.textContent = tileY;
  }
});


// =======================
// START
// =======================

newRoundBonus();
requestAnimationFrame(gameloop);
