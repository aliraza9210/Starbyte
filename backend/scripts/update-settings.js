require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

async function main() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('MongoDB connected.');

  // Update WhatsApp number
  await Settings.updateOne(
    { key: 'whatsappNumber' },
    { $set: { key: 'whatsappNumber', value: '+923327775418', label: 'WhatsApp Number', type: 'string', group: 'general' } },
    { upsert: true }
  );
  console.log('Settings: whatsappNumber set to +923327775418');

  // Verify and ensure Admin account
  let admin = await Admin.findOne({ email: 'admin@starbyte.io' });
  if (!admin) {
    admin = await Admin.create({
      name: 'STAR BYTE Admin',
      email: 'admin@starbyte.io',
      password: 'Admin@StarByte2024',
      role: 'superadmin',
      isActive: true
    });
    console.log('Admin account created: admin@starbyte.io / Admin@StarByte2024');
  } else {
    // Reset password cleanly
    const salt = await bcrypt.genSalt(12);
    admin.password = await bcrypt.hash('Admin@StarByte2024', salt);
    admin.isActive = true;
    await admin.save({ validateBeforeSave: false });
    console.log('Admin password confirmed/updated: admin@starbyte.io / Admin@StarByte2024');
  }

  // Check products count
  const Product = require('../models/Product');
  const count = await Product.countDocuments();
  console.log('Total Products in Database:', count);

  // Ensure isFeatured is set on flagship products so they appear on homepage!
  const featuredSlugs = [
    'google-ai-pro', 'canva-pro', 'chatgpt-plus', 'netflix-premium-4k',
    'super-grok', 'perplexity-enterprise-pro', 'coursera-plus', 'surfshark-vpn'
  ];
  await Product.updateMany({ slug: { $in: featuredSlugs } }, { $set: { isFeatured: true } });
  console.log('Flagship products set as featured.');

  console.log('\n--- VERIFICATION COMPLETE ---');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
