import prism from 'prismjs'

type LanguageLoader = () => Promise<unknown>

const languageLoaders: Record<string, LanguageLoader> = {
  c: () => import('prismjs-components-importer/cjs/prism-c'),
  clojure: () => import('prismjs-components-importer/cjs/prism-clojure'),
  cpp: () => import('prismjs-components-importer/cjs/prism-cpp'),
  csharp: () => import('prismjs-components-importer/cjs/prism-csharp'),
  css: () => import('prismjs-components-importer/cjs/prism-css'),
  dart: () => import('prismjs-components-importer/cjs/prism-dart'),
  docker: () => import('prismjs-components-importer/cjs/prism-docker'),
  elixir: () => import('prismjs-components-importer/cjs/prism-elixir'),
  go: () => import('prismjs-components-importer/cjs/prism-go'),
  markup: () => import('prismjs-components-importer/cjs/prism-markup'),
  java: () => import('prismjs-components-importer/cjs/prism-java'),
  javascript: () => import('prismjs-components-importer/cjs/prism-javascript'),
  json: () => import('prismjs-components-importer/cjs/prism-json'),
  julia: () => import('prismjs-components-importer/cjs/prism-julia'),
  kotlin: () => import('prismjs-components-importer/cjs/prism-kotlin'),
  lua: () => import('prismjs-components-importer/cjs/prism-lua'),
  markdown: () => import('prismjs-components-importer/cjs/prism-markdown'),
  pascal: () => import('prismjs-components-importer/cjs/prism-pascal'),
  php: () => import('prismjs-components-importer/cjs/prism-php'),
  python: () => import('prismjs-components-importer/cjs/prism-python'),
  ruby: () => import('prismjs-components-importer/cjs/prism-ruby'),
  rust: () => import('prismjs-components-importer/cjs/prism-rust'),
  sql: () => import('prismjs-components-importer/cjs/prism-sql'),
  typescript: () => import('prismjs-components-importer/cjs/prism-typescript'),
  yaml: () => import('prismjs-components-importer/cjs/prism-yaml'),
}

const loadedLanguages = new Set(['markup', 'css', 'clike', 'javascript'])

export async function ensurePrismLanguage(language: string): Promise<string> {
  const normalizedLanguage = language.toLowerCase()

  if (loadedLanguages.has(normalizedLanguage) || prism.languages[normalizedLanguage]) {
    return normalizedLanguage
  }

  const loadLanguage = languageLoaders[normalizedLanguage]

  if (!loadLanguage) {
    return 'text'
  }

  await loadLanguage()
  loadedLanguages.add(normalizedLanguage)
  return prism.languages[normalizedLanguage] ? normalizedLanguage : 'text'
}

export default prism
