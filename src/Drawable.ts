import BitmapSkin from "./BitmapSkin.js";
import { DrawableProperties } from "./types.js";
import { RenderWebGPU } from "./RenderWebGPU.js";
import shaderSource from "./shaders.wgsl.js";
import vertices from "./vertices.js";

export default class Drawable {

  // data for a rendering
  pipeline: GPURenderPipeline | undefined;
  bindGroup: GPUBindGroup | undefined;
  vertexBuffer: GPUBuffer | undefined;
  uniformBuffer: GPUBuffer | undefined;
  texture: GPUTexture | undefined;
  properties: DrawableProperties;
  id: number;

  constructor (id: number, renderer: RenderWebGPU) {

    this.id = id;
    // setup the default properties
    this.properties = {
      skinId: -1,
      position: [0, 0],
      direction: 0,
      scale: [100, 100],
      color: 0,
      whirl: 0,
      fisheye: 0,
      pixelate: 0,
      mosaic: 0,
      brightness: 0,
      ghost: 0
    };

    this._buildPipeline(renderer);

  }

  /**
   * Creates the objects necessary for rendering this drawable
   */
  _buildPipeline (renderer: RenderWebGPU) {

    // make sure renderer has a device
    if (renderer._device === undefined) throw "Renderer is missing the device.";

    // create shader module
    const shaderModule = renderer._device.createShaderModule({ code: shaderSource });

    // create the vertex buffer
    this.vertexBuffer = renderer._device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true
    });

    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
    this.vertexBuffer.unmap();

    // find the texture - if one's set, use it, otherwise make a blank one
    if (this.properties.skinId !== -1) {
      this.texture = renderer.skins[this.properties.skinId]?.texture;
    } else {
      this.texture = renderer._device.createTexture({
        size: [ 1, 1, 1 ],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
      });
    }
    if (this.texture === undefined) throw "Failed to get texture";
    // Create a sampler with linear filtering for smooth interpolation.
    const sampler = renderer._device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    // make the uniform buffer
    this.uniformBuffer = renderer._device.createBuffer({
      size: 4 * 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const bindGroupLayout = renderer._device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: 'uniform',
            hasDynamicOffset: false
          }
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {}
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {}
        }
      ]
    });

    // make render pipeline
    this.pipeline = renderer._device.createRenderPipeline({
      layout: renderer._device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
      }),
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: [{
          arrayStride: 4 * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2'
            },
            {
              shaderLocation: 1,
              offset: 4 * 2,
              format: 'float32x2'
            }
          ]
        }]
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{
          format: renderer._format
        }]
      }
    });

    // create the bind group
    this.bindGroup = renderer._device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.uniformBuffer
          }
        },
        {
          binding: 1,
          resource: sampler
        },
        {
          binding: 2,
          resource: this.texture.createView()
        }
      ]
    });

  }
  
  /**
   * convert uniforms to a float32array
   */
  _getUniforms (): Float32Array {

    return new Float32Array([
      this.properties.skinId,
      ...this.properties.position,
      this.properties.direction,
      ...this.properties.scale,
      this.properties.color,
      this.properties.whirl,
      this.properties.fisheye,
      this.properties.pixelate,
      this.properties.mosaic,
      this.properties.brightness,
      this.properties.ghost,
      // fill with three empty slots
      0, 0, 0
    ]);

  }

  /**
   * Write to the buffer with the uniforms
   */
  writeToUniforms(renderer: RenderWebGPU) {

    // make sure renderer has a device
    if (renderer._device === undefined) throw "Renderer is missing the device.";
    if (this.uniformBuffer === undefined) throw "Uniform buffer is missing";

    // convert properties object to uniforms
    const uniforms = this._getUniforms();
    renderer._device.queue.writeBuffer(
      this.uniformBuffer,
      0,
      uniforms.buffer,
      uniforms.byteOffset,
      uniforms.byteLength
    );
  }

}