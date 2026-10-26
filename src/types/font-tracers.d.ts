// Ambient types for the two untyped dev only modules scripts/render-lockup.mts
// traces the lockup with (spec 0010 AC-6). Loose on purpose, they are used by
// that one script.

declare module "wawoff2" {
  export function decompress(buffer: Uint8Array): Promise<ArrayBuffer>
  export function compress(buffer: Uint8Array): Promise<ArrayBuffer>
}

declare module "fontkit" {
  type Path = { toSVG(): string; commands: ReadonlyArray<{ type: string }> }
  type Glyph = {
    name: string
    id: number
    advanceWidth: number
    path: Path
  }
  type Position = {
    id: number
    name?: string
    advanceWidth: number
    x?: number
    y?: number
  }
  type Font = {
    unitsPerEm: number
    capHeight?: number
    ascender: number
    postscriptName: string
    variationAxes?: Record<
      string,
      { min: number; defaultValue: number; max: number }
    >
    getVariation(settings: Record<string, number>): Font
    layout(text: string): { glyphs: Position[] }
    getGlyph(id: number, name?: string): Glyph
    glyphForCodePoint(cp: number): Glyph
  }
  export function create(buffer: Buffer | Uint8Array): Font
}
