export const CircularWipeShader = {
    uniforms : {
      tPrev   : { value: null }, // Will be rtPrev.texture
      tNext   : { value: null }, // Will be rtNext.texture
      progress: { value: 0.0 },  // 0→1 radius
      aspect  : { value: 1.0 }   // Will be container.clientWidth / container.clientHeight
    },
    vertexShader : `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position,1.0); // Use direct clip space for full-screen quad
      }
    `,
    fragmentShader : `
      varying vec2 vUv;
      uniform sampler2D tPrev;
      uniform sampler2D tNext;
      uniform float progress;   // 0–1 radius
      uniform float aspect;

      void main(){
        vec2 c = vec2(0.5); // Center of the screen
        vec2 d = (vUv-c)*vec2(aspect,1.0); // Adjust for aspect ratio to keep circle round
        float r = length(d); // Distance from center
        // p = 0 when r is small (inside circle), p = 1 when r is large (outside circle)
        // smoothstep creates a soft edge for the wipe
        float p = smoothstep(progress - 0.005, progress + 0.005, r);
        // mix(next, prev, p) means: if p=0 (inside), show next. if p=1 (outside), show prev.
        gl_FragColor = mix(texture2D(tNext, vUv), texture2D(tPrev, vUv), p);
      }`
}; 