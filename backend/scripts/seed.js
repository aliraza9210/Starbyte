require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const { initSettings } = require('../controllers/settingsController');

const connectDB = async () => {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('MongoDB connected for seeding...');
};

const categories = [
  { name: 'AI & Productivity', slug: 'ai-productivity', icon: 'Brain', color: '#8b5cf6', sortOrder: 1 },
  { name: 'Creative & Design', slug: 'creative-design', icon: 'Palette', color: '#f59e0b', sortOrder: 2 },
  { name: 'Entertainment', slug: 'entertainment', icon: 'Film', color: '#ef4444', sortOrder: 3 },
  { name: 'VPN & Security', slug: 'vpn-security', icon: 'Shield', color: '#10b981', sortOrder: 4 },
  { name: 'Business Tools', slug: 'business-tools', icon: 'Briefcase', color: '#3b82f6', sortOrder: 5 },
  { name: 'Education', slug: 'education', icon: 'BookOpen', color: '#06b6d4', sortOrder: 6 },
  { name: 'Career', slug: 'career', icon: 'TrendingUp', color: '#f97316', sortOrder: 7 },
  { name: 'Developer Tools', slug: 'developer-tools', icon: 'Code', color: '#6366f1', sortOrder: 8 },
  { name: 'Email & Communication', slug: 'email-communication', icon: 'Mail', color: '#84cc16', sortOrder: 9 },
];

const getProducts = (categoryMap) => [
  {
    name: 'Google AI PRO',
    slug: 'google-ai-pro',
    shortDescription: 'Official Google Gemini AI Pro with deep reasoning, coding assistance, and 18 months validity.',
    description: `Google AI PRO gives you full access to Gemini AI Pro — Google's most advanced AI model. Experience deep reasoning, multimodal analysis, advanced coding assistance, and 1000 flow credits per month. Available as a Shared Family Account or Private Account with 18 months guarantee.`,
    category: categoryMap['ai-productivity'],
    price: 1.99,
    originalPrice: 9.99,
    currency: 'USD',
    duration: '18 Months',
    plans: [
      { name: 'Shared Family Account', price: 1.99, originalPrice: 9.99, duration: '18 Months', isDefault: true },
      { name: 'Private Account', price: 4.99, originalPrice: 19.99, duration: '18 Months' }
    ],
    features: [
      '18 Months Duration Guarantee',
      'Private & Shared Account Options',
      'Full Gemini AI Pro Features',
      '1000 Flow Credits per Month',
      'Antigravity Pro Access',
      'Gemini Pro Access',
      'NotebookLM Access',
      'Multimodal Reasoning & Analysis',
      'Instant WhatsApp Delivery & Activation'
    ],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: true,
    isActive: true,
    tags: ['google', 'gemini', 'ai', 'productivity', 'featured']
  },
  {
    name: 'Canva Pro',
    slug: 'canva-pro',
    shortDescription: 'Canva Pro Family Edition — 1 Year of unlimited premium design tools.',
    description: 'Get full access to Canva Pro for an entire year. Unlock premium templates, brand kits, background remover, magic resize, and millions of assets. Family edition allows multiple users.',
    category: categoryMap['creative-design'],
    price: 1.99,
    originalPrice: 12.99,
    currency: 'USD',
    duration: '1 Year',
    plans: [
      { name: 'Family Edition', price: 1.99, originalPrice: 12.99, duration: '1 Year', isDefault: true }
    ],
    features: [
      'Premium Templates',
      'Brand Kit',
      'Background Remover',
      'Magic Resize',
      'Millions of Assets',
      'Family Edition'
    ],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: true,
    isActive: true,
    tags: ['canva', 'design', 'creative', 'featured']
  },
  {
    name: 'Canva Business Panel',
    slug: 'canva-business-panel-1m',
    shortDescription: 'Canva Business Panel — 1 Month access.',
    description: 'Full Canva Business Panel access for 1 month. Manage your brand assets, collaborate with teams, and create stunning designs at scale.',
    category: categoryMap['creative-design'],
    price: 3.99,
    originalPrice: 24.99,
    currency: 'USD',
    duration: '1 Month',
    plans: [
      { name: '1 Month', price: 3.99, originalPrice: 24.99, duration: '1 Month', isDefault: true }
    ],
    features: ['Business Panel Access', 'Team Collaboration', 'Brand Management', '1 Month Duration'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['canva', 'business', 'design']
  },
  {
    name: 'Canva Business Panel — 5 Years',
    slug: 'canva-business-panel-5y',
    shortDescription: 'Canva Business Panel — 5 Years access at an unbeatable price.',
    description: 'Full Canva Business Panel access for 5 years. Long-term premium design capability at a fraction of the retail price.',
    category: categoryMap['creative-design'],
    price: 9.99,
    originalPrice: 149.99,
    currency: 'USD',
    duration: '5 Years',
    plans: [
      { name: '5 Years', price: 9.99, originalPrice: 149.99, duration: '5 Years', isDefault: true }
    ],
    features: ['Business Panel Access', 'Team Collaboration', 'Brand Management', '5 Year Duration'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: true,
    isActive: true,
    tags: ['canva', 'business', 'design', 'featured']
  },
  {
    name: 'CapCut Pro',
    slug: 'capcut-pro',
    shortDescription: 'CapCut Pro — 1 Month of premium video editing.',
    description: 'Unlock CapCut Pro for 1 month. Access AI-powered video editing tools, premium templates, no watermarks, and advanced effects.',
    category: categoryMap['creative-design'],
    price: 3.99,
    originalPrice: 9.99,
    currency: 'USD',
    duration: '1 Month',
    plans: [{ name: '1 Month', price: 3.99, originalPrice: 9.99, duration: '1 Month', isDefault: true }],
    features: ['AI Video Editing', 'Premium Templates', 'No Watermark', 'Advanced Effects', '1 Month Access'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['capcut', 'video', 'creative']
  },
  {
    name: 'ChatGPT Plus',
    slug: 'chatgpt-plus',
    shortDescription: 'ChatGPT Plus — 1 Month of GPT-4 access.',
    description: 'Get ChatGPT Plus for 1 month. Access GPT-4, faster response times, priority access during peak times, and early access to new features.',
    category: categoryMap['ai-productivity'],
    price: 7.99,
    originalPrice: 20.00,
    currency: 'USD',
    duration: '1 Month',
    plans: [{ name: '1 Month', price: 7.99, originalPrice: 20.00, duration: '1 Month', isDefault: true }],
    features: ['GPT-4 Access', 'Faster Responses', 'Priority Access', 'New Features Early Access', '1 Month Duration'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: true,
    isActive: true,
    tags: ['chatgpt', 'openai', 'ai', 'featured']
  },
  {
    name: 'ChatGPT Plus — Private Mail',
    slug: 'chatgpt-plus-private-mail',
    shortDescription: 'ChatGPT Plus with a private dedicated account — 4 Months with 3-month warranty.',
    description: 'Your own dedicated private ChatGPT Plus account with a unique mail. 4 months access with a 3-month warranty for complete peace of mind.',
    category: categoryMap['ai-productivity'],
    price: 39.90,
    originalPrice: 80.00,
    currency: 'USD',
    duration: '4 Months',
    warranty: '3 Months Warranty',
    plans: [{ name: 'Private Mail — 4 Months', price: 39.90, originalPrice: 80.00, duration: '4 Months', isDefault: true }],
    features: ['Dedicated Private Account', 'Unique Private Mail', 'GPT-4 Access', '4 Month Duration', '3 Month Warranty'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['chatgpt', 'openai', 'ai', 'private']
  },
  {
    name: 'Super Grok',
    slug: 'super-grok',
    shortDescription: 'Super Grok — 7 Days of xAI Grok premium access.',
    description: 'Experience xAI\'s Grok AI with super access for 7 days. Explore its unique capabilities and real-time knowledge.',
    category: categoryMap['ai-productivity'],
    price: 4.99,
    originalPrice: 8.99,
    currency: 'USD',
    duration: '7 Days',
    plans: [{ name: '7 Days', price: 4.99, originalPrice: 8.99, duration: '7 Days', isDefault: true }],
    features: ['Grok AI Access', 'Real-time Knowledge', 'Super Features', '7 Day Access'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['grok', 'xai', 'ai']
  },
  {
    name: 'Perplexity Enterprise Pro',
    slug: 'perplexity-enterprise-pro',
    shortDescription: 'Perplexity Enterprise Pro — 1 Month of advanced AI search.',
    description: 'Access Perplexity Enterprise Pro for 1 month. The most powerful AI-powered research and search tool with enterprise features.',
    category: categoryMap['ai-productivity'],
    price: 8.99,
    originalPrice: 40.00,
    currency: 'USD',
    duration: '1 Month',
    plans: [{ name: '1 Month', price: 8.99, originalPrice: 40.00, duration: '1 Month', isDefault: true }],
    features: ['Enterprise AI Search', 'Advanced Research Tools', 'No Ads', 'Priority Access', '1 Month Duration'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['perplexity', 'ai', 'search', 'enterprise']
  },
  {
    name: 'Leonardo AI',
    slug: 'leonardo-ai',
    shortDescription: 'Leonardo AI — 8,500 Credits for 1 Month of AI image generation.',
    description: 'Generate stunning AI images with Leonardo AI. Get 8,500 credits valid for 1 month — perfect for creators, designers, and marketers.',
    category: categoryMap['ai-productivity'],
    price: 4.99,
    originalPrice: 12.00,
    currency: 'USD',
    duration: '1 Month',
    plans: [{ name: '8,500 Credits — 1 Month', price: 4.99, originalPrice: 12.00, duration: '1 Month', isDefault: true }],
    features: ['8,500 Generation Credits', 'AI Image Generation', 'Premium Models', '1 Month Validity'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['leonardo', 'ai', 'image', 'creative']
  },
  {
    name: 'Google Veo 3 Ultra',
    slug: 'google-veo-3-ultra',
    shortDescription: 'Google Veo 3 Ultra — 1 Month of unlimited AI video generation.',
    description: 'Create cinematic AI-generated videos with Google Veo 3 Ultra. Unlimited video generation for 1 month — the future of AI video.',
    category: categoryMap['ai-productivity'],
    price: 8.99,
    originalPrice: 29.99,
    currency: 'USD',
    duration: '1 Month',
    plans: [{ name: '1 Month Unlimited', price: 8.99, originalPrice: 29.99, duration: '1 Month', isDefault: true }],
    features: ['Unlimited Video Generation', 'Cinematic Quality', 'Google Veo 3 Technology', '1 Month Access'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: true,
    isActive: true,
    tags: ['google', 'veo', 'ai', 'video', 'featured']
  },
  {
    name: 'Surfshark VPN',
    slug: 'surfshark-vpn',
    shortDescription: 'Surfshark VPN — 2 Months of premium VPN protection.',
    description: 'Protect your online privacy with Surfshark VPN for 2 months. Unlimited devices, 100+ countries, no logs policy.',
    category: categoryMap['vpn-security'],
    price: 4.99,
    originalPrice: 15.98,
    currency: 'USD',
    duration: '2 Months',
    plans: [{ name: '2 Months', price: 4.99, originalPrice: 15.98, duration: '2 Months', isDefault: true }],
    features: ['Unlimited Devices', '100+ Countries', 'No Logs Policy', 'Ad Blocker', '2 Month Access'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['surfshark', 'vpn', 'security', 'privacy']
  },
  {
    name: 'Surfshark Coupon',
    slug: 'surfshark-coupon',
    shortDescription: 'Surfshark Coupon — 2 Months discount coupon.',
    description: 'Get a Surfshark discount coupon valid for 2 months. Activate on your own Surfshark account.',
    category: categoryMap['vpn-security'],
    price: 2.99,
    originalPrice: 7.99,
    currency: 'USD',
    duration: '2 Months',
    plans: [{ name: '2 Months Coupon', price: 2.99, originalPrice: 7.99, duration: '2 Months', isDefault: true }],
    features: ['Discount Coupon', '2 Month Validity', 'Self-Activation'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['surfshark', 'vpn', 'coupon']
  },
  {
    name: 'NordVPN',
    slug: 'nordvpn',
    shortDescription: 'NordVPN — 3 Months of industry-leading VPN security.',
    description: 'Stay secure with NordVPN for 3 months. Double VPN, Onion Over VPN, CyberSec, and military-grade encryption.',
    category: categoryMap['vpn-security'],
    price: 4.99,
    originalPrice: 14.97,
    currency: 'USD',
    duration: '3 Months',
    plans: [{ name: '3 Months', price: 4.99, originalPrice: 14.97, duration: '3 Months', isDefault: true }],
    features: ['Double VPN', 'CyberSec Protection', 'Military-Grade Encryption', '5400+ Servers', '3 Month Access'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['nordvpn', 'vpn', 'security']
  },
  {
    name: 'LinkedIn Career Premium',
    slug: 'linkedin-career-premium',
    shortDescription: 'LinkedIn Career Premium — 3 Months to accelerate your career.',
    description: 'Unlock LinkedIn Career Premium for 3 months. Access InMail credits, see who viewed your profile, and get AI-powered application assistance.',
    category: categoryMap['career'],
    price: 3.99,
    originalPrice: 89.97,
    currency: 'USD',
    duration: '3 Months',
    plans: [{ name: '3 Months Career Premium', price: 3.99, originalPrice: 89.97, duration: '3 Months', isDefault: true }],
    features: ['InMail Credits', 'Profile Viewers', 'AI Application Assistance', 'Job Insights', '3 Month Access'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['linkedin', 'career', 'premium', 'professional']
  },
  {
    name: 'Notion Business',
    slug: 'notion-business',
    shortDescription: 'Notion Business — 1 Month of collaborative workspace power.',
    description: 'Access Notion Business for 1 month. Unlimited blocks, advanced permissions, analytics, and team management features.',
    category: categoryMap['business-tools'],
    price: 3.49,
    originalPrice: 16.00,
    currency: 'USD',
    duration: '1 Month',
    plans: [{ name: '1 Month', price: 3.49, originalPrice: 16.00, duration: '1 Month', isDefault: true }],
    features: ['Unlimited Blocks', 'Advanced Permissions', 'Analytics', 'Team Management', '1 Month Access'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['notion', 'productivity', 'business']
  },
  {
    name: 'Netflix Premium 4K',
    slug: 'netflix-premium-4k',
    shortDescription: 'Netflix Premium — Full Private Account with 4K Ultra HD, 1 Month.',
    description: 'Stream everything on Netflix with a full private 4K Ultra HD account for 1 month. Enjoy the complete Netflix library in stunning quality.',
    category: categoryMap['entertainment'],
    price: 3.99,
    originalPrice: 22.99,
    currency: 'USD',
    duration: '1 Month',
    plans: [{ name: 'Full Private — 4K Ultra HD', price: 3.99, originalPrice: 22.99, duration: '1 Month', isDefault: true }],
    features: ['4K Ultra HD', 'Full Private Account', 'All Content Access', 'Multiple Screens', '1 Month Duration'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: true,
    isActive: true,
    tags: ['netflix', 'streaming', 'entertainment', 'featured']
  },
  {
    name: 'Prime Video',
    slug: 'prime-video',
    shortDescription: 'Amazon Prime Video — 3 Months of premium streaming.',
    description: 'Access Amazon Prime Video for 3 months. Enjoy thousands of movies and TV shows including Prime Originals.',
    category: categoryMap['entertainment'],
    price: 3.99,
    originalPrice: 8.99,
    currency: 'USD',
    duration: '3 Months',
    plans: [{ name: '3 Months', price: 3.99, originalPrice: 8.99, duration: '3 Months', isDefault: true }],
    features: ['Full Library Access', 'Prime Originals', '4K Streaming', 'Downloads', '3 Month Duration'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['prime', 'amazon', 'streaming', 'entertainment']
  },
  {
    name: 'Headspace Premium',
    slug: 'headspace-premium',
    shortDescription: 'Headspace Premium — 4 Months of guided meditation and mindfulness.',
    description: 'Improve your mental wellness with Headspace Premium for 4 months. Guided meditations, sleep sounds, and focus music.',
    category: categoryMap['education'],
    price: 3.49,
    originalPrice: 51.96,
    currency: 'USD',
    duration: '4 Months',
    plans: [{ name: '4 Months', price: 3.49, originalPrice: 51.96, duration: '4 Months', isDefault: true }],
    features: ['Guided Meditations', 'Sleep Sounds', 'Focus Music', 'Mindfulness Courses', '4 Month Access'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['headspace', 'meditation', 'wellness', 'mental-health']
  },
  {
    name: 'Outlook Mail',
    slug: 'outlook-mail',
    shortDescription: 'Microsoft Outlook Mail account — Per Mail pricing.',
    description: 'Get a fresh Microsoft Outlook email account. Perfect for professional use, app registrations, or dedicated accounts.',
    category: categoryMap['email-communication'],
    price: 0.49,
    originalPrice: 1.99,
    currency: 'USD',
    duration: 'Lifetime',
    plans: [{ name: 'Per Mail', price: 0.49, originalPrice: 1.99, duration: 'Lifetime', isDefault: true }],
    features: ['Fresh Outlook Account', 'Professional Email', 'Microsoft Integration', 'Per Mail Pricing'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['outlook', 'microsoft', 'email', 'communication']
  },
  {
    name: 'YouTube Premium',
    slug: 'youtube-premium',
    shortDescription: 'YouTube Premium — 3 Months ad-free viewing and music.',
    description: 'Enjoy YouTube without ads for 3 months. Includes YouTube Music, offline downloads, and background play.',
    category: categoryMap['entertainment'],
    price: 6.99,
    originalPrice: 20.97,
    currency: 'USD',
    duration: '3 Months',
    plans: [{ name: '3 Months', price: 6.99, originalPrice: 20.97, duration: '3 Months', isDefault: true }],
    features: ['Ad-free YouTube', 'YouTube Music', 'Offline Downloads', 'Background Play', '3 Month Duration'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['youtube', 'google', 'streaming', 'music', 'entertainment']
  },
  {
    name: 'Replit Core',
    slug: 'replit-core',
    shortDescription: 'Replit Core — Full developer power in the cloud.',
    description: 'Access Replit Core and code, build, and deploy from anywhere. Includes Ghostwriter AI, boosted resources, and private repls.',
    category: categoryMap['developer-tools'],
    price: 9.99,
    originalPrice: 25.00,
    currency: 'USD',
    duration: '1 Month',
    plans: [{ name: '1 Month', price: 9.99, originalPrice: 25.00, duration: '1 Month', isDefault: true }],
    features: ['Ghostwriter AI', 'Boosted Resources', 'Private Repls', 'Cloud IDE', '1 Month Access'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['replit', 'developer', 'coding', 'cloud']
  },
  {
    name: 'Coursera Plus',
    slug: 'coursera-plus',
    shortDescription: 'Coursera Plus — 12 Months of unlimited learning from top universities.',
    description: 'Access 7,000+ courses, certificates, and specializations from top universities and companies on Coursera for 12 months.',
    category: categoryMap['education'],
    price: 3.99,
    originalPrice: 59.00,
    currency: 'USD',
    duration: '12 Months',
    plans: [{ name: '12 Months', price: 3.99, originalPrice: 59.00, duration: '12 Months', isDefault: true }],
    features: ['7,000+ Courses', 'University Certificates', 'Professional Certificates', 'Unlimited Access', '12 Month Duration'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: true,
    isActive: true,
    tags: ['coursera', 'education', 'learning', 'featured']
  },
  {
    name: 'SEMrush Pro',
    slug: 'semrush-pro',
    shortDescription: 'SEMrush Pro — 1 Month of professional SEO and marketing tools.',
    description: 'Access SEMrush Pro for 1 month. Keyword research, competitor analysis, site audits, backlink analysis, and more.',
    category: categoryMap['business-tools'],
    price: 3.99,
    originalPrice: 119.95,
    currency: 'USD',
    duration: '1 Month',
    plans: [{ name: '1 Month', price: 3.99, originalPrice: 119.95, duration: '1 Month', isDefault: true }],
    features: ['Keyword Research', 'Competitor Analysis', 'Site Audits', 'Backlink Analysis', 'Rank Tracking', '1 Month Access'],
    deliveryMethod: 'whatsapp',
    stockStatus: 'in_stock',
    isFeatured: false,
    isActive: true,
    tags: ['semrush', 'seo', 'marketing', 'business']
  }
];

const seed = async () => {
  try {
    await connectDB();

    console.log('\n--- Seeding STAR BYTE Database ---\n');

    // Create admin
    let existingAdmin = await Admin.findOne({
      $or: [{ email: 'astrabytepk@gmail.com' }, { email: 'admin@starbyte.io' }]
    });
    if (!existingAdmin) {
      await Admin.create({
        name: 'STAR BYTE Admin',
        email: 'astrabytepk@gmail.com',
        password: 'Admin@StarByte2024',
        role: 'superadmin'
      });
      console.log('Admin created: astrabytepk@gmail.com / Admin@StarByte2024');
    } else {
      existingAdmin.email = 'astrabytepk@gmail.com';
      await existingAdmin.save();
      console.log('Admin verified: astrabytepk@gmail.com');
    }

    // Create categories
    const categoryMap = {};
    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        const created = await Category.create(cat);
        categoryMap[cat.slug] = created._id;
        console.log(`Category created: ${cat.name}`);
      } else {
        categoryMap[cat.slug] = existing._id;
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    // Create products
    const products = getProducts(categoryMap);
    let created = 0;
    let skipped = 0;

    for (const prod of products) {
      if (!prod.thumbnail) {
        prod.thumbnail = `/products/${prod.slug}.svg`;
      }
      const existing = await Product.findOne({ slug: prod.slug });
      if (!existing) {
        await Product.create(prod);
        console.log(`Product created: ${prod.name}`);
        created++;
      } else {
        console.log(`Product already exists: ${prod.name}`);
        skipped++;
      }
    }

    // Initialize settings
    await initSettings();
    await Settings.updateOne(
      { key: 'supportEmail' },
      { $set: { value: 'astrabytepk@gmail.com', label: 'Support Email', type: 'string', group: 'general' } },
      { upsert: true }
    );
    await Settings.updateOne(
      { key: 'whatsappNumber' },
      { $set: { value: '+923327775418', label: 'WhatsApp Number', type: 'string', group: 'general' } },
      { upsert: true }
    );

    console.log(`\n--- Seed Complete ---`);
    console.log(`Products created: ${created}, skipped: ${skipped}`);
    console.log(`\nAdmin Login:`);
    console.log(`  Email: astrabytepk@gmail.com (or username 'admin')`);
    console.log(`  Password: Admin@StarByte2024`);
    console.log(`\nChange admin password after first login!\n`);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
