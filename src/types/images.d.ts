// TypeScript module declarations for image file imports
// These declarations allow importing image files as modules with Next.js static asset handling

declare module '*.webp' {
  const src: string;
  export default { src };
}

declare module '*.png' {
  const src: string;
  export default { src };
}

declare module '*.jpg' {
  const src: string;
  export default { src };
}

declare module '*.jpeg' {
  const src: string;
  export default { src };
}

declare module '*.gif' {
  const src: string;
  export default { src };
}

declare module '*.svg' {
  const src: string;
  export default { src };
}
