export default class BitmapSkin {
    constructor() {
        this.width = 0;
        this.height = 0;
    }
    /**
     * static method to create a new instance of a bitmap skin
     */
    static async create(img, id, renderer) {
        var _a, _b;
        // create a new BitmapSkin
        const instance = new BitmapSkin();
        instance.id = id;
        {
            await img.decode();
            // read the image input as a bitmap
            const imgBitmap = await createImageBitmap(img);
            // create a new texture
            instance.texture = (_a = renderer._device) === null || _a === void 0 ? void 0 : _a.createTexture({
                size: [imgBitmap.width, imgBitmap.height, 1],
                format: 'rgba8unorm',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            });
            instance.width = imgBitmap.width;
            instance.height = imgBitmap.height;
            // if we failed to create a texture, throw
            if (instance.texture === undefined)
                throw "Failed to create texture";
            // copy the image into the texture
            (_b = renderer._device) === null || _b === void 0 ? void 0 : _b.queue.copyExternalImageToTexture({ source: imgBitmap }, { texture: instance.texture }, [imgBitmap.width, imgBitmap.height]);
        }
        return instance;
    }
}
