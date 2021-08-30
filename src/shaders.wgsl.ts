const shaderSource = `struct VertexOutput {
  [[builtin(position)]] pos: vec4<f32>;
  [[location(0)]] tex_coords: vec2<f32>;
  [[location(1)]] brightness: f32;
  [[location(2)]] ghost: f32;
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
  out.brightness = uniforms.data[2].w;
  out.ghost = uniforms.data[3].x;
  return out;
}

[[group(0), binding(1)]] var tex_sampler: sampler;
[[group(0), binding(2)]] var texture: texture_2d<f32>;

// functions to apply different COLOUR transformation types
fn apply_brightness(colour: vec4<f32>, brightness: f32) -> vec4<f32> {
  return vec4<f32>(clamp(colour.x + brightness, 0.0, 1.0), clamp(colour.y + brightness, 0.0, 1.0), clamp(colour.z + brightness, 0.0, 1.0), colour.w);
}
fn apply_ghost(colour: vec4<f32>, ghost: f32) -> vec4<f32> {
  var alpha: f32 = 1.0 - clamp(ghost / 100.0, 0.0, colour.w);
  return vec4<f32>(colour.xyz, alpha);
}

[[stage(fragment)]]
fn fs_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
  return apply_ghost(apply_brightness(textureSample(texture, tex_sampler, in.tex_coords), (in.brightness / 100.0)), in.ghost);
}`;

export default shaderSource;