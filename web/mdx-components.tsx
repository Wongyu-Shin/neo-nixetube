import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mt-12 mb-6 text-amber-400 border-b border-amber-400/30 pb-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-10 mb-4 text-amber-300">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-8 mb-3 text-amber-200">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-relaxed text-stone-300">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-1 text-stone-300 ml-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1 text-stone-300 ml-4">{children}</ol>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-stone-700 text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-stone-700 px-3 py-2 bg-stone-800 text-amber-300 font-semibold text-left">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-stone-700 px-3 py-2 text-stone-300">{children}</td>
    ),
    code: ({ children, className }) => {
      if (className) {
        return <code className={`${className} block bg-stone-900 p-4 rounded-lg mb-4 overflow-x-auto text-sm`}>{children}</code>
      }
      return <code className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300 text-sm">{children}</code>
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-amber-400 pl-4 py-2 mb-4 bg-stone-800/50 rounded-r-lg italic text-stone-400">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="text-amber-200 font-semibold">{children}</strong>
    ),
    a: ({ children, href }) => (
      <a href={href} className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
        {children}
      </a>
    ),
    ...components,
  }
}
