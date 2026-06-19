# Static Sites Builder with myanmardev.com

A modern, elegant static site builder built with **Astro**, featuring full **i18n support** (English & Burmese), **Firebase integration**, and **automatic GitHub Pages deployment**.

## 🌟 Features

- ✨ **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 🌍 **Full i18n Support** - Complete English & Burmese translations
- 🔥 **Firebase Integration** - Ready for Firebase backend
- 📱 **Responsive Design** - Works perfectly on all devices
- 🚀 **GitHub Pages Ready** - Automatic deployment via GitHub Actions
- 🎨 **Customizable** - Easy to extend and modify
- ⚡ **Fast** - Static site generation with Astro

## 📋 Pages

### English Pages
- **Home** (`/`) - Landing page with hero section and features
- **Site Builder** (`/builder`) - Template showcase and customization options
- **Documentation** (`/docs`) - Guides, FAQs, and tutorials
- **Contact** (`/contact`) - Contact form and support information

### Burmese Pages (Myanmar)
- **Home** (`/my/`) - ပင်မစာမျက်နှာ
- **Site Builder** (`/my/builder`) - ဆိုက်ဆောက်တည်ရန်
- **Documentation** (`/my/docs`) - စာ類
- **Contact** (`/my/contact`) - ဆက်သွယ်ရန်

## 🛠️ Tech Stack

- **Framework**: Astro 6.4.7
- **Styling**: Tailwind CSS 4.3.1
- **UI Components**: React 19.2.7 (for interactive components)
- **i18n**: Custom i18n system with JSON translations
- **Backend**: Firebase 12.14.0
- **Package Manager**: pnpm 10

## 🚀 Getting Started

### Prerequisites
- Node.js 22+ 
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/vibecode-ting/ch-3.git
cd ch-3

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
ch-3/
├── src/
│   ├── pages/           # Page components
│   │   ├── index.astro  # Home (English)
│   │   ├── builder.astro
│   │   ├── docs.astro
│   │   ├── contact.astro
│   │   └── my/          # Burmese pages
│   │       ├── index.astro
│   │       ├── builder.astro
│   │       ├── docs.astro
│   │       └── contact.astro
│   ├── components/      # Reusable components
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── Features.astro
│   │   └── LanguageSwitcher.tsx
│   ├── layouts/         # Layout components
│   │   └── Layout.astro
│   ├── i18n/            # Internationalization
│   │   ├── en.json      # English translations
│   │   ├── my.json      # Burmese translations
│   │   └── utils.ts     # i18n utilities
│   └── lib/             # Utilities
│       └── firebase.ts  # Firebase configuration
├── public/              # Static assets
├── .github/workflows/   # GitHub Actions
│   └── deploy.yml       # Deployment workflow
├── astro.config.mjs     # Astro configuration
├── tailwind.config.mjs   # Tailwind configuration
└── postcss.config.mjs   # PostCSS configuration
```

## 🌐 Language Switching

The site automatically detects the language from the URL:
- English: `/` or `/en/`
- Burmese: `/my/`

Click the language switcher in the header to change languages.

## 🔥 Firebase Integration

Firebase configuration is already set up in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBYo7LEhWlNPTkpoS65x0gf0EDq5sw1jVc",
  authDomain: "ting-51902.firebaseapp.com",
  projectId: "ting-51902",
  storageBucket: "ting-51902.firebasestorage.app",
  messagingSenderId: "1029883464067",
  appId: "1:1029883464067:web:c206751c630f1f4a8c4eb6",
  measurementId: "G-ZTVB76MM6W"
};
```

## 📝 Adding Translations

To add new translations:

1. Edit `src/i18n/en.json` for English
2. Edit `src/i18n/my.json` for Burmese
3. Use the `t()` function in components:

```astro
---
import { t } from '../i18n/utils';
const lang = 'en';
---

<h1>{t(lang, 'header.title')}</h1>
```

## 🚀 Deployment

### GitHub Pages

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`.

**Steps:**
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Site is live at `https://vibecode-ting.github.io/ch-3/`

### Custom Domain

To use a custom domain:
1. Add your domain to GitHub Pages settings
2. Update `site` in `astro.config.mjs`
3. Push the changes

## 📚 Git Commits

Each feature has been committed separately:

```
✓ Initial Astro project setup with i18n support (EN/MY), header, and hero section
✓ Site Builder pages with template showcase (EN/MY)
✓ Documentation pages with guides and FAQ (EN/MY)
✓ Contact pages with form and support information (EN/MY)
```

## 🎨 Customization

### Colors & Styling
Edit `tailwind.config.mjs` to customize colors and theme.

### Components
- Modify components in `src/components/`
- Update layouts in `src/layouts/`

### Pages
- Add new pages in `src/pages/`
- Create Burmese versions in `src/pages/my/`

## 📖 Documentation

For more information:
- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for Myanmar Developers

---

**Repository**: https://github.com/vibecode-ting/ch-3
