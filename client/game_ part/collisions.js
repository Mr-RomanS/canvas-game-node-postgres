

export function isRectCollision(
  playerX, playerY, playerW, playerH,
  enemyX, enemyY, enemyW, enemyH
) {
  return (
    playerX < enemyX + enemyW &&
    playerX + playerW > enemyX &&
    playerY < enemyY + enemyH &&
    playerY + playerH > enemyY
  );
}