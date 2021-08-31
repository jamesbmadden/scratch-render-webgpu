import Drawable from './Drawable.js';
import BitmapSkin from './BitmapSkin.js';
export class RenderWebGPU {
    constructor() {
        this.drawables = [];
        this.skins = [];
        this._adapter = null;
        this._device = undefined;
        this._surface = null;
        this._format = "bgra8unorm";
    }
    /**
     * Create new drawable
     */
    createDrawable(group) {
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
    setLayerGroupOrdering(order) {
    }
    /**
     * @TODO resize the canvas
     */
    resize(width, height) {
        // no surface? no problem
        if (this._surface === null)
            return;
        // update the canvas size and reconfig the surface, then rerender
        this._surface.canvas.width = width;
        this._surface.canvas.height = height;
        // if device isn't there we can't reconfigure
        if (this._device === undefined)
            return;
        this._surface.configure({
            device: this._device,
            format: this._format,
            size: [width, height]
        });
    }
    /**
     * Create a new bitmapSkin that can be attached to a drawable
     */
    async createBitmapSkin(img) {
        const bitmapID = this.skins.length;
        const newBitmapSkin = await BitmapSkin.create(img, bitmapID, this);
        this.skins[bitmapID] = newBitmapSkin;
        return bitmapID;
    }
    async createSVGSkin(svg) {
        // create an image element to feed to BitmapSkin
        const img = document.createElement('img');
        img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
        img.width = 720;
        console.log(img.src);
        return await this.createBitmapSkin(img);
    }
    /**
     * update the properties of a drawable
     */
    updateDrawableProperties(drawableID, properties) {
        Object.assign(this.drawables[drawableID].properties, properties);
        this.drawables[drawableID]._buildPipeline(this);
    }
    /**
     * Does an initial draw that includes clearing the canvas.
     */
    draw() {
        var _a;
        const view = (_a = this._surface) === null || _a === void 0 ? void 0 : _a.getCurrentTexture().createView();
        if (view === undefined)
            throw "Failed to create a view";
        if (this._device === undefined)
            throw "Never initialized device";
        // start the render pass
        const commandEncoder = this._device.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                    view,
                    loadValue: { r: 1, g: 1, b: 1, a: 1 },
                    storeOp: 'store'
                }]
        });
        this.drawables.forEach((sprite) => {
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
export default async function newRender(canvas) {
    var _a, _b;
    const instance = new RenderWebGPU();
    // load a webGPU instance
    instance._adapter = await navigator.gpu.requestAdapter();
    instance._device = await ((_a = instance._adapter) === null || _a === void 0 ? void 0 : _a.requestDevice());
    instance._surface = canvas.getContext('webgpu');
    // if things are unavailable, fail
    if (instance._adapter === null)
        throw "Failed to create an adapter";
    if (instance._device === undefined)
        throw "Failed to create a device";
    if (instance._surface === null)
        throw "Failed to create a surface";
    instance._format = instance._surface.getPreferredFormat(instance._adapter);
    // configure the surface
    (_b = instance._surface) === null || _b === void 0 ? void 0 : _b.configure({
        device: instance._device,
        format: instance._format
    });
    return instance;
}