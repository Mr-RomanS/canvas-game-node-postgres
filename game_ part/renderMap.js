// отрисовка всей карты

export function drawMap(ctx, map, spielBlock) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === '#') ctx.fillStyle = 'black';
      if (map[y][x] === '.') ctx.fillStyle = 'rgb(232, 225, 201)';

      ctx.fillRect(x * spielBlock, y * spielBlock, spielBlock, spielBlock);
    }
  }
}
