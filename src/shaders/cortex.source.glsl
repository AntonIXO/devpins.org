// Palette and flow shared by the Three.js material and standalone preview.
vec3 corticalLight(vec3 p, vec3 n, vec3 viewDir, float time, float selection) {
 float rim = pow(1.0 - clamp(abs(dot(n, viewDir)), 0.0, 1.0), 2.2);
 float organic = fbm(p * 3.0, 3, 2.0, 0.5);
 float signal = pow(0.5 + 0.5 * sin(p.y * 8.0 + p.z * 5.0 - time * 1.4 + organic * 2.0), 12.0);
 float light = 0.22 + 0.78 * max(dot(n, normalize(vec3(-1.0, 1.5, 2.0))), 0.0);
 vec3 tissue = vec3(0.055, 0.16, 0.17) * light;
 return tissue + rim * vec3(0.24, 0.55, 0.52) + signal * vec3(0.12, 0.26, 0.22) + selection * vec3(0.55, 0.24, 0.045);
}
