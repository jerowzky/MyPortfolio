/** @format */

import * as THREE from 'three';

class Pointer {
    pointerMoved: boolean;
    coords: THREE.Vector2;
    private prevCoords: THREE.Vector2;
    diff: THREE.Vector2;
    private timer: number | null;

    /**
     * @constructor
     */
    constructor() {
        this.pointerMoved = false;
        this.coords = new THREE.Vector2();
        this.prevCoords = new THREE.Vector2();
        this.diff = new THREE.Vector2();
        this.timer = null;

        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
    }

    /**
     * # Register event listeners
     */
    init() {
        document.body.addEventListener('pointermove', this.onPointerMove, false);
        document.body.addEventListener('pointerdown', this.onPointerDown, false);
    }

    /**
     * # Set coordinates relative to the .home section
     * @param {number} x
     * @param {number} y
     */
    setCoords(x: number, y: number) {
        if (this.timer) clearTimeout(this.timer);

        const home = document.querySelector('.home') as HTMLElement;

        if (!home) return;

        const rect = home.getBoundingClientRect();

        // Convert viewport coordinates to coordinates
        // relative to the .home section
        const localX = x - rect.left;
        const localY = y - rect.top;

        // Convert to normalized coordinates (-1 to 1)
        const coordsX = (localX / rect.width) * 2 - 1;
        const coordsY = -(localY / rect.height) * 2 + 1;

        this.coords.set(coordsX, coordsY);

        this.pointerMoved = true;

        this.timer = setTimeout(() => {
            this.pointerMoved = false;
        }, 100);
    }

    /**
     * # Pointer interaction handling
     * @param {PointerEvent} e
     */
    onPointerMove(e: PointerEvent) {
        if (e.pointerType === 'touch' && e.isPrimary) {
            this.setCoords(e.clientX, e.clientY);
        } else {
            this.setCoords(e.clientX, e.clientY);
        }
    }

    /**
     * # Touch input handling
     * @param {PointerEvent} e
     */
    onPointerDown(e: PointerEvent) {
        if (e.pointerType !== 'touch' || !e.isPrimary) return;

        this.setCoords(e.clientX, e.clientY);
    }

    /**
     * # Update the difference in pointer coordinates
     */
    update() {
        this.diff.subVectors(this.coords, this.prevCoords);
        this.prevCoords.copy(this.coords);
    }
}

export default new Pointer();