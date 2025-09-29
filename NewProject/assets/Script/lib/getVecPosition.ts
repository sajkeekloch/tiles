export const getVecPosition = (
  nodeW: number,
  nodeH: number,
  tileW: number,
  tileH: number,
  fieldSize: number,
  row: number,
  col: number,
): cc.Vec3 => {
  const fieldWidth = nodeW - 90
  const fieldHeight = nodeH - 90
  const offsetX = -(fieldWidth - tileW) / 2
  const offsetY = -(fieldHeight - tileH) / 2
  return new cc.Vec3(
    offsetX + col * (fieldWidth / fieldSize),
    offsetY + row * (fieldHeight / fieldSize),
    0,
  )
}
