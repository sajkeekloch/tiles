import { TTileType } from './TileTypes'

export interface ITileNode extends cc.Node {
  component: any
  type: TTileType
}
