export const fullscreenVertices = new Float32Array([
    // position texture coords
    -1, 1, 0, 0,
    -1, -1, 0, 1,
    1, -1, 1, 1,
    -1, 1, 0, 0,
    1, -1, 1, 1,
    1, 1, 1, 0
]);
export default function genVertices(tex_width, tex_height) {
    // get the fraction of the resolution compared to the total possible
    let width = tex_width / 960;
    let height = tex_height / 720;
    // now use these to build the vertices position
    return new Float32Array([
        // position         texture coords
        -width, height, 0, 0,
        -width, -height, 0, 1,
        width, -height, 1, 1,
        -width, height, 0, 0,
        width, -height, 1, 1,
        width, height, 1, 0
    ]);
}
