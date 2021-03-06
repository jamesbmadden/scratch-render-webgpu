import newRender from '../RenderWebGPU.js';
import { DrawablePropertiesPart } from '../types';

// check if WebGPU is supported
if (!navigator.gpu) {
    alert('WebGPU is not supported in your browser. This page will not work.');
}

const canvas: HTMLCanvasElement = document.querySelector('canvas#scratch-stage') || document.createElement('canvas');
let fudge = 90;
const renderer = await newRender(canvas);
renderer.setLayerGroupOrdering(['group1']);

const drawableID = renderer.createDrawable('group1');
renderer.updateDrawableProperties(drawableID, {
    position: [0, 0],
    scale: [100, 100],
    direction: 90
});

const WantedSkinType = {
    bitmap: 'bitmap',
    vector: 'vector',
    pen: 'pen'
};

const drawableID2 = renderer.createDrawable('group1');
const wantedSkin = WantedSkinType.vector;

// Bitmap (squirrel)
/*const image = new Image();
image.addEventListener('load', async () => {
    const bitmapSkinId = await renderer.createBitmapSkin(image);
    if (wantedSkin === WantedSkinType.bitmap) {
        renderer.updateDrawableProperties(drawableID2, {
            skinId: bitmapSkinId
        });
    }
});
image.crossOrigin = 'anonymous';
image.src = 'https://cdn.assets.scratch.mit.edu/internalapi/asset/7e24c99c1b853e52f8e7f9004416fa34.png/get/';*/

// SVG (cat 1-a)
const xhr = new XMLHttpRequest();
xhr.addEventListener('load', async () => {
    const skinId = await renderer.createSVGSkin(xhr.responseText);
    if (wantedSkin === WantedSkinType.vector) {
        renderer.updateDrawableProperties(drawableID2, {
            skinId: skinId
        });
    }
});
xhr.open('GET', 'https://cdn.assets.scratch.mit.edu/internalapi/asset/b7853f557e4426412e64bb3da6531a99.svg/get/');
xhr.send();

let posX = 0;
let posY = 0;
let scaleX = 100;
let scaleY = 100;
let fudgeProperty = 'posx';

const fudgeInput: HTMLInputElement = document.querySelector('input#fudge') || document.createElement('input');
const fudgePropertyInput: HTMLSelectElement = document.querySelector('select#fudgeproperty') || document.createElement('select');
const fudgeMinInput: HTMLInputElement = document.querySelector('input#fudgeMin') || document.createElement('input');
const fudgeMaxInput: HTMLInputElement = document.querySelector('input#fudgeMax') || document.createElement('input');

/* eslint require-jsdoc: 0 */
const updateFudgeProperty = (event: any) => {
    fudgeProperty = event.target.value;
};

const updateFudgeMin = (event: any) => {
    fudgeInput.min = event.target.valueAsNumber;
};

const updateFudgeMax = (event: any) => {
    fudgeInput.max = event.target.valueAsNumber;
};

fudgePropertyInput.addEventListener('change', updateFudgeProperty);
fudgePropertyInput.addEventListener('init', updateFudgeProperty);

fudgeMinInput.addEventListener('change', updateFudgeMin);
fudgeMinInput.addEventListener('init', updateFudgeMin);

fudgeMaxInput.addEventListener('change', updateFudgeMax);
fudgeMaxInput.addEventListener('init', updateFudgeMax);

// Ugly hack to properly set the values of the inputs on page load,
// since they persist across reloads, at least in Firefox.
// The best ugly hacks are the ones that reduce code duplication!
fudgePropertyInput.dispatchEvent(new CustomEvent('init'));
fudgeMinInput.dispatchEvent(new CustomEvent('init'));
fudgeMaxInput.dispatchEvent(new CustomEvent('init'));
fudgeInput.dispatchEvent(new CustomEvent('init'));

const handleFudgeChanged = function (event: any) {
    fudge = event.target.valueAsNumber;
    const props: DrawablePropertiesPart = {};
    switch (fudgeProperty) {
    case 'posx':
        props.position = [fudge, posY];
        posX = fudge;
        break;
    case 'posy':
        props.position = [posX, fudge];
        posY = fudge;
        break;
    case 'direction':
        props.direction = fudge;
        break;
    case 'scalex':
        props.scale = [fudge, scaleY];
        scaleX = fudge;
        break;
    case 'scaley':
        props.scale = [scaleX, fudge];
        scaleY = fudge;
        break;
    case 'scaleboth':
        props.scale = [fudge, fudge];
        scaleX = fudge;
        scaleY = fudge;
        break;
    case 'color':
        props.color = fudge;
        break;
    case 'whirl':
        props.whirl = fudge;
        break;
    case 'fisheye':
        props.fisheye = fudge;
        break;
    case 'pixelate':
        props.pixelate = fudge;
        break;
    case 'mosaic':
        props.mosaic = fudge;
        break;
    case 'brightness':
        props.brightness = fudge;
        break;
    case 'ghost':
        props.ghost = fudge;
        break;
    }
    renderer.updateDrawableProperties(drawableID2, props);
};

fudgeInput.addEventListener('input', handleFudgeChanged);
fudgeInput.addEventListener('change', handleFudgeChanged);
fudgeInput.addEventListener('init', handleFudgeChanged);

const updateStageScale = (event: any) => {
    renderer.resize(480 * event.target.valueAsNumber, 360 * event.target.valueAsNumber);
};

const stageScaleInput: HTMLInputElement = document.querySelector('input#stage-scale') || document.createElement('input');

stageScaleInput.addEventListener('input', updateStageScale);
stageScaleInput.addEventListener('change', updateStageScale);

const drawStep = function () {
    renderer.draw();
    // renderer.getBounds(drawableID2);
    // renderer.isTouchingColor(drawableID2, [255,255,255]);
    requestAnimationFrame(drawStep);
};
drawStep();

const debugCanvas = /** @type {canvas} */ document.getElementById('debug-canvas');
//renderer.setDebugCanvas(debugCanvas);