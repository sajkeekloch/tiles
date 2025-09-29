const { ccclass, property } = cc._decorator;

@ccclass('ShuffleCount')
export class ShuffleCount extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    onLoad() {
        if (!this.label) {
            this.label = this.getComponent(cc.Label);
        }
    }

    public setText(value: number) {
        if (this.label) {
            this.label.string = value.toString();
        } else {
            cc.warn('[ShuffleCount] label is null');
        }
        if (value == 0) {
            this.node.parent.opacity = 120;
        }
    }
}
