import { Game } from '../Game/Game'
import { RED, TTileType } from '../../Types/TileTypes'

const { ccclass, property } = cc._decorator
const { Component, Sprite, SpriteFrame, Node, Prefab, instantiate, Vec3 } = cc

@ccclass('Tile')
export class Tile extends cc.Component {
  public type: TTileType = RED
  private spriteComponent: cc.Sprite = null
  private gridRow: number = 0
  private gridCol: number = 0
  private originalScale: cc.Vec3 = new cc.Vec3(1, 1, 1)
  private position: cc.Vec3 = null
  // анимация
  private fallDuration: number = 0.5
  private fallHeight = 1000

  onLoad() {
    this.spriteComponent = this.getComponent(cc.Sprite)
    if (!this.spriteComponent) {
      this.spriteComponent = this.addComponent(cc.Sprite)
    }

    this.node.on(cc.Node.EventType.TOUCH_START, this.onTileClicked, this)
  }

  public setType(type: TTileType, color: SpriteFrame) {
    this.type = type
    if (this.spriteComponent && color) {
      this.spriteComponent.spriteFrame = color
    }
  }

  public getType(): TTileType {
    return this.type
  }

  public setGridPosition(row: number, col: number) {
    this.gridRow = row
    this.gridCol = col
  }

  public getGridPosition(): { row: number; col: number } {
    return { row: this.gridRow, col: this.gridCol }
  }

  public fallFromHeight() {
    this.position = this.node.position.clone()
    // Устанавливаем начальную позицию для падения
    const startPosition = this.position.clone()
    startPosition.y += this.fallHeight
    this.node.setPosition(startPosition)

    // Создаем анимацию падения с отскоком
    cc.tween(this.node)
      .delay(0)
      .to(
        this.fallDuration,
        { position: this.position },
        { easing: 'bounceOut' },
      )
      .start()
  }

  private onTileClicked() {
    const gameField = this.node.parent.getComponent(Game)
    if (gameField) {
      gameField.onTileClicked(this.gridRow, this.gridCol, this.type)
    }
  }

  private async kill() {
    this.node.off(cc.Node.EventType.TOUCH_START, this.onTileClicked, this)
    this.node.pauseSystemEvents(true)

    cc.tween(this.node)
      .call(() => {
        this.node.removeFromParent()
        this.node.destroy()
      })
      .start()
  }

  private playTileAnimation() {
    const scaleUp = cc.scaleTo(
      0.1,
      this.originalScale.x * 1.1,
      this.originalScale.y * 1.1,
    )
    const shakeLeft = cc.moveBy(0.03, cc.v2(-5, 0))
    const shakeRight = cc.moveBy(0.03, cc.v2(10, 0))
    const shakeCenter = cc.moveBy(0.03, cc.v2(-5, 0))
    const shake = cc.sequence(shakeLeft, shakeRight, shakeCenter)
    const scaleDown = cc.scaleTo(
      0.1,
      this.originalScale.x,
      this.originalScale.y,
    )
    const sequence = cc.sequence(scaleUp, shake, scaleDown)
    this.node.runAction(sequence)
  }
}
