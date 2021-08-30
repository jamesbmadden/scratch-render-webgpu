import { RenderWebGPU } from "./RenderWebGPU.js";

export default class BitmapSkin {

  texture: GPUTexture | undefined;
  id: number | undefined;

  /**
   * static method to create a new instance of a bitmap skin
   */
  static async create (img: HTMLImageElement, id: number, renderer: RenderWebGPU): Promise<BitmapSkin> {

    // create a new BitmapSkin
    const instance = new BitmapSkin();
    instance.id = id;
    {
      // read the image input as a bitmap
      const imgBitmap = await createImageBitmap(img);

      // create a new texture
      instance.texture = renderer._device?.createTexture({
        size: [ imgBitmap.width, imgBitmap.height, 1 ],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
      });

      // if we failed to create a texture, throw
      if (instance.texture === undefined) throw "Failed to create texture";
      // copy the image into the texture
      renderer._device?.queue.copyExternalImageToTexture({ source: imgBitmap }, { texture: instance.texture }, [ imgBitmap.width, imgBitmap.height ]);

    }

    return instance;

  }

}