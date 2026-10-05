/** @format */

import * as THREE from 'three';
import Common from './Common';
import Pointer from './Pointer';
// import Gui, { type Options } from './Gui';
import base_vert from '../../shaders/vert/base.vert?raw';
import output_frag from '../../shaders/frag/output.frag?raw';

export default class Output {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly uniforms: THREE.ShaderMaterialParameters['uniforms'];
    // private readonly options: Options;
    // private readonly gui: Gui;
    private readonly trailLength: number;
    private pointerTrail: THREE.Vector2[];

    static CAMERA_PARAM = {
        fovy: 60,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 50,
        position: new THREE.Vector3(0.0, 0.0, 10.0),
        lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };

    /**
     * @constructor
     */
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            Output.CAMERA_PARAM.fovy,
            Output.CAMERA_PARAM.aspect,
            Output.CAMERA_PARAM.near,
            Output.CAMERA_PARAM.far
        );

        this.trailLength = 15;
        this.pointerTrail = Array.from({ length: this.trailLength }, () => new THREE.Vector2(0, 0));

        this.uniforms = {
            uTime: { value: Common.time },
            uResolution: {
                value: new THREE.Vector2(Common.width, Common.height),
            },
            uPointerTrail: { value: this.pointerTrail },
        };

        // this.options = {
        //     timeScale: Common.timeScale,
        // };
        // this.gui = new Gui(this.options);
    }

    /**
     * # Initialization
     */
    init() {
        // Camera
        this.camera.position.copy(Output.CAMERA_PARAM.position);
        this.camera.lookAt(Output.CAMERA_PARAM.lookAt);

        // Mesh
        const planeGeometry = new THREE.PlaneGeometry(2.0, 2.0);
        const planeMaterial = new THREE.RawShaderMaterial({
            vertexShader: base_vert,
            fragmentShader: output_frag,
            wireframe: false,
            uniforms: this.uniforms,
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.scene.add(plane);
    }

    /**
     * # Resize handling
     */
    resize() {
        this.camera.aspect = Common.aspect;
        this.camera.updateProjectionMatrix();
        if (this.uniforms) {
            this.uniforms.uResolution.value.set(Common.width, Common.height);
        }
    }

    /**
     * # Render the final output scene
     */
    private render() {
        if (this.uniforms) {
            this.uniforms.uTime.value = Common.time;
        }
        Common.renderer.render(this.scene, this.camera);
    }

    /**
     * # rAF update
     */
    update() {
        // this.gui.update();
        this.updatePointerTrail();
        this.render();
    }

    /**
     * # Update the pointer trail
     */
    updatePointerTrail() {
        for (let i = this.trailLength - 1; i > 0; i--) {
            this.pointerTrail[i].copy(this.pointerTrail[i - 1]);
        }
        this.pointerTrail[0].copy(Pointer.coords);
    }
}
