// Art controls. Shared by the browser material and the Shadertoy preview.
#define DEBUG_MODE 0
const float FIBER_SCALE = 7.5;
const float FLOW_SPEED = 0.12;
const float RIM_POWER = 2.4;
vec3 corticalLight(vec3 p, vec3 n, vec3 viewDir, float time, float pulse, float tone, vec3 low, vec3 high, vec3 regionColor, float selection) {
 float rim = pow(1.0 - clamp(abs(dot(n, viewDir)), 0.0, 1.0), RIM_POWER);
 float light = 0.24 + 0.76 * max(dot(n, normalize(vec3(-0.7, 1.5, 2.0))), 0.0);
 float texture = fbm(p * FIBER_SCALE, 3, 2.0, 0.5);
 float wave = pow(0.5 + 0.5 * sin(p.y * 8.0 + texture * 2.0 - time * (0.5 + tone)), 8.0);
 vec3 base = mix(vec3(0.28, 0.27, 0.26), regionColor, 0.65 + selection * 0.35);
 vec3 color = base * light * (0.92 + texture * 0.08);
 color += high * (rim * 0.045 + pulse * 0.035 + wave * 0.012 * tone);
 color += regionColor * selection * 0.12;
 #if DEBUG_MODE == 2
 return n * 0.5 + 0.5;
 #else
 return linearToSrgb(color);
 #endif
}
vec3 neuralAtmosphere(vec2 uv, float time, float pulse, float tone, vec3 low, vec3 high) {
 float field = fbm(vec3(uv * 2.0, time * 0.025), 3, 2.0, 0.5);
 float threads = 1.0 - smoothstep(0.012, 0.06, abs(sin(uv.x * 3.0 + uv.y * 2.0 + field * 5.0)));
 float vignette = exp(-dot(uv, uv) * 0.6);
 return mix(vec3(0.027, 0.027, 0.031), low * 0.22, field * vignette * 0.4) + high * threads * vignette * (0.004 + tone * 0.003 + pulse * 0.002);
}
