import * as THREE from 'three';

export const GaussianBlurShader = {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2() },
        blurRadius: { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0); // Directly output clip space
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float blurRadius;
        
        float gaussianPdf(float x, float sigma) {
            return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
        }
        
        void main() {
            vec2 invSize = 1.0 / resolution;
            float sigma = blurRadius;
            float weightSum = gaussianPdf(0.0, sigma);
            vec3 diffuseSum = texture2D(tDiffuse, vUv).rgb * weightSum;
            
            for (int i = 1; i < 10; i++) {
                float x = float(i);
                float weight = gaussianPdf(x, sigma);
                vec2 uvOffset = vec2(x) * invSize;
                
                diffuseSum += texture2D(tDiffuse, vUv + uvOffset).rgb * weight;
                diffuseSum += texture2D(tDiffuse, vUv - uvOffset).rgb * weight;
                weightSum += 2.0 * weight;
            }
            
            gl_FragColor = vec4(diffuseSum / weightSum, 1.0);
        }
    `
}; 