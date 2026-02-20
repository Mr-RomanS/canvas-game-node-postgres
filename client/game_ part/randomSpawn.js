// получить все свободные клетки карты
export function getFreeCells(map) {
  const cells = [];

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === ".") {
        cells.push({ x, y });
      }
    }
  }

  return cells;
}


// перемешивание массива
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}


// генерация бонусов
export function generateBonus(map, countGreen, countBlue, minDist = 3) {

  let free = getFreeCells(map);
  shuffle(free);

  const result = [];

  function isFarEnough(x, y) {

    for (const b of result) {

      const dx = Math.abs(b.x - x);
      const dy = Math.abs(b.y - y);

      if (dx < minDist && dy < minDist) {
        return false;
      }

    }

    return true;
  }

  // зелёные
  for (const cell of free) {

    if (result.length >= countGreen) break;

    if (isFarEnough(cell.x, cell.y)) {
      result.push({
        x: cell.x,
        y: cell.y,
        color: "green",
        state: "active"
      });
    }

  }

  // синие
  for (const cell of free) {

    if (result.length >= countGreen + countBlue) break;

    if (isFarEnough(cell.x, cell.y)) {
      result.push({
        x: cell.x,
        y: cell.y,
        color: "yellow",
        state: "active"
      });
    }

  }

  return result;
}

