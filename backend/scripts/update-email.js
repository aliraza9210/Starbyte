require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('MongoDB connected.');

  const Settings = require('../models/Settings');
  const Admin = require('../models/Admin');

  // Update supportEmail in Settings
  await Settings.updateOne(
    { key: 'supportEmail' },
    { $set: { key: 'supportEmail', value: 'astrabytepk@gmail.com', label: 'Support Email', type: 'string', group: 'general' } },
    { upsert: true }
  );
  console.log('Settings supportEmail updated to astrabytepk@gmail.com');

  // Update Admin email
  const adminUpdate = await Admin.updateMany(
    { $or: [{ role: 'superadmin' }, { email: 'admin@starbyte.io' }] },
    { $set: { email: 'astrabytepk@gmail.com' } }
  );
  console.log('Admin accounts updated:', adminUpdate.modifiedCount);

  const curSettings = await Settings.find({});
  console.log('Current settings:', curSettings.map(s => ({ key: s.key, value: s.value })));

  const curAdmins = await Admin.find({});
  console.log('Current admins:', curAdmins.map(a => ({ name: a.name, email: a.email, role: a.role })));

  process.exit(0);
}

main().catch(err => {
  console.error('Error updating email:', err);
  process.exit(1);
});
