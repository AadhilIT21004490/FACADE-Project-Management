# 🏛️ Facade - Project Management Platform
> Next-generation SaaS platform for client project orchestration, financial tracking, and encrypted credential management. 

Facade is a powerful, glassmorphism-styled project management application built on Next.js. It empowers agencies and freelancers to fully track their project lifecycles, ledger payments, host documents, and securely store sensitive client credentials in an AES-256-GCM encrypted vault.

## ✨ Features
- **📊 Global Dashboard**: Real-time metrics on revenue, active projects, and system-wide activity logging.
- **📂 Unified Project Library**: Dynamic "Grid" and "List" views of all active, completed, or on-hold projects mapped with linear progress indicators.
- **💰 Financial Ledgers**: Automated tracking of contract values, partial payments, and overdue balances.
- **🛡️ Secure Credential Vault**: End-to-end AES-256-GCM encryption for storing Client AWS, GitHub, or server credentials. Keys are strictly decrypted on-demand via the server to ensure maximum security. 
- **☁️ Cloud Document Hosting**: Built-in integration with Cloudinary for fast, reliable document hosting and sharing.
- **🚀 Time-To-Live (TTL) Notifications**: Automated MongoDB TTL indexing to natively prune 30-day old records without impacting server thread memory.

## 🛠️ Technology Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Custom Glassmorphism Tokens & Modals)
- **Database:** MongoDB Atlas (Mongoose)
- **Authentication:** NextAuth v5 (Auth.js) - JWT + Credentials Strategy
- **Encryption:** Node.js native `crypto` module (AES-256-GCM / Base64 Keys)
- **File Storage:** Cloudinary API

## 📋 Environment Variables
Create a `.env.local` directly in the root directory and configure the following required secret keys:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<USER>:<PASS>@cluster.mongodb.net/facade

# NextAuth v5 Secret & URL (Run `npx auth secret` to generate an automated secure key)
AUTH_SECRET="your-32-byte-secret"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary Integration (Fetch these from your Cloudinary Developer console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AES-256-GCM Vault Encryption Key (Must be EXACTLY 32 Bytes encoded in Base64)
# Tip: Generate by running `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` in your terminal.
VAULT_ENCRYPTION_KEY="your-generated-base64-key"
```

## 🚀 Getting Started
```bash
# 1. Clone the repository
git clone https://github.com/AadhilIT21004490/FACADE-Project-Management.git

# 2. Navigate into your directory
cd "FACADE-Project-Management"

# 3. Install NPM dependencies
npm install

# 4. Start the development server
npm run dev
```

Open `http://localhost:3000` with your browser to see the result.

## 🔐 Managing Access / Security Notice
This application utilizes internal identity management. Root accounts should be tightly controlled as the DB credentials allow decrypting the Vault. Never commit your `.env.local` variables directly to version control.
