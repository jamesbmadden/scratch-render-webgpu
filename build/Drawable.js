export default class Drawable {
    constructor(id, renderer) {
        this.id = id;
        // setup the default properties
        this.properties = {
            position: [0, 0],
            direction: 0,
            scale: [1, 1],
            color: 0,
            whirl: 0,
            fisheye: 0,
            pixelate: 0,
            mosaic: 0,
            brightness: 0,
            ghost: 0
        };
    }
    /**
     * Creates the objects necessary for rendering this drawable
     */
    _buildPipeline(renderer) {
    }
}
