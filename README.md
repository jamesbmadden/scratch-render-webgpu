## Scratch-Render-WebGPU

Scratch Render WebGPU is an experimental alternative to the official Scratch-Render, built using the new WebGPU API. Scratch inspired my love for programming, and I've been loving messing around with WebGPU recently, so I decided to create a version of Scratch-Render using the new API. It is *NOT* feature-complete, nor is it designed to be. It's mostly just supposed to do most of what the playground needs, and serve as more of a proof-of-concept, tech demo, and learning experience for me.

![](https://raw.githubusercontent.com/jamesbmadden/scratch-render-webgpu/main/screenshot.png)
*Playground running with mosaic and scale effects enabled*

### Current Limitations
Many features from Scratch-Render are currently missing. Enough functions are implemented to run the playground decently, but it is very unlikely it would be able to work with the full Scratch-GUI in its current state. On top of that, there are several limitations to the type of things it can render, including:
- Only Bitmap sprites are supported
- Only position, scale, brightness, ghost, and mosaic properties are implemented

### Running and Building

This project will only work in browsers with WebGPU support. As of writing, that is limited to Firefox Nightly and the Canary versions of Chrome and Edge, with the correct flags enabled.

To run, simply enter ```npm start```, which will start typescript in watch mode, and serve the output with ```npx serve build``` and open ```localhost:5000/playground``` in your browser.