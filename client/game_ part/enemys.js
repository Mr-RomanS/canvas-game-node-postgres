
//отрисовка  треугольника
export function drawGegner(ctx,enemy,spielBlock){
        // 2. Рисуем врага (это просто отрисовка)
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y + spielBlock);
    ctx.lineTo(enemy.x + spielBlock / 2, enemy.y);
    ctx.lineTo(enemy.x + spielBlock, enemy.y + spielBlock);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
    }

//передвижиение треугольника
export function moveGegner(enemy,spielBlock,map) {
    // 1. Определяем, в какую сторону смотрим
    let checkX = enemy.x;
    let checkY = enemy.y;

    if (enemy.achse === 'x') {
        // Если враг идёт вправо
        if(enemy.speed > 0){
            checkX += spielBlock;
        }
        if(enemy.speed < 0){
            checkX = enemy.x -1;
        }
        // Определяем номер клетки, куда смотрим
        let mapX = Math.floor(checkX / spielBlock);
        let mapY = Math.floor(checkY / spielBlock);
        // Если впереди стена — разворачиваемся
        if (map[mapY][mapX] === '#') {
            enemy.speed = enemy.speed * -1;
        } else {
            enemy.x = enemy.x + enemy.speed;
        }
    } else {
        // Если враг идёт вниз
        if (enemy.speed > 0) {
            checkY = enemy.y + spielBlock;
        }
        // Если враг идёт вверх
        if (enemy.speed < 0) {
            checkY = enemy.y - 1;
        }
        let mapX = Math.floor(enemy.x / spielBlock);
        let mapY = Math.floor(checkY / spielBlock);

        if (map[mapY][mapX] === '#') {
            enemy.speed = enemy.speed * -1;
        } else {
            enemy.y = enemy.y + enemy.speed;
        }
    }
}

