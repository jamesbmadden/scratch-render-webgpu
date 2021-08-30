const shaderSource = `struct VertexOutput {
  [[builtin(position)]] pos: vec4<f32>;
  [[location(0)]] tex_coords: vec2<f32>;
};

[[block]]
struct Uniforms {
  skinID: f32;
  position: vec2<f32>;
  direction: f32;
  scale: vec2<f32>;
  color: f32;
  whirl: f32;
  fisheye: f32;
  pixelate: f32;
  mosaic: f32;
  brightness: f32;
  ghost: f32;
  offset: vec3<f32>;
};
[[binding(0), group(0)]] var<uniform> uniforms: Uniforms;

[[stage(vertex)]]
fn vs_main(
  [[location(0)]] pos: vec2<f32>,
  [[location(1)]] tex_coords: vec2<f32>
) -> VertexOutput {
  var out: VertexOutput;
  out.pos = vec4<f32>(pos, 1.0, 1.0);
  out.tex_coords = tex_coords;
  return out;
}

[[group(0), binding(1)]] var tex_sampler: sampler;
[[group(0), binding(2)]] var texture: texture_2d<f32>;

[[stage(fragment)]]
fn fs_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
  return textureSample(texture, tex_sampler, in.tex_coords);
}`;

export default shaderSource;