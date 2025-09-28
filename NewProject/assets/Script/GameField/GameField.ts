import { Tile } from '../Tile/Tile';
const { ccclass, property } = cc._decorator;
const { Component, Sprite, SpriteFrame, Node, Prefab, instantiate, Vec3 } = cc;


@ccclass('GameField')
export class GameField extends Component {
    // Префаб тайла
    @property(Prefab)
    tilePrefab: Prefab = null;

    // Массив спрайтов для разных цветов тайлов
    @property([SpriteFrame])
    tileColors: SpriteFrame[] = [];

    // Размер тайла
    @property
    tileWidth: number = 100;
    @property
    tileHeight: number = 112;

    // Размер игрового поля
    private readonly fieldSize: number = 9;
    private tiles: Node[][] = [];

    onLoad() {
        // Заполняем поле сразу при загрузке компонента
        this.initializeField();
    }

    private initializeField() {
        this.tiles = new Array(this.fieldSize);
        for (let i = 0; i < this.fieldSize; i++) {
            this.tiles[i] = new Array(this.fieldSize);
        }

        // смещение
        const fieldWidth = this.node.width;
        const fieldHeight = this.node.height;
        const offsetX = -(fieldWidth - this.tileWidth / 2) / 2;
        const offsetY = -(fieldHeight - this.tileHeight) / 2;

        for (let row = 0; row < this.fieldSize; row++) {
            for (let col = 0; col < this.fieldSize; col++) {
                // Создаем экземпляр тайла
                if (!this.tilePrefab) {
                    console.error('tilePrefab не назначен! Пожалуйста, назначьте префаб в инспекторе.');
                    return;
                }
                const tileNode = instantiate(this.tilePrefab);

                // Устанавливаем позицию тайла на поле с учетом смещения для центрирования
                tileNode.setPosition(new Vec3(
                    offsetX + col * (fieldWidth / this.fieldSize),
                    offsetY + row * (fieldHeight / this.fieldSize),
                    0
                ));

                // Добавляем тайл как дочерний узел к игровому полю
                tileNode.parent = this.node;

                // Получаем компонент Tile
                const tileComponent = tileNode.getComponent(Tile) || tileNode.addComponent(Tile);

                // Устанавливаем случайный цвет тайла
                const randomColorIndex = Math.floor(Math.random() * this.tileColors.length);
                tileComponent.setColor(randomColorIndex, this.tileColors[randomColorIndex]);

                // Устанавливаем позицию в сетке
                tileComponent.setGridPosition(row, col);

                // Сохраняем ссылку на тайл в двумерном массиве
                this.tiles[row][col] = tileNode;
            }
        }

        console.log('Игровое поле успешно заполнено!');
    }

    // Получение тайла по координатам
    public getTile(row: number, col: number): Node {
        if (row >= 0 && row < this.fieldSize && col >= 0 && col < this.fieldSize) {
            return this.tiles[row][col];
        }
        return null;
    }

    // Получение цвета тайла
    public getTileColor(row: number, col: number): number {
        const tileNode = this.getTile(row, col);
        if (tileNode) {
            const tileComponent = tileNode.getComponent(Tile);
            if (tileComponent) {
                return tileComponent.getColorIndex();
            }
        }
        return -1;
    }

    // Метод для перемешивания всех тайлов на поле (может пригодиться)
    public reshuffleField() {
        for (let row = 0; row < this.fieldSize; row++) {
            for (let col = 0; col < this.fieldSize; col++) {
                const tileNode = this.tiles[row][col];
                if (tileNode) {
                    // Устанавливаем новый случайный цвет
                    const randomColorIndex = Math.floor(Math.random() * this.tileColors.length);
                    const tileComponent = tileNode.getComponent(Tile);
                    if (tileComponent) {
                        tileComponent.setColor(randomColorIndex, this.tileColors[randomColorIndex]);
                    }
                }
            }
        }
        console.log('Игровое поле перемешано!');
    }
}

