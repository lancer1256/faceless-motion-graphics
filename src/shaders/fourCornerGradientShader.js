export const fourCornerGradientVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0); // Directly output clip space
    }
`;

export const fourCornerGradientFragmentShader = `
    varying vec2 vUv;
    uniform vec3 uColorTopLeft;
    uniform vec3 uColorTopRight;
    uniform vec3 uColorBottomLeft;
    uniform vec3 uColorBottomRight;
    uniform float uTime;

    // Simple LFO (Low Frequency Oscillator) for color animation
    float lfo(float speed, float offset, float amplitude, float base) {
        return (sin(uTime * speed + offset) * amplitude + base);
    }

    void main() {
        // Darker red tones, subtly animated
        vec3 c1 = uColorTopLeft   * vec3(lfo(0.2, 0.0, 0.1, 0.9), lfo(0.3, 0.5, 0.05, 0.95), lfo(0.4, 1.0, 0.1, 0.9));
        vec3 c2 = uColorTopRight  * vec3(lfo(0.3, 1.5, 0.05, 0.95), lfo(0.2, 2.0, 0.1, 0.9), lfo(0.5, 2.5, 0.05, 0.95));
        vec3 c3 = uColorBottomLeft* vec3(lfo(0.4, 3.0, 0.1, 0.9), lfo(0.5, 3.5, 0.05, 0.95), lfo(0.2, 4.0, 0.1, 0.9));
        vec3 c4 = uColorBottomRight* vec3(lfo(0.5, 4.5, 0.05, 0.95), lfo(0.4, 5.0, 0.1, 0.9), lfo(0.3, 5.5, 0.05, 0.95));

        vec3 topColor = mix(c1, c2, vUv.x);
        vec3 bottomColor = mix(c3, c4, vUv.x);
        vec3 finalColor = mix(bottomColor, topColor, vUv.y);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`; 