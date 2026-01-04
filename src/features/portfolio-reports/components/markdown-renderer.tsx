'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
    content: string
    className?: string
}

const markdownComponents: Components = {
    table: ({ children }) => (
        <div className="border-border my-4 overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-sm">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-border border-b last:border-b-0">{children}</tr>,
    th: ({ children }) => (
        <th className="text-foreground border-border border-r px-3 py-2 text-left font-semibold whitespace-nowrap last:border-r-0">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="text-foreground border-border border-r px-3 py-2 align-top last:border-r-0">
            {children}
        </td>
    )
}

export const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
    return (
        <div
            className={cn(
                'prose prose-sm dark:prose-invert max-w-none',
                // Headers
                'prose-headings:text-foreground prose-headings:font-semibold',
                'prose-h1:text-2xl prose-h1:border-b prose-h1:pb-2 prose-h1:mb-4',
                'prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4',
                'prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3',
                // Paragraphs
                'prose-p:text-foreground prose-p:leading-relaxed',
                // Strong/Bold
                'prose-strong:text-foreground prose-strong:font-semibold',
                // Lists
                'prose-li:text-foreground',
                'prose-ul:my-4 prose-ol:my-4',
                // Horizontal rules
                'prose-hr:border-border prose-hr:my-6',
                // Code blocks
                'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
                'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg',
                className
            )}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {content}
            </ReactMarkdown>
        </div>
    )
}
