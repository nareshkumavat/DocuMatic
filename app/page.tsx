"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Copy, Download, RefreshCw, Wand2, Github, Moon, Sun, Monitor, Palette, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toaster, toast } from "sonner"
import { SettingsModal, type ApiProvider } from "@/components/SettingsModal"
import { useTheme } from "next-themes"

// Background Gradients Registry
const BACKGROUNDS = [
  "aurora-bg",
  "ocean-depths-bg",
  "sunset-vibes-bg",
  "midnight-bloom-bg",
  "nebula-dream-bg"
];

export default function Page() {
  const [code, setCode] = useState("")
  const [tone, setTone] = useState("Professional")
  const [generatedReadme, setGeneratedReadme] = useState("")
  const [loading, setLoading] = useState(false)
  const [mobileTab, setMobileTab] = useState<"input" | "output">("input")

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false)
  const [editedReadme, setEditedReadme] = useState("")

  // Theme & Background State
  const { theme, setTheme } = useTheme()
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Settings State - Feature Hidden but Logic Retained
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [provider, setProvider] = useState<ApiProvider>("pollinations")
  const [apiKey, setApiKey] = useState("")
  const [apiModel, setApiModel] = useState("")

  // Load settings on mount
  useEffect(() => {
    setMounted(true)
    setProvider((localStorage.getItem("api_provider") as ApiProvider) || "pollinations")
    setApiKey(localStorage.getItem("api_key") || "")
    setApiModel(localStorage.getItem("api_model") || "")

    // Load saved background
    const savedBg = localStorage.getItem("documatic_bg_index")
    if (savedBg) setBackgroundIndex(parseInt(savedBg))
  }, [])

  const cycleBackground = () => {
    const nextIndex = (backgroundIndex + 1) % BACKGROUNDS.length
    setBackgroundIndex(nextIndex)
    localStorage.setItem("documatic_bg_index", nextIndex.toString())
    toast.success("Background Updated", { description: BACKGROUNDS[nextIndex].replace("-bg", "").replace(/-/g, " ") })
  }

  const handleSettingsSave = (newProvider: ApiProvider, newKey: string, newModel: string) => {
    setProvider(newProvider)
    setApiKey(newKey)
    setApiModel(newModel)
  }

  async function handleGenerate() {
    if (!code.trim()) {
      toast.error("Please enter some code first")
      return
    }

    setLoading(true)
    setGeneratedReadme("") // Clear previous
    setEditedReadme("")
    setIsEditing(false)

    const systemPrompt = `You are a technical writer. Write a README.md for this code.
Tone: ${tone}.
Sections: Title, Description, Features, Tech Stack, Installation, Usage.
Return ONLY Markdown.`

    const userContent = `Code: \n\n${code} `

    try {
      let responseText = ""

      if (provider === "pollinations") {
        // ... Existing Pollinations Logic (Client-Side) ...
        const response = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent }
            ],
            model: 'openai',
            jsonMode: false
          }),
        });
        if (!response.ok) throw new Error(`Pollinations Error: ${response.status}`)
        responseText = await response.text()

      } else if (provider === "huggingface") {
        // Hugging Face Inference API
        const model = apiModel || "mistralai/Mistral-7B-Instruct-v0.2"
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            inputs: `${systemPrompt}\n\n${userContent}`,
            parameters: { max_new_tokens: 1500, return_full_text: false }
          })
        })
        if (!response.ok) throw new Error(`HF Error: ${response.status} - ${await response.text()}`)
        const data = await response.json()
        responseText = Array.isArray(data) ? data[0].generated_text : data.generated_text

      } else if (provider === "openrouter" || provider === "together") {
        // OpenRouter / Together AI (OpenAI Compatible)
        const url = provider === "openrouter"
          ? "https://openrouter.ai/api/v1/chat/completions"
          : "https://api.together.xyz/v1/chat/completions"

        const model = apiModel || (provider === "openrouter" ? "mistralai/mistral-7b-instruct" : "meta-llama/Llama-3-8b-chat-hf")

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent }
            ]
          })
        })
        if (!response.ok) throw new Error(`${provider} Error: ${response.status}`)
        const data = await response.json()
        responseText = data.choices?.[0]?.message?.content || ""
      } else if (provider === "gemini") {
        // Gemini API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }]
          })
        })
        if (!response.ok) throw new Error(`Gemini Error: ${response.status}`)
        const data = await response.json()
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      }

      if (!responseText || responseText.length < 10) {
        throw new Error("Generated content empty.")
      }

      // Cleanup Markdown
      const cleanMarkdown = responseText.replace(/(\n\s*)*\*\*Generative AI by using Pollinations\*\*.*/gi, "")
        .replace(/^```markdown/, '').replace(/^```/, '').replace(/```$/, '') // specific cleanup
      setGeneratedReadme(cleanMarkdown)
      setEditedReadme(cleanMarkdown)
      toast.success("Documentation Generated!")
      if (window.innerWidth < 1024) setMobileTab("output")

    } catch (error) {
      console.error("Generation failed:", error)
      toast.error(error instanceof Error ? error.message : "Network error")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!generatedReadme) return
    navigator.clipboard.writeText(generatedReadme)
    toast.success("Copied to clipboard")
  }

  const downloadMarkdown = () => {
    if (!generatedReadme) return
    const blob = new Blob([generatedReadme], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "README.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Downloaded README.md")
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel Edit
      setIsEditing(false)
      setEditedReadme(generatedReadme) // Revert
    } else {
      // Start Edit
      setIsEditing(true)
      setEditedReadme(generatedReadme)
    }
  }

  const handleSaveEdit = () => {
    setGeneratedReadme(editedReadme)
    setIsEditing(false)
    toast.success("Changes saved locally")
  }

  if (!mounted) return null

  return (
    <main className="h-screen flex flex-col relative overflow-hidden text-foreground bg-background transition-colors duration-500">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={handleSettingsSave} />

      {/* Dynamic Background */}
      <div className={`absolute inset-0 opacity-40 pointer-events-none transition-all duration-1000 ${BACKGROUNDS[backgroundIndex]}`} />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <Toaster position="top-right" />

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6 flex items-center justify-between border-b border-border/10 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div
            className="bg-primary/20 p-2 rounded-xl border border-primary/30 cursor-pointer hover:scale-105 transition-transform"
            onClick={cycleBackground}
            role="button"
            aria-label="Cycle Background"
          >
            <Wand2 className="w-6 h-6 text-primary" />
          </div>
          <div onClick={cycleBackground} className="cursor-pointer">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              DocuMatic
            </h1>
            <p className="text-xs text-muted-foreground font-medium">AI Documentation Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="nav-btn"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open("https://github.com/nareshkumavat/DocuMatic", "_blank")}
            className="nav-btn hidden sm:flex group"
          >
            <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="sr-only">GitHub</span>
          </Button>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-border/10 bg-background/50">
        <button
          onClick={() => setMobileTab("input")}
          className={`flex-1 p-3 text-sm font-medium transition-colors ${mobileTab === "input" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground"}`}
        >
          Input Code
        </button>
        <button
          onClick={() => setMobileTab("output")}
          className={`flex-1 p-3 text-sm font-medium transition-colors ${mobileTab === "output" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground"}`}
        >
          Preview ({generatedReadme ? "Ready" : "Empty"})
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* Left Panel: Input */}
        <div className={`flex-1 flex flex-col p-4 md:p-6 gap-4 transition-all duration-300 ${mobileTab === "output" ? "hidden lg:flex" : "flex"}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Source Code</h2>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-[140px] bg-background/50 border-input h-8 text-xs">
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Detailed">Detailed</SelectItem>
                <SelectItem value="Concise">Concise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here (JavaScript, Python, React, etc.)..."
              className="w-full h-full resize-none bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 backdrop-blur-sm shadow-inner transition-all"
              spellCheck={false}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !code.trim()}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 shadow-lg shadow-primary/20 transition-all active:scale-[0.99]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2 fill-current" />
                Generate Docs
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Using: <span className="text-primary font-medium capitalize">{provider}</span>
            {provider === "pollinations" && " (Simulated)"}
          </p>
        </div>

        {/* Right Panel: Output */}
        <div className={`flex-1 flex flex-col p-4 md:p-6 gap-4 bg-background/30 border-l border-border/10 backdrop-blur-sm transition-all duration-300 ${mobileTab === "input" ? "hidden lg:flex" : "flex"}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isEditing ? "Editing Mode" : "Preview"}
            </h2>
            <div className="flex gap-2">
              {generatedReadme && (
                isEditing ? (
                  <>
                    <Button variant="default" size="sm" onClick={handleSaveEdit} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleEditToggle} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-muted-foreground hover:text-foreground">
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={downloadMarkdown} className="text-muted-foreground hover:text-foreground">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </>
                )
              )}
            </div>
          </div>

          <div className="flex-1 rounded-xl border border-border/50 bg-background/40 overflow-hidden relative shadow-inner">
            {generatedReadme ? (
              isEditing ? (
                <Textarea
                  value={editedReadme}
                  onChange={(e) => setEditedReadme(e.target.value)}
                  className="w-full h-full resize-none p-6 font-mono text-sm bg-transparent border-0 focus-visible:ring-0 text-foreground/90 leading-relaxed"
                />
              ) : (
                <div className="absolute inset-0 overflow-auto p-6 prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-foreground/90">{generatedReadme}</pre>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="p-4 rounded-full bg-background/50 border border-border/50">
                  <Wand2 className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm">Generated documentation will appear here</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
