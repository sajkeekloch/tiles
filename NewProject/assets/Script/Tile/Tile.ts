const { ccclass, property } = cc._decorator;

@ccclass('Tile')
export class Tile extends cc.Component {
    // Индекс цвета тайла
    private colorIndex: number = 0;
    // Спрайт тайла
    private spriteComponent: cc.Sprite = null;
    // Позиция тайла в сетке
    private gridRow: number = 0;
    private gridCol: number = 0;
    // Исходный размер тайла
    private originalScale: cc.Vec3 = new cc.Vec3(1, 1, 1);

    onLoad() {
        this.spriteComponent = this.getComponent(cc.Sprite);
        if (!this.spriteComponent) {
            this.spriteComponent = this.addComponent(cc.Sprite);
        }

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTileClicked, this);
    }

    // Установка цвета тайла
    public setColor(index: number, spriteFrame: cc.SpriteFrame) {
        this.colorIndex = index;
        if (this.spriteComponent && spriteFrame) {
            this.spriteComponent.spriteFrame = spriteFrame;
        }
    }

    // Получение индекса цвета тайла
    public getColorIndex(): number {
        return this.colorIndex;
    }

    // Установка позиции в сетке
    public setGridPosition(row: number, col: number) {
        this.gridRow = row;
        this.gridCol = col;
    }

    // Получение позиции в сетке
    public getGridPosition(): { row: number, col: number } {
        return { row: this.gridRow, col: this.gridCol };
    }

    // Обработчик нажатия на тайл
    private onTileClicked() {
        // Анимация "дрожания" и увеличения тайла
        this.playTileAnimation();
    }

    // Анимация тайла при нажатии
    private playTileAnimation() {
        // Остановим предыдущие действия, если они были
        // this.node.stopAllActions();

        // Сбрасываем масштаб к исходному
        // this.originalScale = cc.v3(this.width, this.height, 0);

        // Создаем последовательность действий: увеличение -> тряска -> возврат к оригинальному размеру
        const scaleUp = cc.scaleTo(0.1, this.originalScale.x * 1.1, this.originalScale.y * 1.1);

        // Создаем эффект дрожания (небольшие смещения влево-вправо)
        const shakeLeft = cc.moveBy(0.03, cc.v2(-5, 0));
        const shakeRight = cc.moveBy(0.03, cc.v2(10, 0));
        const shakeCenter = cc.moveBy(0.03, cc.v2(-5, 0));
        const shake = cc.sequence(shakeLeft, shakeRight, shakeCenter);

        // Возврат к оригинальному размеру
        const scaleDown = cc.scaleTo(0.1, this.originalScale.x, this.originalScale.y);

        // Запускаем последовательность анимаций
        const sequence = cc.sequence(scaleUp, shake, scaleDown);
        this.node.runAction(sequence);
    }
}