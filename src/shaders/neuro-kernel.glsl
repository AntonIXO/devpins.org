// Shared Neuro Noise field, extracted unchanged from neuro-noise.frag.
// Adapted from Paper Shaders / 21st.dev Shader Builder, Apache-2.0.
// https://github.com/paper-design/shaders
// Periodic trigonometric domain deformation, not a sine-based random hash.
float neuroField(vec2 p, float t, float intensity, float paramA, float seed) {
  vec2 q = p * (1.6 + intensity * 2.4);
  float field = 0.0;
  float weight = 0.55;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    q += vec2(
      sin(q.y * (1.7 + fi * 0.09) + t * (0.35 + fi * 0.04) + seed),
      cos(q.x * (1.5 + fi * 0.11) - t * (0.28 + fi * 0.03))
    ) * (0.22 + intensity * 0.14);
    float filaments = abs(sin(q.x + q.y + fi * 0.72));
    field += weight / (0.08 + filaments);
    weight *= 0.62;
    q = q.yx * vec2(-1.08, 1.04);
  }
  float glow = 1.0 - exp(-field * (0.018 + paramA * 0.04));
  return clamp(glow, 0.0, 1.0);
}
