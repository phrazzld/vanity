// placeholderUtils.ts

// simple hashing function to get a numeric seed from string
function hashStringToInt(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash & 0xfffffff
}

export function getSeededPlaceholderStyles(key: string) {
  // generate a seed from the slug
  const seed = hashStringToInt(key)

  // pick a color from a palette
  const colorPalette = [
    '#FFD3A5', '#FD6585', '#C2FFD8', '#465EFB', '#5EFCE8',
    '#736EFE', '#F6D365', '#FDA085', '#FDEB71', '#F8D800',
  ]
  const baseColor = colorPalette[seed % colorPalette.length]

  // optionally pick a second color for a gradient or pattern
  const secondColor = colorPalette[(seed + 1) % colorPalette.length]

  // create a subtle pattern overlay
  // for instance, diagonal stripes with a pseudo-element
  return {
    background: `linear-gradient(135deg, ${baseColor}, ${secondColor})`,
  }
}