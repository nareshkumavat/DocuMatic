"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useEffect } from "react"

interface GlassModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export function GlassModal({ isOpen, onClose, title, children }: GlassModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className="w-full max-w-lg pointer-events-auto"
                        >
                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-2xl">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-white/5 p-6">
                                    <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                                        {title}
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 text-slate-300 max-h-[70vh] overflow-y-auto scrollbar-thin">
                                    {children}
                                </div>

                                {/* Ambient Glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-20 bg-indigo-500/20 blur-3xl -z-10 pointer-events-none"></div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
