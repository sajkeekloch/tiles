export const getVecPosition = (
  gameField: cc.Node,
  tileW: number,
  tileH: number,
  fieldSize: number,
  row: number,
  col: number,
): cc.Vec3 => {
  const { width, height, y } = gameField
  const fieldWidth = width - 90
  const fieldHeight = height - 90
  const offsetX = -(fieldWidth - tileW) / 2
  const offsetY = -(fieldHeight - tileH) / 2 + y
  return new cc.Vec3(
    offsetX + col * (fieldWidth / fieldSize),
    offsetY + row * (fieldHeight / fieldSize),
    0,
  )
}
