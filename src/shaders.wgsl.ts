const shaderSource = `struct VertexOutput {
  [[builtin(position)]] pos: vec4<f32>;
  [[location(0)]] tex_coords: vec2<f32>;
};

/*
WHERE DATA CAN BE FOUND IN THE UNIFORM:
[0]
  x: skinID
  y: position[x]
  z: position[y]
  w: direction
[1]
  x: scaleX
  y: scaleY
  z: color
  w: whirl
[2]
  x: fisheye
  y: pixelate
  z: mosaic
  w: brightness
[3]
  x: ghost
  y: unused
  z: unused
  w: unused
*/
[[block]]
struct Uniforms {
  data: mat4x4<f32>;
};
[[binding(0), group(0)]] var<uniform> uniforms: Uniforms;

// functions to apply different transformation types
fn apply_scale(pos: vec2<f32>, scaleX: f32, scaleY: f32) -> vec2<f32> {
  return vec2<f32>(pos.x * scaleX, pos.y * scaleY);
}

fn apply_translate(pos: vec2<f32>, translateX: f32, translateY: f32) -> vec2<f32> {
  return vec2<f32>(pos.x + translateX, pos.y + translateY);
}

[[stage(vertex)]]
fn vs_main(
  [[location(0)]] pos: vec2<f32>,
  [[location(1)]] tex_coords: vec2<f32>
) -> VertexOutput {
  var out: VertexOutput;
  //                                              SCALE                                                         TRANSLATE
  out.pos = vec4<f32>(apply_translate(apply_scale(pos, uniforms.data[1].x / 100.0, uniforms.data[1].y / 100.0), uniforms.data[0].y / 240.0, uniforms.data[0].z / 180.0), 1.0, 1.0);
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