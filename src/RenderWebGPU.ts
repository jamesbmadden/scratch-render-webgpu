import { DrawablePropertiesPart } from './types.js';
import Drawable from './Drawable.js';
import BitmapSkin from './BitmapSkin.js';

export class RenderWebGPU {

  _adapter: GPUAdapter | null;
  _device: GPUDevice | undefined;
  _surface: GPUCanvasContext | null;
  _format: GPUTextureFormat;

  drawables: Drawable[] = [];
  skins: BitmapSkin[] = [];

  constructor () {
    this._adapter = null;
    this._device = undefined;
    this._surface = null;
    this._format = "bgra8unorm";
  }

  /**
   * Create new drawable
   */
  createDrawable (group: string): number {

    const drawableID = this.drawables.length;
    const newDrawable = new Drawable(drawableID, this);
    this.drawables[drawableID] = newDrawable;
    /** @TODO Drawlist shit */
    console.log(group);

    return drawableID;

  }

  /**
   * @TODO set layer order - currently doesn't do anything
   */
  setLayerGroupOrdering (order: string[]) {

  }

  /**
   * @TODO resize the canvas
   */
  resize (width: number, height: number) {

  }

  /**
   * Create a new bitmapSkin that can be attached to a drawable
   */
  async createBitmapSkin (img: HTMLImageElement): Promise<number> {

    const bitmapID = this.skins.length;
    const newBitmapSkin = await BitmapSkin.create(img, bitmapID, this);
    this.skins[bitmapID] = newBitmapSkin;

    return bitmapID;

  }

  /**
   * update the properties of a drawable
   */
  updateDrawableProperties (drawableID: number, properties: DrawablePropertiesPart) {
    Object.assign(this.drawables[drawableID].properties, properties);
    this.drawables[drawableID]._buildPipeline(this);
  }

  /**
   * Does an initial draw that includes clearing the canvas.
   */
  draw () {

    const view = this._surface?.getCurrentTexture().createView();

    if (view === undefined) throw "Failed to create a view";
    if (this._device === undefined) throw "Never initialized device";

    // start the render pass
    const commandEncoder = this._device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view,
        loadValue: { r: 1, g: 1, b: 1, a: 1 },
        storeOp: 'store'
      }]
    });

    this.drawables.forEach((sprite: Drawable) => {

      // make sure all the required properties are there
      if (sprite.pipeline && sprite.bindGroup && sprite.vertexBuffer) {

        // update the uniforms for the sprite
        sprite.writeToUniforms(this);

        // attach and render out the sprite
        renderPass.setPipeline(sprite.pipeline);
        renderPass.setBindGroup(0, sprite.bindGroup);
        renderPass.setVertexBuffer(0, sprite.vertexBuffer);
        renderPass.draw(6, 1);

      }

    });

    // and end it
    renderPass.endPass();
    this._device.queue.submit([commandEncoder.finish()]);

  }

}

export default async function newRender (canvas: HTMLCanvasElement): Promise<RenderWebGPU> {

  const instance = new RenderWebGPU();

  // load a webGPU instance
  instance._adapter = await navigator.gpu.requestAdapter();
  instance._device = await instance._adapter?.requestDevice();
  instance._surface = canvas.getContext('webgpu');

  // if things are unavailable, fail
  if (instance._adapter === null) throw "Failed to create an adapter";
  if (instance._device === undefined) throw "Failed to create a device";
  if (instance._surface === null) throw "Failed to create a surface";

  instance._format = instance._surface.getPreferredFormat(instance._adapter);

  // configure the surface
  instance._surface?.configure({
    device: instance._device,
    format: instance._format
  });

  return instance;

}