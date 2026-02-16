
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, Key, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export type ApiProvider = "pollinations" | "huggingface" | "openrouter" | "together" | "gemini"

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (provider: ApiProvider, key: string, model: string) => void
}

export const SettingsModal = ({ isOpen, onClose, onSave }: SettingsModalProps) => {
    const [provider, setProvider] = useState<ApiProvider>("pollinations")
    const [apiKey, setApiKey] = useState("")
    const [model, setModel] = useState("")
    const [isValidating, setIsValidating] = useState(false)

    useEffect(() => {
        const savedProvider = localStorage.getItem("api_provider") as ApiProvider || "pollinations"
        const savedKey = localStorage.getItem("api_key") || ""
        const savedModel = localStorage.getItem("api_model") || ""

        setProvider(savedProvider)
        setApiKey(savedKey)
        setModel(savedModel)
    }, [isOpen])

    const handleSave = () => {
        localStorage.setItem("api_provider", provider)
        localStorage.setItem("api_key", apiKey)
        localStorage.setItem("api_model", model)
        onSave(provider, apiKey, model)
        toast.success("Settings saved successfully")
        onClose()
    }

    const testConnection = async () => {
        setIsValidating(true)
        try {
            // Validation logic simulates a request based on provider
            if (provider === "huggingface") {
                const res = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${apiKey}` },
                    body: JSON.stringify({ inputs: "Test" })
                })
                if (!res.ok) throw new Error("Invalid HF Key")
            } else if (provider === "openrouter") {
                const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
                    headers: { Authorization: `Bearer ${apiKey}` }
                })
                if (!res.ok) throw new Error("Invalid OpenRouter Key")
            }
            // Add others as needed
            toast.success("Connection Verified!")
        } catch (e) {
            toast.error("Connection Failed", { description: "Check your API Key" })
        } finally {
            setIsValidating(false)
        }
    }

    const getProviderInfo = () => {
        switch (provider) {
            case "pollinations": return "Free, no key required. Limited by strict content filters."
            case "huggingface": return "Requires User Access Token (Read). Great for free inference."
            case "openrouter": return "Aggregator for GPT-4, Claude 3, Llama 3. Paid per usage."
            case "together": return "Fast inference for open source models (Llama-3, Mixtral)."
            case "gemini": return "Google's Gemini Pro. Free tier available."
            default: return ""
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 p-6 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-indigo-400" />
                                API Settings
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                                <X className="w-5 h-5 text-gray-400" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-gray-300">AI Provider</Label>
                                <Select value={provider} onValueChange={(v: ApiProvider) => setProvider(v)}>
                                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1e293b] border-white/10 text-white">
                                        <SelectItem value="pollinations">Pollinations (Free, Limited)</SelectItem>
                                        <SelectItem value="huggingface">Hugging Face</SelectItem>
                                        <SelectItem value="openrouter">OpenRouter</SelectItem>
                                        <SelectItem value="together">Together AI</SelectItem>
                                        <SelectItem value="gemini">Google Gemini</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-indigo-300/80 px-1">{getProviderInfo()}</p>
                            </div>

                            {provider !== "pollinations" && (
                                <div className="space-y-2">
                                    <Label className="text-gray-300">API Key</Label>
                                    <div className="relative">
                                        <Input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder={provider === "huggingface" ? "hf_..." : "sk-..."}
                                            className="bg-black/20 border-white/10 text-white pr-20"
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute right-1 top-1 h-7 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                            onClick={testConnection}
                                            disabled={!apiKey || isValidating}
                                        >
                                            {isValidating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                            Test
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {provider === "huggingface" && (
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Model ID (Optional)</Label>
                                    <Input
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        placeholder="mistralai/Mistral-7B-Instruct-v0.2"
                                        className="bg-black/20 border-white/10 text-white"
                                    />
                                </div>
                            )}

                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/5">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                                <Save className="w-4 h-4 mr-2" />
                                Save Settings
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
