const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const outDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'products');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Map of 24 products with brand identities
const PRODUCT_THEMES = {
  'google-ai-pro': {
    brand: 'Google Gemini',
    title: 'GEMINI PRO',
    tag: 'DEEP REASONING • 18M',
    color1: '#4285F4',
    color2: '#9B51E0',
    color3: '#00C9FF',
    icon: `<path d="M120 40 C120 84 84 120 40 120 C84 120 120 156 120 200 C120 156 156 120 200 120 C156 120 120 84 120 40 Z" fill="url(#brandGrad)" filter="url(#glow)"/>`
  },
  'canva-pro': {
    brand: 'Canva',
    title: 'CANVA PRO',
    tag: 'FAMILY EDITION • 1 YEAR',
    color1: '#00C4CC',
    color2: '#7D2AE8',
    color3: '#FF5C35',
    icon: `<text x="120" y="145" font-family="Space Grotesk, sans-serif" font-weight="900" font-size="76" fill="url(#brandGrad)" text-anchor="middle" filter="url(#glow)">Canva</text>`
  },
  'canva-business-panel-1m': {
    brand: 'Canva Business',
    title: 'BUSINESS PANEL',
    tag: 'TEAM EDITION • 1 MONTH',
    color1: '#00C4CC',
    color2: '#8B5CF6',
    color3: '#3B82F6',
    icon: `<rect x="65" y="65" width="110" height="110" rx="24" fill="url(#brandGrad)" filter="url(#glow)"/><text x="120" y="140" font-family="sans-serif" font-weight="900" font-size="56" fill="#fff" text-anchor="middle">C</text>`
  },
  'canva-business-panel-5y': {
    brand: 'Canva Enterprise',
    title: 'BUSINESS 5 YEARS',
    tag: 'LIFETIME PANEL ACCESS',
    color1: '#F59E0B',
    color2: '#EC4899',
    color3: '#8B5CF6',
    icon: `<polygon points="120,50 142,95 192,102 156,137 165,187 120,163 75,187 84,137 48,102 98,95" fill="url(#brandGrad)" filter="url(#glow)"/>`
  },
  'capcut-pro': {
    brand: 'CapCut',
    title: 'CAPCUT PRO',
    tag: 'AI VIDEO • 4K NO WATERMARK',
    color1: '#00F2FE',
    color2: '#4FACFE',
    color3: '#000000',
    icon: `<rect x="60" y="60" width="120" height="120" rx="28" fill="#111" stroke="url(#brandGrad)" stroke-width="4"/><path d="M85 85 L140 120 L85 155 Z" fill="url(#brandGrad)" filter="url(#glow)"/>`
  },
  'chatgpt-plus': {
    brand: 'OpenAI',
    title: 'CHATGPT PLUS',
    tag: 'GPT-4o • PRO ACCESS',
    color1: '#10A37F',
    color2: '#1A7F64',
    color3: '#00F2FE',
    icon: `<circle cx="120" cy="120" r="55" fill="none" stroke="url(#brandGrad)" stroke-width="10" filter="url(#glow)"/><circle cx="120" cy="120" r="25" fill="url(#brandGrad)"/>`
  },
  'chatgpt-plus-private-mail': {
    brand: 'OpenAI Dedicated',
    title: 'CHATGPT DEDICATED',
    tag: 'PRIVATE MAIL • 4 MONTHS',
    color1: '#10B981',
    color2: '#6366F1',
    color3: '#3B82F6',
    icon: `<rect x="65" y="75" width="110" height="90" rx="18" fill="none" stroke="url(#brandGrad)" stroke-width="6"/><path d="M70 85 L120 125 L170 85" fill="none" stroke="url(#brandGrad)" stroke-width="6"/>`
  },
  'super-grok': {
    brand: 'xAI Grok',
    title: 'SUPER GROK',
    tag: 'REAL-TIME REASONING',
    color1: '#F43F5E',
    color2: '#EC4899',
    color3: '#8B5CF6',
    icon: `<path d="M80 80 L160 160 M160 80 L80 160" stroke="url(#brandGrad)" stroke-width="18" stroke-linecap="round" filter="url(#glow)"/>`
  },
  'perplexity-enterprise-pro': {
    brand: 'Perplexity AI',
    title: 'PERPLEXITY PRO',
    tag: 'DEEP RESEARCH SEARCH',
    color1: '#20B2AA',
    color2: '#0EA5E9',
    color3: '#6366F1',
    icon: `<circle cx="120" cy="120" r="50" fill="none" stroke="url(#brandGrad)" stroke-width="8"/><circle cx="120" cy="120" r="14" fill="url(#brandGrad)"/><line x1="120" y1="50" x2="120" y2="190" stroke="url(#brandGrad)" stroke-width="4"/><line x1="50" y1="120" x2="190" y2="120" stroke="url(#brandGrad)" stroke-width="4"/>`
  },
  'leonardo-ai': {
    brand: 'Leonardo AI',
    title: 'LEONARDO AI',
    tag: '8,500 CREDITS • ULTRA GEN',
    color1: '#EC4899',
    color2: '#A855F7',
    color3: '#6366F1',
    icon: `<polygon points="120,60 170,160 70,160" fill="url(#brandGrad)" filter="url(#glow)"/><polygon points="120,90 150,150 90,150" fill="#070B18"/>`
  },
  'google-veo-3-ultra': {
    brand: 'Google DeepMind',
    title: 'GOOGLE VEO 3',
    tag: 'UNLIMITED AI VIDEO 4K',
    color1: '#4285F4',
    color2: '#EA4335',
    color3: '#FBBC05',
    icon: `<rect x="65" y="70" width="110" height="100" rx="20" fill="none" stroke="url(#brandGrad)" stroke-width="6"/><polygon points="110,100 145,120 110,140" fill="url(#brandGrad)" filter="url(#glow)"/>`
  },
  'surfshark-vpn': {
    brand: 'Surfshark',
    title: 'SURFSHARK VPN',
    tag: 'UNLIMITED DEVICES • SAFE',
    color1: '#14B8A6',
    color2: '#06B6D4',
    color3: '#3B82F6',
    icon: `<path d="M80 140 C90 100 130 90 160 110 C150 140 110 150 80 140 Z" fill="url(#brandGrad)" filter="url(#glow)"/><path d="M120 70 C140 90 150 110 145 120" stroke="url(#brandGrad)" stroke-width="6" fill="none"/>`
  },
  'surfshark-coupon': {
    brand: 'Surfshark Discount',
    title: 'SURFSHARK PASS',
    tag: 'SPECIAL ACTIVATION',
    color1: '#06B6D4',
    color2: '#10B981',
    color3: '#6366F1',
    icon: `<rect x="65" y="80" width="110" height="80" rx="14" fill="none" stroke="url(#brandGrad)" stroke-width="6" stroke-dasharray="10,6"/><text x="120" y="130" font-family="monospace" font-weight="800" font-size="28" fill="url(#brandGrad)" text-anchor="middle">%</text>`
  },
  'nordvpn': {
    brand: 'NordVPN',
    title: 'NORD VPN',
    tag: 'HIGH SPEED SHIELD • 1Y',
    color1: '#4687FF',
    color2: '#1E40AF',
    color3: '#06B6D4',
    icon: `<polygon points="120,60 175,160 65,160" fill="url(#brandGrad)" filter="url(#glow)"/><polygon points="120,95 155,160 85,160" fill="#04060F"/>`
  },
  'linkedin-career-premium': {
    brand: 'LinkedIn',
    title: 'LINKEDIN CAREER',
    tag: 'INMAIL • PREMIUM INSIGHTS',
    color1: '#0A66C2',
    color2: '#0077B5',
    color3: '#38BDF8',
    icon: `<rect x="70" y="70" width="100" height="100" rx="20" fill="url(#brandGrad)" filter="url(#glow)"/><text x="120" y="145" font-family="sans-serif" font-weight="900" font-size="64" fill="#fff" text-anchor="middle">in</text>`
  },
  'notion-business': {
    brand: 'Notion',
    title: 'NOTION BUSINESS',
    tag: 'UNLIMITED AI • WORKSPACES',
    color1: '#FFFFFF',
    color2: '#94A3B8',
    color3: '#6366F1',
    icon: `<rect x="70" y="70" width="100" height="100" rx="18" fill="#18181B" stroke="url(#brandGrad)" stroke-width="5"/><text x="120" y="142" font-family="serif" font-weight="900" font-size="68" fill="#fff" text-anchor="middle">N</text>`
  },
  'netflix-premium-4k': {
    brand: 'Netflix',
    title: 'NETFLIX 4K ULTRA',
    tag: 'ULTRA HD • 4 SCREENS',
    color1: '#E50914',
    color2: '#B81D24',
    color3: '#FF5A5F',
    icon: `<text x="120" y="155" font-family="sans-serif" font-weight="900" font-size="110" fill="url(#brandGrad)" text-anchor="middle" filter="url(#glow)">N</text>`
  },
  'prime-video': {
    brand: 'Prime Video',
    title: 'PRIME VIDEO',
    tag: 'MOVIES • ORIGINALS 4K',
    color1: '#00A8E1',
    color2: '#0073BB',
    color3: '#38BDF8',
    icon: `<rect x="65" y="80" width="110" height="80" rx="18" fill="#0F172A" stroke="url(#brandGrad)" stroke-width="4"/><path d="M85 135 Q120 150 155 135" stroke="url(#brandGrad)" stroke-width="6" fill="none" stroke-linecap="round"/>`
  },
  'headspace-premium': {
    brand: 'Headspace',
    title: 'HEADSPACE PRO',
    tag: 'MINDFULNESS & MEDITATION',
    color1: '#F59E0B',
    color2: '#EA580C',
    color3: '#FBBF24',
    icon: `<circle cx="120" cy="120" r="55" fill="url(#brandGrad)" filter="url(#glow)"/>`
  },
  'outlook-mail': {
    brand: 'Microsoft Outlook',
    title: 'OUTLOOK PRO',
    tag: 'SECURE CLOUD STORAGE',
    color1: '#0078D4',
    color2: '#0284C7',
    color3: '#38BDF8',
    icon: `<rect x="65" y="75" width="110" height="90" rx="16" fill="url(#brandGrad)" filter="url(#glow)"/><text x="120" y="140" font-family="sans-serif" font-weight="900" font-size="52" fill="#fff" text-anchor="middle">O</text>`
  },
  'youtube-premium': {
    brand: 'YouTube',
    title: 'YOUTUBE PREMIUM',
    tag: 'AD-FREE • BACKGROUND 4K',
    color1: '#FF0000',
    color2: '#CC0000',
    color3: '#EC4899',
    icon: `<rect x="65" y="80" width="110" height="80" rx="22" fill="url(#brandGrad)" filter="url(#glow)"/><polygon points="110,105 140,120 110,135" fill="#fff"/>`
  },
  'replit-core': {
    brand: 'Replit',
    title: 'REPLIT CORE',
    tag: 'AI CLOUD DEV • REPUTATION',
    color1: '#F26207',
    color2: '#EA580C',
    color3: '#6366F1',
    icon: `<rect x="75" y="80" width="40" height="30" rx="6" fill="url(#brandGrad)"/><rect x="115" y="105" width="40" height="30" rx="6" fill="url(#brandGrad)"/><rect x="75" y="130" width="40" height="30" rx="6" fill="url(#brandGrad)"/>`
  },
  'coursera-plus': {
    brand: 'Coursera',
    title: 'COURSERA PLUS',
    tag: '7,000+ CERTIFIED COURSES',
    color1: '#0056D2',
    color2: '#2563EB',
    color3: '#06B6D4',
    icon: `<circle cx="120" cy="120" r="50" fill="none" stroke="url(#brandGrad)" stroke-width="12" filter="url(#glow)"/><circle cx="120" cy="120" r="22" fill="url(#brandGrad)"/>`
  },
  'semrush-pro': {
    brand: 'SEMrush',
    title: 'SEMRUSH PRO',
    tag: 'SEO • COMPETITOR AUDIT',
    color1: '#FF642D',
    color2: '#F97316',
    color3: '#EF4444',
    icon: `<path d="M80 150 C70 90 120 70 145 90 C165 110 140 155 110 145" stroke="url(#brandGrad)" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#glow)"/>`
  }
};

function generateSVG(slug, theme) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070b18" />
      <stop offset="50%" stop-color="#0c1126" />
      <stop offset="100%" stop-color="#04060f" />
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.color1}" />
      <stop offset="70%" stop-color="${theme.color2}" />
      <stop offset="100%" stop-color="${theme.color3}" />
    </linearGradient>
    <radialGradient id="ambientGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${theme.color1}" stop-opacity="0.28" />
      <stop offset="60%" stop-color="${theme.color2}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000" stop-opacity="0" />
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <pattern id="cyberGrid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="600" height="380" fill="url(#bgGrad)" />
  <rect width="600" height="380" fill="url(#cyberGrid)" />
  <circle cx="300" cy="180" r="220" fill="url(#ambientGlow)" />

  <!-- Glass Card Base -->
  <g transform="translate(60, 40)">
    <rect x="0" y="0" width="480" height="300" rx="24" fill="rgba(13, 18, 37, 0.65)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" />
    <rect x="1" y="1" width="478" height="30" rx="24" fill="rgba(255, 255, 255, 0.02)" />

    <!-- Brand Emblem Stage -->
    <g transform="translate(20, 30)">
      <circle cx="120" cy="120" r="85" fill="none" stroke="${theme.color1}" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="8,6" />
      <circle cx="120" cy="120" r="72" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
      ${theme.icon}
    </g>

    <!-- Product Text Hierarchy -->
    <g transform="translate(260, 65)">
      <!-- Eyebrow Tag -->
      <rect x="0" y="0" width="180" height="26" rx="13" fill="${theme.color1}18" stroke="${theme.color1}40" stroke-width="1" />
      <text x="90" y="17" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="${theme.color1}" text-anchor="middle" letter-spacing="1.5">${theme.brand.toUpperCase()}</text>

      <!-- Main Title -->
      <text x="0" y="60" font-family="Space Grotesk, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" letter-spacing="0.5">${theme.title}</text>

      <!-- Subtitle Tagline -->
      <text x="0" y="90" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="rgba(255,255,255,0.6)" letter-spacing="1">${theme.tag}</text>

      <!-- STAR BYTE Verified Badge -->
      <g transform="translate(0, 125)">
        <rect x="0" y="0" width="165" height="32" rx="8" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
        <circle cx="16" cy="16" r="4" fill="#10B981" />
        <text x="32" y="20" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#34D399" letter-spacing="0.5">INSTANT DELIVERY</text>
      </g>
    </g>

    <!-- Bottom Accent Line -->
    <rect x="40" y="270" width="400" height="2" fill="url(#brandGrad)" opacity="0.6" rx="1" />
  </g>
</svg>`;
}

async function main() {
  console.log('Generating 24 futuristic product SVG images...');
  for (const [slug, theme] of Object.entries(PRODUCT_THEMES)) {
    const filePath = path.join(outDir, `${slug}.svg`);
    const svgContent = generateSVG(slug, theme);
    fs.writeFileSync(filePath, svgContent, 'utf8');
  }
  console.log(`Generated ${Object.keys(PRODUCT_THEMES).length} SVGs in ${outDir}`);

  // Connect to MongoDB and update all products thumbnail URL
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('Connected to MongoDB. Updating product thumbnails...');

  for (const slug of Object.keys(PRODUCT_THEMES)) {
    await Product.updateOne(
      { slug },
      { $set: { thumbnail: `/products/${slug}.svg` } }
    );
  }
  console.log('All product thumbnails updated in database to /products/<slug>.svg!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
