import * as THREE from 'three';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

// MotionBlurPass: blends current frame with previous frame to create an AE-style motion blur effect
export class MotionBlurPass extends Pass {
    constructor(width, height, renderTargetParams, mixRatio = 0.9) {
        super();
        this.uniforms = {
            tOld:    { value: null },
            tNew:    { value: null },
            mixRatio:{ value: mixRatio }
        };
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: /* glsl */`
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: /* glsl */`
                uniform sampler2D tOld;
                uniform sampler2D tNew;
                uniform float mixRatio;
                varying vec2 vUv;
                void main() {
                    vec4 curr = texture2D(tNew, vUv);
                    vec4 prev = texture2D(tOld, vUv);
                    // Blend frames with compensation to prevent darkening
                    gl_FragColor = mix(curr, prev, mixRatio * 0.5);
                    // Boost brightness slightly to counteract accumulation darkness
                    gl_FragColor.rgb *= 1.05;
                }
            `
        });
        this.fsQuad = new FullScreenQuad(this.material);
        // persistent buffers for previous and new accumulation
        this.renderTargetOld = new THREE.WebGLRenderTarget(width, height, renderTargetParams);
        this.renderTargetNew = this.renderTargetOld.clone();
    }

    setSize(width, height) {
        this.renderTargetOld.setSize(width, height);
        this.renderTargetNew.setSize(width, height);
    }

    render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
        // set current and previous textures
        this.uniforms.tNew.value = readBuffer.texture;
        this.uniforms.tOld.value = this.renderTargetOld.texture;

        // render blend result into new target
        renderer.setRenderTarget(this.renderTargetNew);
        renderer.clear();
        this.fsQuad.render(renderer);

        // swap buffers
        const temp = this.renderTargetOld;
        this.renderTargetOld = this.renderTargetNew;
        this.renderTargetNew = temp;

        // output to screen or writeBuffer
        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
            this.uniforms.tOld.value = this.renderTargetOld.texture;
            this.fsQuad.render(renderer);
        } else {
            renderer.setRenderTarget(writeBuffer);
            this.uniforms.tOld.value = this.renderTargetOld.texture;
            this.fsQuad.render(renderer);
        }
    }
} 