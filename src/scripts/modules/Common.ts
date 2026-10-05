/** @format */

import * as THREE from 'three';

class Common {
    readonly devicePixelRatio: number;
    readonly clock: THREE.Clock;
    readonly renderer: THREE.WebGLRenderer;

    width: number;
    height: number;
    aspect: number;
    time: number;
    timeScale: number;

    static RENDERER_PARAM = {
        clearColor: 0xffffff,
        alpha: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    };

    constructor() {
        // Limit DPR to prevent excessive GPU workload
        const isMobile =
            window.matchMedia('(pointer: coarse)').matches;

        this.devicePixelRatio = isMobile
            ? Math.min(window.devicePixelRatio || 1, 1)
            : Math.min(window.devicePixelRatio || 1, 1.25);

        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
        });

        this.clock = new THREE.Clock();

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;

        this.time = 0;
        this.timeScale = 2.0;

        // Apply the capped DPR
        this.renderer.setPixelRatio(this.devicePixelRatio);
    }

    /**
     * # Initialization
     */
    init() {
        const clearColor = new THREE.Color(
            Common.RENDERER_PARAM.clearColor
        );

        this.renderer.setClearColor(
            clearColor,
            Common.RENDERER_PARAM.alpha
        );

        this.renderer.setPixelRatio(this.devicePixelRatio);

        this.resize();
    }

    /**
     * # Resize handling
     */
    resize() {
        const home = document.querySelector('.home') as HTMLElement;

        if (!home) return;

        this.width = home.clientWidth;
        this.height = home.clientHeight;
        this.aspect = this.width / this.height;

        this.renderer.setSize(
            this.width,
            this.height,
            false
        );
    }

    /**
     * # rAF update
     */
    update() {
        this.time =
            this.clock.getElapsedTime() *
            this.timeScale;
    }
}

export default new Common();