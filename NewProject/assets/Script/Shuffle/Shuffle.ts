import { Game } from '../Game/Game'
const { ccclass, property } = cc._decorator


@ccclass('Shuffle')
export default class Shuffle extends cc.Component {
    private game: Game = null

    onLoad() {
        this.game = this.node.parent.parent.getComponent(Game)
        this.node.on(cc.Node.EventType.TOUCH_START, this.onShuffle, this)
    }

    private async onShuffle() {
        await this.game.shuffleField()
    }
}