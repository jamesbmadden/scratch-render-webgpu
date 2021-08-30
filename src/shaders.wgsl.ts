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

[[stage(vertex)]]
fn vs_main(
  [[location(0)]] pos: vec2<f32>,
  [[location(1)]] tex_coords: vec2<f32>
) -> VertexOutput {
  var out: VertexOutput;
  var posX = uniforms.data[0].y / 480.0;
  var posY = uniforms.data[1].z / 360.0;
  out.pos = vec4<f32>(pos.x + posX, pos.y + posY, 1.0, 1.0);
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