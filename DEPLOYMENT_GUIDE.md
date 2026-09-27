# STAR BYTE — Production Deployment Guide

This guide explains how to deploy **STAR BYTE** completely free using:
1. **MongoDB Atlas** (Free Cloud Database)
2. **Render.com** (Free 24/7 Node.js Backend API)
3. **Vercel** (Free Fast Frontend CDN)

---

## STEP 1: Set Up Free MongoDB Atlas

1. Go to **[mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)** and sign up / log in.
2. Click **Create a Deployment** -> Select **M0 Free Tier** (AWS, choose closest region like Frankfurt or Singapore).
3. Under **Security Quickstart**:
   - **Username**: e.g., `starbyte_admin`
   - **Password**: Create a secure password (copy it down).
   - Click **Create Database User**.
4. Under **Network Access**:
   - Click **Add IP Address** -> Choose **Allow Access from Anywhere (`0.0.0.0/0`)** -> Click **Confirm**. *(Required so Render/Vercel can connect)*.
5. In your Database dashboard, click **Connect** -> **Drivers** (Node.js).
6. Copy the connection string. It looks like:
   ```
   mongodb+srv://starbyte_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
   Replace `<password>` with your actual password, and add `/starbyte` before `?`:
   ```
   mongodb+srv://starbyte_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/starbyte?retryWrites=true&w=majority
   ```

---

## STEP 2: Seed the Atlas Database (Load All 24 Products & Admin)

Open terminal in `d:/starbyte/backend` and run:

```bash
# Set temporary DATABASE_URL to your Atlas URL
node -e "
process.env.DATABASE_URL='YOUR_MONGODB_ATLAS_URI';
require('./scripts/seed.js');
"
```
Or temporarily paste your Atlas URL into `backend/.env` under `DATABASE_URL` and run:
```bash
npm run seed
```
This loads:
- All **24 subscription products** (Google AI Pro, ChatGPT Plus, Canva Pro, etc.)
- All **Categories**
- **Admin account**:
  - Email: `astrabytepk@gmail.com`
  - Password: `Admin@StarByte2024`
- Store settings (`astrabytepk@gmail.com` & `+923327775418`)

---

## STEP 3: Deploy Backend on Render (Free)

1. Push your repository to **GitHub** (private or public).
2. Go to **[render.com](https://render.com)** and sign in with GitHub.
3. Click **New +** -> **Web Service** -> Connect your GitHub repo.
4. Configure the service:
   - **Name**: `starbyte-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Environment Variables** (or Advanced -> Environment Variables) and add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Your MongoDB Atlas connection string |
   | `AUTH_SECRET` | Any random 32-character string |
   | `ADMIN_SECRET` | Any random 32-character string |
   | `FRONTEND_URL` | `https://*.vercel.app` (or your Vercel URL once created) |
   | `WHATSAPP_NUMBER` | `+923327775418` |
6. Click **Deploy Web Service**.
7. Once deployed, Render will give you a live URL, e.g.:
   `https://starbyte-backend.onrender.com`
   Test it in your browser: `https://starbyte-backend.onrender.com/api/health` — it should return `{ "success": true, "message": "STAR BYTE API is running" }`.

---

## STEP 4: Deploy Frontend on Vercel (Free)

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New...** -> **Project** -> Select your repository.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit -> Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   | Name | Value |
   |---|---|
   | `VITE_API_URL` | Your Render Backend URL (e.g. `https://starbyte-backend.onrender.com`) |
5. Click **Deploy**!

Within 60 seconds, your site will be live at:
`https://your-project.vercel.app`

---

## Admin Login on Live Site
- URL: `https://your-project.vercel.app/admin/login`
- Email: `astrabytepk@gmail.com` (or username `admin`)
- Password: `Admin@StarByte2024`
- Windows Hello / Fingerprint sensor login is supported out-of-the-box!
