// Art controls. Shared by the browser material and the Shadertoy preview.
#define DEBUG_MODE 0
const float FIBER_SCALE = 7.5;
const float FLOW_SPEED = 0.12;
const float RIM_POWER = 2.4;
vec3 corticalLight(vec3 p, vec3 n, vec3 viewDir, float time, float pulse, float tone, vec3 low, vec3 high) {
 float rim = pow(1.0 - clamp(abs(dot(n, viewDir)), 0.0, 1.0), RIM_POWER);
 vec3 q = p * FIBER_SCALE;
 float warp = fbm(p * 2.1 + vec3(0.0, time * FLOW_SPEED, 0.0), 3, 2.0, 0.5);
 float ridges = abs(valueNoise(q + vec3(warp * (1.4 + tone))) - 0.5);
 float veins = 1.0 - smoothstep(0.008, 0.035, ridges);
 float light = 0.18 + 0.82 * max(dot(n, normalize(vec3(-1.0, 1.5, 2.0))), 0.0);
 float wave = pow(0.5 + 0.5 * sin(p.y * 9.0 + warp * 4.0 - time * (0.5 + tone)), 6.0);
 vec3 tissue = mix(low * 0.18, vec3(0.055, 0.004, 0.018), light * 0.7);
 vec3 color = tissue + high * (rim * 0.4 + veins * (0.025 + 0.08 * tone) * (0.45 + wave) + pulse * 0.28 * rim);
 #if DEBUG_MODE == 2
 return n * 0.5 + 0.5;
 #elif DEBUG_MODE == 5
 return vec3(veins);
 #else
 return linearToSrgb(tonemapAgX(color * (1.0 + pulse * 0.22)));
 #endif
}
vec3 neuralAtmosphere(vec2 uv, float time, float pulse, float tone, vec3 low, vec3 high) {
 float field = fbm(vec3(uv * 2.0, time * 0.025), 3, 2.0, 0.5);
 float threads = 1.0 - smoothstep(0.012, 0.06, abs(sin(uv.x * 3.0 + uv.y * 2.0 + field * 5.0)));
 float vignette = exp(-dot(uv, uv) * 0.6);
 return mix(vec3(0.018, 0.008, 0.029), low * 0.6, field * vignette) + high * threads * vignette * (0.035 + tone * 0.025 + pulse * 0.015);
}
