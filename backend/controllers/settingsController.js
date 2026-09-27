const Settings = require('../models/Settings');

const DEFAULT_SETTINGS = [
  { key: 'storeName', value: 'STAR BYTE', label: 'Store Name', type: 'string', group: 'general' },
  { key: 'tagline', value: 'Your Premium Subscription Hub', label: 'Tagline', type: 'string', group: 'general' },
  { key: 'supportEmail', value: 'astrabytepk@gmail.com', label: 'Support Email', type: 'string', group: 'general' },
  { key: 'whatsappNumber', value: '+923327775418', label: 'WhatsApp Number', type: 'string', group: 'general' },
  { key: 'currency', value: 'USD', label: 'Currency', type: 'string', group: 'general' },
  { key: 'footerText', value: '© 2024 STAR BYTE. All rights reserved.', label: 'Footer Text', type: 'string', group: 'general' },
  { key: 'announcement', value: '', label: 'Announcement Bar Text', type: 'string', group: 'general' },
  { key: 'instagramUrl', value: '', label: 'Instagram URL', type: 'string', group: 'social' },
  { key: 'twitterUrl', value: '', label: 'Twitter/X URL', type: 'string', group: 'social' },
  { key: 'facebookUrl', value: '', label: 'Facebook URL', type: 'string', group: 'social' },
  { key: 'telegramUrl', value: '', label: 'Telegram URL', type: 'string', group: 'social' },
  { key: 'orderAutoConfirm', value: false, label: 'Auto-confirm WhatsApp Orders', type: 'boolean', group: 'orders' },
  { key: 'minOrderAmount', value: 0, label: 'Minimum Order Amount', type: 'number', group: 'orders' },
];

// @desc  Get all public settings
// @route GET /api/settings
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.find({});
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });

    // Merge with defaults for any missing keys
    DEFAULT_SETTINGS.forEach(d => {
      if (settingsMap[d.key] === undefined) {
        settingsMap[d.key] = d.value;
      }
    });

    // Never expose secret keys
    delete settingsMap.paymentSecretKey;

    res.json({ success: true, data: settingsMap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
};

// @desc  Get all settings for admin
// @route GET /api/admin/settings
const adminGetSettings = async (req, res) => {
  try {
    const settings = await Settings.find({}).sort('group key');
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
};

// @desc  Update settings
// @route PUT /api/admin/settings
const adminUpdateSettings = async (req, res) => {
  try {
    const updates = req.body;

    // Never allow payment secrets to be updated via settings API
    const forbidden = ['paymentSecretKey', 'authSecret', 'adminSecret'];
    for (const key of forbidden) {
      delete updates[key];
    }

    const operations = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value, updatedAt: new Date() } },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await Settings.bulkWrite(operations);
    }

    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};

// @desc  Initialize default settings
const initSettings = async () => {
  try {
    for (const setting of DEFAULT_SETTINGS) {
      await Settings.updateOne(
        { key: setting.key },
        { $setOnInsert: setting },
        { upsert: true }
      );
    }
    console.log('Settings initialized.');
  } catch (error) {
    console.error('Settings init error:', error);
  }
};

module.exports = { getSettings, adminGetSettings, adminUpdateSettings, initSettings };
