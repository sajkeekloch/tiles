const { ccclass, property } = cc._decorator;

@ccclass('PointsCount')
export class PointsCount extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;
    goal: number = 0;

    onLoad() {
        if (!this.label) {
            this.label = this.getComponent(cc.Label);
        }
    }

    public setGoal(value: number) {
        this.goal = value;
    }

    public setText(value: number) {
        if (this.label) {
            this.label.string = value.toString() + '/' + this.goal.toString()
        } else {
            cc.warn('[StepsCounter] label is null');
        }
    }
}
