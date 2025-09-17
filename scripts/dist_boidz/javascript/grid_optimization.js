/**
 * Divide the viewport into a grid for optimizing updates...
 */
export class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.cells = new Map(); // key: "x,y" string, value: Set of boids
    }

    _hash(x, y) {
        // simple integer grid coordinates
        const ix = Math.floor(x / this.cellSize);
        const iy = Math.floor(y / this.cellSize);
        return `${ix},${iy}`;
    }

    clear() {
        this.cells.clear();
    }

    insert(boid) {
        const key = this._hash(boid.pos.x, boid.pos.y);
        if (!this.cells.has(key)) this.cells.set(key, new Set());
        this.cells.get(key).add(boid);
    }

    getNeighbors(boid, radius = 1) {
        const neighbors = new Set();
        const ix = Math.floor(boid.pos.x / this.cellSize);
        const iy = Math.floor(boid.pos.y / this.cellSize);

        // iterate over neighboring cells (including current)
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const key = `${ix + dx},${iy + dy}`;
                const cell = this.cells.get(key);
                if (cell) {
                    for (const other of cell) {
                        if (other !== boid) neighbors.add(other);
                    }
                }
            }
        }

        return Array.from(neighbors); // return array for setCollection
    }
}
