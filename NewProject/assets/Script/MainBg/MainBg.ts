const { ccclass, property } = cc._decorator;

@ccclass
export default class BackgroundContain extends cc.Component {
    @property(cc.Node)
    background: cc.Node = null;

    onLoad() {
        this.fit();
        cc.view.setResizeCallback(() => this.fit());
    }

    private fit() {
        if (!this.background) return;

        const sprite = this.background.getComponent(cc.Sprite);
        if (!sprite || !sprite.spriteFrame) return;

        const win = cc.winSize; // текущая видимая область (Canvas)
        const img = sprite.spriteFrame.getOriginalSize(); // исходный размер картинки

        const scale = Math.min(
            win.width / img.width,
            win.height / img.height,
            1
        );

        this.background.anchorX = 0.5;
        this.background.anchorY = 0.5;
        this.background.setPosition(0, 0);
        this.background.setScale(scale, scale);
    }
}
