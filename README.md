# 🧬 GenBlend — See Your Future Family

🔗 Live Demo: Try GenBlend Here - https://gene-blend-maker.lovable.app

> AI-powered baby & family face prediction from two parent photos.

Upload two photos and let AI imagine what your future child — or the whole family — could look like. GenBlend blends facial features from both parents to generate photorealistic portraits.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **👶 Solo Child** | Generate a boy or girl at toddler, child, or teen age |
| **👨‍👩‍👧‍👦 Family Portrait** | Build a full family with multiple children, custom ages, genders & names |
| **👶👶 Twins Mode** | Add twin siblings with one click |
| **🎨 High-Fidelity Parents** | AI preserves parent likeness while only imagining the children |
| **🔤 Auto Names** | Smart name generation for each child (or enter your own) |
| **📜 History** | Last 8 generations saved locally in your browser |
| **📤 Share** | Native share, WhatsApp, or copy-to-clipboard |
| **⬇️ Download** | Save any generated portrait as JPG |
| **📱 Responsive** | Works beautifully on mobile, tablet, and desktop |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [TanStack Start](https://tanstack.com/start) (full-stack React 19) |
| **Bundler** | Vite 7 |
| **Styling** | Tailwind CSS v4 + oklch design tokens |
| **UI Components** | shadcn/ui + Radix UI primitives |
| **Icons** | Lucide React |
| **AI** | Google Gemini 2.5 Flash Image (via [Lovable AI Gateway](https://lovable.dev)) |
| **Toasts** | Sonner |
| **Router** | TanStack Router (file-based) |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- A [Lovable AI Gateway](https://lovable.dev) API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd genblend

# Install dependencies
bun install

# Set environment variables
cp .env.example .env
# Edit .env and add your LOVABLE_API_KEY

# Run the dev server
bun dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
LOVABLE_API_KEY=your_lovable_api_key_here
```

> 🔒 The `LOVABLE_API_KEY` is **server-side only** and is never exposed to the browser.

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── genblend/
│   │   ├── LoadingOverlay.tsx    # Animated AI processing spinner
│   │   └── UploadZone.tsx        # Drag & drop photo uploader with compression
│   └── ui/                        # shadcn/ui components (Button, Dialog, Select, etc.)
├── lib/
│   ├── childNames.ts             # Curated name pools (boy/girl)
│   ├── generateChild.ts          # Client API client for generation
│   ├── genHistory.ts             # LocalStorage history manager
│   ├── imageUtils.ts             # Image compression & dataURL helpers
│   └── utils.ts                  # Tailwind cn() utility
├── routes/
│   ├── __root.tsx                # Root layout (HTML shell)
│   ├── index.tsx                 # Main app page — all the UI logic
│   └── api/
│       └── generate-child.ts     # Server route: AI prompt builder + image generation
├── styles.css                    # Design system tokens (oklch colors, radius, shadows)
├── router.tsx                    # TanStack Router setup
├── start.ts                      # TanStack Start server instance
└── server.ts                     # Server entry
```

---

## 🎮 How It Works

### 1. Upload Parent Photos
Users drag & drop or pick two clear face photos. Images are automatically **compressed** to ~1024px before sending to reduce bandwidth and API costs.

### 2. Choose Generation Mode
- **Boy** or **Girl** — single child portrait
- **Family** — full family portrait with customizable children

### 3. Customize (Family Mode)
- Add/remove children (up to 5)
- Set each child's **gender** and **age** (toddler / child / teen)
- Assign custom **names** (or let the app pick random ones)
- Add **twins** with one click 👶👶

### 4. AI Generation
The server builds a detailed prompt and sends both parent photos to the **Google Gemini 2.5 Flash Image** model via the Lovable AI Gateway. The prompt includes:

- **Identity Lock** — strict instructions to preserve parent faces with high fidelity
- **Genetic Blending** — children must visibly inherit features from both parents
- **Twin Logic** — twin siblings get strong resemblance and identical age

### 5. View, Save & Share
Results appear instantly with:
- One-click **download** as JPG
- **Native Share** (mobile) / **WhatsApp** / **Copy link**
- Saved to **local history** (last 8 generations)

---

## 🧪 API Endpoint

### `POST /api/generate-child`

Generates an AI portrait from two parent photos.

**Request Body:**

```json
{
  "parent1": "data:image/jpeg;base64,/9j/4AAQ...",
  "parent2": "data:image/jpeg;base64,/9j/4AAQ...",
  "mode": "family",
  "age": "child",
  "children": [
    { "gender": "boy", "age": "child", "name": "Leo" },
    { "gender": "girl", "age": "toddler", "name": "Maya", "twinWithPrev": true }
  ],
  "names": ["Leo", "Maya"]
}
```

**Response:**

```json
{
  "imageUrl": "https://ai.gateway.lovable.dev/.../image.png"
}
```

---

## 🎨 Design System

Colors are defined in `src/styles.css` using **oklch** for perceptual uniformity:

| Token | Light Mode | Usage |
|-------|-----------|-------|
| `--primary` | `oklch(0.52 0.22 290)` | Buttons, accents, interactive elements |
| `--background` | `oklch(0.985 0.01 310)` | Page background |
| `--card` | `oklch(1 0 0)` | Surface cards |
| `--accent` | `oklch(0.88 0.08 25)` | Warm highlights |
| `--muted` | `oklch(0.96 0.015 300)` | Secondary backgrounds |

The UI features glassmorphism (backdrop blur), soft gradients, and smooth transitions throughout.

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bun preview` | Preview production build |
| `bun lint` | Run ESLint |
| `bun format` | Run Prettier |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-thing`
3. Commit your changes: `git commit -m 'Add amazing thing'`
4. Push to the branch: `git push origin feature/amazing-thing`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use, modify, and share.

---

<p align="center">
  <a href="https://lovable.dev">Powered by Lovable</a>
</p>
