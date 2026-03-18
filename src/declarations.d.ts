declare module '*.json' {
  const value: any;
  export default value;
}

declare module 'fast-json-patch/index.mjs' {
  export * from 'fast-json-patch';
}

