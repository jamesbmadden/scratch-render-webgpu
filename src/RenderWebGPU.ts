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
    /** @TODO Drawlist stuff */
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

    // no surface? no problem
    if (this._surface === null) return;

    // update the canvas size and reconfig the surface, then rerender
    this._surface.canvas.width = width;
    this._surface.canvas.height = height;

    // if device isn't there we can't reconfigure
    if (this._device === undefined) return;

    this._surface.configure({
      device: this._device,
      format: this._format
    });

  }

  /**
   * Create a new bitmapSkin that can be attached to a drawable
   */
  async createBitmapSkin (img: HTMLImageElement | HTMLCanvasElement): Promise<number> {

    const bitmapID = this.skins.length;
    const newBitmapSkin = await BitmapSkin.create(img, bitmapID, this);
    this.skins[bitmapID] = newBitmapSkin;

    return bitmapID;

  }

  async createSVGSkin (svg: string): Promise<number> {

    // create an image element to feed to BitmapSkin
    const img = document.createElement('img');
    img.src = `data:image/svg+xml;base64,${btoa(svg)}`;

    return await this.createBitmapSkin(img);

  }

  /**
   * Get the size of a skin
   */
  getSkinSize (skinID: number): Array<number> {
  
    if (!this.skins[skinID]) {
      // skin doesn't yet exist, return 0
      return [ 0, 0 ];
    } else {
      // skin exists, return the size
      return [ this.skins[skinID].width, this.skins[skinID].height ];
    }

  }

  /**
   * update the properties of a drawable
   */
  updateDrawableProperties (drawableID: number, properties: DrawablePropertiesPart) {
    Object.assign(this.drawables[drawableID].properties, properties);
    this.drawables[drawableID]._buildPipeline(this);
  }

  /**
   * wrappers over updateDrawableProperties
   */
  updateDrawablePosition (drawableID: number, position: [number, number]) {
    // simply a wrapper over updateDrawableProperties
    this.updateDrawableProperties(drawableID, { position });
  }
  updateDrawableDirection (drawableID: number, direction: number) {
    // simply a wrapper over updateDrawableProperties
    this.updateDrawableProperties(drawableID, { direction });
  }
  updateDrawableScale (drawableID: number, scale: [number, number]) {
    // simply a wrapper over updateDrawableProperties
    this.updateDrawableProperties(drawableID, { scale });
  }
  updateDrawableDirectionScale (drawableID: number, direction: number, scale: [number, number]) {
    // simply a wrapper over updateDrawableProperties
    this.updateDrawableProperties(drawableID, { direction, scale });
  }
  updateDrawableVisible (drawableID: number, visible: boolean) {
    // just use ghost as a quick and dirty implementation
    if (visible) {
      this.updateDrawableProperties(drawableID, { ghost: 0 });
    } else {
      this.updateDrawableProperties(drawableID, { ghost: 100 });
    }
  }
  updateDrawableEffect (drawableID: number, effectName: string, value: number) {
    // simply a wrapper over updateDrawableProperties
    const newProperties: any = {};
    newProperties[effectName] = value;
    this.updateDrawableProperties(drawableID, newProperties);
  }
  updateDrawableSkinId (drawableID: number, skinId: number) {
    // simply a wrapper over updateDrawableProperties
    this.updateDrawableProperties(drawableID, { skinId });
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
        clearValue: { r: 1, g: 1, b: 1, a: 1 },
        loadOp: 'clear',
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
    renderPass.end();
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

  instance._format = navigator.gpu.getPreferredCanvasFormat();

  // configure the surface
  instance._surface?.configure({
    device: instance._device,
    format: instance._format
  });

  return instance;

}
