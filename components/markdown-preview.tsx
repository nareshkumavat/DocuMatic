"use client"

import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownPreviewProps {
    content: string
    className?: string
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
    return (
        <div className={cn("prose prose-invert max-w-none p-4", className)}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    )
}
