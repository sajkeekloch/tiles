export const isInsideField = (x: number, y: number, size: number) => {
    return x >= 0 && x <= size && y >= 0 && y <= size
}