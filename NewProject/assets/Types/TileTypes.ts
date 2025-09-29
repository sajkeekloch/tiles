const BLUE = 1
const GREEN = 2
const PURPLE = 3
const RED = 4
const YELLOW = 5

const BLUE_ALIAS = 'BLUE'
const GREEN_ALIAS = 'GREEN'
const PURPLE_ALIAS = 'PURPLE'
const RED_ALIAS = 'RED'
const YELLOW_ALIAS = 'YELLOW'

const TileTypesMap = {
  [BLUE]: BLUE_ALIAS,
  [GREEN]: GREEN_ALIAS,
  [PURPLE]: PURPLE_ALIAS,
  [RED]: RED_ALIAS,
  [YELLOW]: YELLOW_ALIAS,
}

type TTileType =
  | typeof BLUE
  | typeof GREEN
  | typeof PURPLE
  | typeof RED
  | typeof YELLOW


export { TileTypesMap, TTileType, RED }