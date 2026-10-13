# Expense Tracker — Setup Guide

A personal PWA expense tracker with AI receipt analysis and Google Sheets sync.

---

## What you'll need

| Thing | Cost | Notes |
|-------|------|-------|
| GitHub account | Free | github.com |
| Google account | Free | For Sheets sync |
| Claude API key | Pay-as-you-go | ~$0.01–0.03 per receipt scan |
| Google Cloud project | Free tier | For OAuth (no credit card for basic usage) |
| Node.js on your PC | Free | nodejs.org |

---

## Step 1 — Install Node.js on your PC

1. Go to **[nodejs.org](https://nodejs.org)** and download the LTS version
2. Install it (Next → Next → Finish)
3. Open **Terminal** (Mac) or **Command Prompt** / **PowerShell** (Windows)
4. Verify: `node --version` should print something like `v20.x.x`

---

## Step 2 — Get the code onto your PC

Download the project folder (or copy it from Claude). You should have a folder called `expense-tracker-react` with these files:

```
expense-tracker-react/
  src/
  public/
  .github/
  package.json
  vite.config.js
  index.html
  ...
```

In your terminal, navigate into it:

```bash
cd path/to/expense-tracker-react
npm install
```

This installs all dependencies (React, Vite, etc.) into a `node_modules` folder.

---

## Step 3 — Get your Claude API key

1. Go to **[console.anthropic.com](https://console.anthropic.com)**
2. Sign up / log in
3. Click **API Keys** in the left sidebar → **Create Key**
4. Copy the key (starts with `sk-ant-…`) — you'll paste it into the app's Settings later

> You'll pay per use, roughly $0.01–0.03 per receipt scan. You can set spend limits in the console.

---

## Step 4 — Set up Google OAuth (for Sheets sync)

This is the most involved step but only needs to be done once.

### 4a. Create a Google Cloud project

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**
2. Click the project dropdown at the top → **New Project**
3. Name it "Expense Tracker" → **Create**

### 4b. Enable the Sheets API

1. In your project, go to **APIs & Services → Library**
2. Search "Google Sheets API" → click it → **Enable**

### 4c. Create OAuth credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. If prompted to configure the consent screen:
   - Choose **External** → **Create**
   - Fill in App name ("Expense Tracker"), your email for support
   - Under **Scopes**, add: `../auth/spreadsheets`
   - Under **Test users**, add your own Gmail address
   - Save and continue
4. Back on Credentials → **+ Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. Name: "Expense Tracker Web"
7. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local testing)
   - `https://YOUR-GITHUB-USERNAME.github.io` (for the live app)
8. Click **Create** → copy the **Client ID** (ends in `.apps.googleusercontent.com`)

---

## Step 5 — Publish to GitHub Pages

### 5a. Create a GitHub repository

1. Go to **[github.com](https://github.com)** → **New repository**
2. Name it exactly: `expense-tracker`
3. Set to **Public** (required for free GitHub Pages)
4. **Don't** add README or .gitignore (the project already has them)
5. Click **Create repository**

### 5b. Push the code

In your terminal, inside the `expense-tracker-react` folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/expense-tracker.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### 5c. Enable GitHub Pages

1. In your repository on GitHub, go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will run automatically on every push to `main`

After ~2 minutes, your app will be live at:
**`https://YOUR-USERNAME.github.io/expense-tracker/`**

---

## Step 6 — Configure the app on your phone

1. Open the app URL in **Safari** (iPhone) or **Chrome** (Android)
2. Go to the **Settings tab** (⚙ gear icon)
3. Paste your **Claude API key** → tap Save
4. Paste your **Google Client ID** → tap Save
5. Tap **Connect** → sign in with your Google account
   - The app will create a "Expense Tracker" spreadsheet in your Google Drive automatically
6. Tap the share button in Safari → **"Add to Home Screen"** (iPhone) or Chrome's menu → **"Add to Home screen"** (Android)

The app is now installed as a PWA — it looks and works like a native app!

---

## Step 7 — Add it to more phones

Just open the same URL on another phone, go to Settings, enter the **same** Claude API key, **same** Google Client ID, and sign in with the **same** Google account. The app will sync to the same spreadsheet.

---

## Using the app

### Add an expense
- **AI mode**: Take/upload a photo of a receipt, or type a description like "Coffee at Starbucks €4.50". Claude will analyze it and fill in everything.
- **Manual mode**: Fill in description, amount, date, category yourself. You can also add individual line items.

### View expenses
- The **Expenses tab** shows all your expenses with category filters.
- Tap any expense to see the full details including itemized receipt breakdown.

### Monthly summary
- The **Summary tab** shows totals, averages, category breakdown bars, and your top 5 expenses for any month.

### Google Sheets
Your data is always in **Google Sheets** at `docs.google.com/spreadsheets` — you can view, filter, or export it from any device.

---

## Updating the app

To push code changes:

```bash
git add .
git commit -m "Your change description"
git push
```

GitHub Actions will automatically rebuild and redeploy.

---

## Costs summary

- **Hosting**: Free (GitHub Pages)
- **Google Sheets**: Free
- **Claude AI**: ~$0.01–0.03 per receipt scan (only when using AI mode)
- **Google OAuth**: Free for personal use (under the 100-user limit for test apps)

---

## Troubleshooting

**"Sign in" button does nothing**
→ Make sure you added `https://YOUR-USERNAME.github.io` (no trailing slash) to the Authorized JavaScript origins in Google Cloud.

**"AI analysis failed"**
→ Check your Claude API key in Settings. Make sure it starts with `sk-ant-`.

**App not updating after push**
→ Wait 2–3 minutes for GitHub Actions to finish. Check the Actions tab in your repo.

**PWA not showing "Add to Home Screen"**
→ Must be opened in Safari on iPhone, or Chrome on Android. The URL must be HTTPS (GitHub Pages is HTTPS by default).
