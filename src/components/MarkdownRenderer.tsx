import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) {
    return <span className="text-slate-400 italic">No content available</span>;
  }

  return (
    <div className={`markdown-body text-slate-800 text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-5 mb-3 pb-2.5 border-b border-slate-200/80 flex items-center gap-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-indigo-950 tracking-tight mt-6 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-slate-800 mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1.5 mb-3 text-xs sm:text-sm text-slate-700 marker:text-indigo-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-xs sm:text-sm text-slate-700 marker:text-indigo-600 marker:font-bold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900 text-inherit">
              {children}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/70 pl-4 pr-3 py-2.5 my-3 rounded-r-lg italic text-slate-700 text-xs sm:text-sm shadow-xs">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 bg-white shadow-sm custom-scrollbar">
              <table className="min-w-full border-collapse text-left text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50/80 transition-colors odd:bg-white even:bg-slate-50/40">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-r border-slate-200/60 last:border-r-0 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-slate-700 text-xs sm:text-sm border-r border-slate-100 last:border-r-0 align-top">
              {children}
            </td>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName && typeof children === 'string' && !children.includes('\n');
            if (isInline) {
              return (
                <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[11px] border border-slate-200/80">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-xs overflow-x-auto my-3 shadow-inner custom-scrollbar">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          hr: () => (
            <hr className="border-t border-slate-200 my-4" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
            >
              {children}
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
