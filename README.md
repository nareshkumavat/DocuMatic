# DocuMatic ⚡️

**DocuMatic** is a modern, AI-powered documentation generator built with Next.js, Tailwind CSS, and Capacitor. It transforms raw code into professional `README.md` documentation in seconds using multiple AI providers.

![DocuMatic Banner](https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop)

## 🚀 Features

- **Multi-Provider AI Support**:
  - **OpenRouter** (Recommended)
  - **Hugging Face** (Free Tier)
  - **Together AI**
  - **Google Gemini**
- **Zero-Config**: "Bring Your Own Key" (BYOK) architecture. Keys are stored securely in your browser's `localStorage`.
- **Edit Mode**: Modify generated documentation directly in the app before exporting.
- **Cross-Platform**:
  - 🌐 **Web**: Responsive Progressive Web App (PWA).
  - 📱 **Mobile**: Native Android support via Capacitor.
- **Modern UI/UX**:
  - ✨ **Glassmorphism Design**: Frosted glass effects and fluid animations.
  - 🌗 **Dark/Light Mode**: Fully customizable theming.
  - 🎨 **Dynamic Backgrounds**: 5+ stunning gradient textures (Aurora, Ocean, Sunset).

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Mobile**: [Capacitor](https://capacitorjs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State**: React Hooks & LocalStorage

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/nareshkumavat/DocuMatic.git
cd DocuMatic
npm install
```

## 🏃‍♂️ Usage

### Web Development
Start the development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Mobile Development (Android)
Sync the web build to the native Android project:

```bash
npm run build
npx cap sync
npx cap open android
```

## ⚙️ Configuration

1. Click the **Settings (Gear)** icon in the top header (hidden by default in production).
2. Select your preferred **AI Provider**.
3. Enter your **API Key** (stored locally only).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
