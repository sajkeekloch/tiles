import { Tile } from '../Tile/Tile'
import { TileTypesMap, TTileType } from '../../Types/TileTypes'
import { isInsideField } from '../lib/isInsideField'
import { getVecPosition } from '../lib/getVecPosition'
import { ITileNode } from '../../Types/TileNode'
import { tweenPromise } from '../lib/tweenPromice'
import { ShuffleCount } from '../ShuffleCount/ShuffleCount'
import { StepsCount } from '../StepsCount/StepsCount'
import { PointsCount } from '../PointsCount/PointsCount'
const { ccclass, property } = cc._decorator
const { Component, SpriteFrame, Prefab, instantiate, Vec3, Label, Node } = cc

@ccclass('Game')
export class Game extends Component {
  @property(Prefab)
  tilePrefab: Prefab = null
  @property([SpriteFrame])
  tileColors: SpriteFrame[] = []
  @property
  private readonly maxSteps: number = 50
  @property
  readonly maxShuffle: number = 3
  private tileWidth: number = 100
  private tileHeight: number = 112
  @property
  private readonly fieldSize: number = 9
  @property
  private readonly pointsGoal: number = 0;
  @property(ShuffleCount)
  shuffleCountLabel: ShuffleCount = null
  @property(StepsCount)
  stepsCountLabel: StepsCount = null
  @property(PointsCount)
  pointsCountLabel: PointsCount = null
  @property(Node)
  gameOverModal: Node = null;
  @property(Label)
  gameOverLabel: Label = null;
  private fieldDisabled = false;
  private shuffleCounter: number = 0
  private stepsCounter: number = 0
  private tiles: ITileNode[][] = []
  private gameField: cc.Node = null
  private points: number = 0

  onLoad() {
    this.gameField = this.node.children.find(el => el.name === 'GameField')
    this.initializeField()
    if (this.gameOverModal) {
      this.gameOverModal.active = false; // на всякий случай
    }
  }

  private initializeField() {
    this.fillEmpty()
    this.pointsCountLabel.setGoal(this.pointsGoal)
  }

  private cellToPos(row: number, col: number): Vec3 {
    return getVecPosition(
      this.gameField,
      this.tileWidth,
      this.tileHeight,
      this.fieldSize,
      row,
      col,
    )
  }

  private async fillTile(row: number, col: number) {
    if (!this.tilePrefab) {
      cc.warn('Лимит')
      return
    }
    const tileNode: ITileNode = instantiate(this.tilePrefab)
    tileNode.setPosition(this.cellToPos(row, col))
    tileNode.parent = this.node
    const tileComponent =
      tileNode.getComponent(Tile) || tileNode.addComponent(Tile)
    const index = Math.floor(Math.random() * this.tileColors.length)
    const type: TTileType = TileTypesMap[index]
    tileComponent.setType(type, this.tileColors[index])
    tileNode.type = type
    tileNode.component = tileComponent
    this.tiles[row][col] = tileNode
    tileComponent.setGridPosition(row, col)
    tileComponent.fallFromHeight()
  }

  private async useGravity(): Promise<[number, number][]> {
    const moves: Promise<void>[] = []
    const emptyCells: [number, number][] = []
    for (let col = 0; col < this.fieldSize; col++) {
      let tmpCol = 0
      for (let row = 0; row < this.fieldSize; row++) {
        const tile = this.tiles[row][col]
        if (tile) {
          if (row !== tmpCol) {
            this.tiles[tmpCol][col] = tile
            this.tiles[row][col] = null
            const position = this.cellToPos(tmpCol, col)
            const comp = tile.getComponent(Tile)
            comp?.setGridPosition(tmpCol, col)
            moves.push(tweenPromise(tile, 0.12, position))
          }
          tmpCol++
        }
      }
      for (let row = tmpCol; row < this.fieldSize; row++) {
        this.tiles[row][col] = null
        emptyCells.push([row, col])
      }
    }

    await Promise.all(moves)
    this.points = this.points + (emptyCells.length * 5)
    this.updatePointsLabel()
    return emptyCells
  }

  private async fillEmpty(tiles?: [number, number][]) {
    if (!!tiles?.length) {
      tiles.forEach(([row, col]) => {
        this.fillTile(row, col)
      })
    } else {
      this.tiles = new Array(this.fieldSize)
      for (let i = 0; i < this.fieldSize; i++) {
        this.tiles[i] = new Array(this.fieldSize)
      }
      for (let row = 0; row < this.fieldSize; row++) {
        for (let col = 0; col < this.fieldSize; col++) {
          this.fillTile(row, col)
        }
      }
    }
  }

  public getTile(row: number, col: number): ITileNode {
    if (row >= 0 && row < this.fieldSize && col >= 0 && col < this.fieldSize) {
      return this.tiles[row][col]
    }
    return null
  }

  public async crushTile(tiles: [number, number][]) {
    for (const [r, c] of tiles) {
      const node: ITileNode = this.getTile(r, c);
      // уже убран другим шагом
      if (!node || !cc.isValid(node)) continue;
      this.tiles[r][c] = null;
      // иначе могут остаться пустые клетки
      node.pauseSystemEvents(true);
      if (node.component?.kill) {
        await node.component.kill();
      } else {
        node.removeFromParent();
        node.destroy();
      }
    }
  }

  public async onTileClicked(row: number, col: number, type: TTileType) {
    if (this.fieldDisabled) return;
    this.fieldDisabled = true;
    try {
      const set = new Set<string>();
      const sameNeighbours = this.getSameNeighbours(row, col, type, set);

      if (sameNeighbours.length > 1) {
        await this.crushTile(sameNeighbours);
        const empty = await this.useGravity();
        await this.fillEmpty(empty);
        await this.normalizeGrid();
      } else {
        const tileNode = this.getTile(row, col);
        // узел мог уже исчезнуть из-за предыдущего шага
        if (tileNode && cc.isValid(tileNode)) {
          tileNode.component.playTileAnimation();
        }
      }
      this.stepsCounter++;
      this.updateStepsLabel();
      if (this.checkGameEnd()) return;
    } finally {
      await this.normalizeGrid()
      this.fieldDisabled = false;
    }
  }


  private getSameNeighbours(
    row: number,
    col: number,
    type: TTileType,
    visited: Set<string>,
  ): [number, number][] {
    const key = `${row},${col}`
    if (visited.has(key)) return []
    visited.add(key)

    const sameTypeTiles: [number, number][] = [[row, col]]

    const neighbours: [number, number][] = [
      [row - 1, col],
      [row, col + 1],
      [row + 1, col],
      [row, col - 1],
    ]

    for (const [neighbourRow, neighbourCol] of neighbours) {
      if (isInsideField(neighbourRow, neighbourCol, this.fieldSize)) {
        const tile = this.getTile(neighbourRow, neighbourCol)
        if (tile && tile.type === type) {
          sameTypeTiles.push(
            ...this.getSameNeighbours(
              neighbourRow,
              neighbourCol,
              type,
              visited,
            ),
          )
        }
      }
    }

    return sameTypeTiles
  }

  private async normalizeGrid() {
    const empties: [number, number][] = [];
    for (let r = 0; r < this.fieldSize; r++) {
      for (let c = 0; c < this.fieldSize; c++) {
        if (!this.tiles[r][c]) empties.push([r, c]);
      }
    }
    if (empties.length) {
      await this.fillEmpty(empties);
    }
  }


  public async shuffleField() {
    if (this.shuffleCounter >= this.maxShuffle) {
      cc.warn('Лимит')
      return
    }
    this.shuffleCounter++
    const kills: Promise<void>[] = []
    for (let row = 0; row < this.fieldSize; row++) {
      for (let col = 0; col < this.fieldSize; col++) {
        const tileNode = this.tiles[row][col]
        if (!tileNode) continue

        kills.push(
          tileNode.component.kill().then(() => (this.tiles[row][col] = null)),
        )
      }
    }

    await Promise.all(kills)
    await this.fillEmpty()
    this.updateShuffleLabel()
  }

  private updateShuffleLabel() {
    if (this.shuffleCountLabel) {
      this.shuffleCountLabel.setText(this.maxShuffle - this.shuffleCounter)
    }
  }

  private updateStepsLabel() {
    if (this.stepsCountLabel) {
      this.stepsCountLabel.setText(this.stepsCounter)
    }
  }

  private updatePointsLabel() {
    if (this.pointsCountLabel) {
      this.pointsCountLabel.setText(this.points)
    }
  }

  private showGameOver(msg: string) {
    this.fieldDisabled = true;
    if (this.gameOverLabel) this.gameOverLabel.string = msg;
    if (this.gameOverModal) this.gameOverModal.active = true;
  }

  public onGameOverClose() {
    this.restartGame();
  }

  private async restartGame() {
    if (this.gameOverModal) this.gameOverModal.active = false;

    for (let r = 0; r < this.fieldSize; r++) {
      for (let c = 0; c < this.fieldSize; c++) {
        const n = this.tiles?.[r]?.[c];
        if (n && cc.isValid(n)) {
          n.removeFromParent();
          n.destroy();
        }
      }
    }

    this.shuffleCounter = 0;
    this.stepsCounter = 0;
    this.points = 0;
    this.updateShuffleLabel();
    this.updateStepsLabel();
    this.updatePointsLabel();
    await this.fillEmpty();
    this.fieldDisabled = false;
  }

  private checkGameEnd(): boolean {
    if (this.stepsCounter >= this.maxSteps) {
      this.showGameOver('Ходы закончились!');
      return true;
    }
    if (this.points >= this.pointsGoal) {
      console.log('Победа')
      this.showGameOver(`Победа! Вы набрали ${this.points} очков`);
      return true;
    }
    return false;
  }
}
