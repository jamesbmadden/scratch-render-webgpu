export interface DrawableProperties {
  skinId: number,
  position: [number, number],
  direction: number,
  scale: [number, number],
  color: number,
  whirl: number,
  fisheye: number,
  pixelate: number,
  mosaic: number,
  brightness: number,
  ghost: number
}
export interface DrawablePropertiesPart {
  skinId?: number,
  position?: [number, number],
  direction?: number,
  scale?: [number, number],
  color?: number,
  whirl?: number,
  fisheye?: number,
  pixelate?: number,
  mosaic?: number,
  brightness?: number,
  ghost?: number
}