/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    SITE_URL: string
    RSS_URL: string
    RSS_PREFIX: string
  }
}

declare module 'sanitize-html' {
  export interface SanitizeHtmlFrame {
    tag: string
    attribs: Record<string, string>
  }

  export interface SanitizeHtmlOptions {
    allowedTags?: string[]
    allowedAttributes?: Record<string, string[]>
    exclusiveFilter?: (frame: SanitizeHtmlFrame) => boolean
  }

  interface SanitizeHtml {
    (dirty: string, options?: SanitizeHtmlOptions): string
    defaults: {
      allowedTags: string[]
      allowedAttributes: Record<string, string[]>
    }
  }

  const sanitizeHtml: SanitizeHtml

  export default sanitizeHtml
}

// prismjs-components-importer ships CJS files without type declarations.
// Each import is a side-effect that registers the language grammar on the
// global Prism instance, so the module value is irrelevant.
declare module 'prismjs-components-importer/cjs/prism-c' {}
declare module 'prismjs-components-importer/cjs/prism-clojure' {}
declare module 'prismjs-components-importer/cjs/prism-cpp' {}
declare module 'prismjs-components-importer/cjs/prism-csharp' {}
declare module 'prismjs-components-importer/cjs/prism-css' {}
declare module 'prismjs-components-importer/cjs/prism-dart' {}
declare module 'prismjs-components-importer/cjs/prism-docker' {}
declare module 'prismjs-components-importer/cjs/prism-elixir' {}
declare module 'prismjs-components-importer/cjs/prism-go' {}
declare module 'prismjs-components-importer/cjs/prism-markup' {}
declare module 'prismjs-components-importer/cjs/prism-java' {}
declare module 'prismjs-components-importer/cjs/prism-javascript' {}
declare module 'prismjs-components-importer/cjs/prism-json' {}
declare module 'prismjs-components-importer/cjs/prism-julia' {}
declare module 'prismjs-components-importer/cjs/prism-kotlin' {}
declare module 'prismjs-components-importer/cjs/prism-lua' {}
declare module 'prismjs-components-importer/cjs/prism-markdown' {}
declare module 'prismjs-components-importer/cjs/prism-pascal' {}
declare module 'prismjs-components-importer/cjs/prism-php' {}
declare module 'prismjs-components-importer/cjs/prism-python' {}
declare module 'prismjs-components-importer/cjs/prism-ruby' {}
declare module 'prismjs-components-importer/cjs/prism-rust' {}
declare module 'prismjs-components-importer/cjs/prism-sql' {}
declare module 'prismjs-components-importer/cjs/prism-typescript' {}
declare module 'prismjs-components-importer/cjs/prism-yaml' {}
