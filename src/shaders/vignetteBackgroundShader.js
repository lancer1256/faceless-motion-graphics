export const vignetteVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

export const vignetteFragmentShader = `
    varying vec2 vUv;

    uniform vec3 uColor;       // Base color (typically white)
    uniform float uRadius;     // Radius at which vignette starts (0.0 – 0.5)
    uniform float uDarkening;  // Darkening amount at edges (0.0 – 1.0)
    uniform float uFeather;    // Feathering amount for softer transition (0.0 – 1.0)

    void main() {
        // Shift UV so (0,0) is center
        vec2 pos = vUv - 0.5;
        
        // Adjust aspect ratio if needed
        //pos.x *= 1.0; // Use if needed for non-square aspect ratios
        
        float dist = length(pos);
        
        // Create smoother falloff with better feathering
        // Adjust the edge width with uFeather to control softness
        float innerEdge = uRadius;
        float outerEdge = 0.5;
        float featheredWidth = mix(0.01, outerEdge - innerEdge, uFeather);
        
        // Improved smoothstep for better feathering
        float vignette = smoothstep(innerEdge, innerEdge + featheredWidth, dist);
        
        // Calculate final color with adjusted darkening
        vec3 edgeColor = uColor * (1.0 - uDarkening);
        vec3 finalColor = mix(uColor, edgeColor, vignette);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`; 