import { ITileNode } from '../../Types/TileNode'

export const tweenPromise = (
  tile: ITileNode,
  duration: number,
  position: cc.Vec3,
) => {
  return new Promise<void>(resolve => {
    const t = cc.tween(tile).to(duration, { position }, { easing: 'bounceOut' })
    t.call(() => resolve()).start()
  })
}
