# OKpay

A simple, static web application for accepting Hive blockchain payments. Perfect for small businesses, freelancers, and merchants who want to accept HBD (Hive Backed Dollars) payments with minimal setup.

## 🚀 Live Demo
Visit: [menobass.github.io/okpay](https://menobass.github.io/okpay)

## 📱 How It Works

### For Customers (Paying)
1. **Scan QR Code** - Use your phone to scan the merchant's QR code
2. **Enter Amount** - The merchant account is pre-filled, just enter the payment amount in USD
3. **Confirm Payment** - Click "Pay with Keychain" to complete the transaction via Hive Keychain or HiveSigner

### For Merchants (Receiving)
1. **Generate QR Code** - Go to the QR Generator page and enter your Hive account name
2. **Print & Display** - Use the "Print QR" button to create stickers, signs, or business cards
3. **Accept Payments** - Customers scan your QR and pay instantly in HBD (1 USD = 1 HBD)

## ✨ Features

- **Account Validation** - Real-time verification of Hive account names with avatar preview
- **Unique Transaction Memos** - Each session generates a unique memo (`kcs-hpos-xxxx-xxxx`) for payment tracking
- **Multiple Payment Methods** - Supports Hive Keychain extension and HiveSigner web wallet
- **QR Code Generation** - Create printable QR codes that pre-fill payment forms
- **Print-Ready QR Codes** - Clean, professional print layout for business use
- **Mobile Responsive** - Works seamlessly on phones, tablets, and desktops
- **No Registration Required** - Pure static web app, no accounts or databases needed

## 🔧 Technical Details

### Payment Flow
1. Customer scans QR: `menobass.github.io/okpay?vendor=merchantname`
2. Payment page loads with merchant account pre-filled
3. Customer enters amount (treated as USD but paid in HBD)
4. Unique memo generated for transaction tracking
5. Payment submitted via Keychain API or deep link fallback

### Memo Format
Memos follow the pattern: `kcs-hpos-1234-5678` (8 random digits)

### Supported Wallets
- **Hive Keychain** (Browser extension - preferred)
- **HiveSigner** (Web-based fallback)

## 🛠 For Developers

### Project Structure
```
index.html          # Main payment interface
qr.html             # QR code generator
assets/
  css/styles.css    # Styling and branding
  applogo.webp      # OKpay logo
src/js/
  main.js           # Payment page logic
  qr.js             # QR generator logic
  utils.js          # Shared utilities (validation, APIs, etc.)
```

### Local Development
Since this is a static web app, you can serve it locally:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Or any static file server
```

Visit `http://localhost:8000` to test locally.

### API Dependencies
- **Hive RPC API** - `https://api.hive.blog` for account validation
- **Avatar Images** - `https://images.hive.blog/u/{account}/avatar/original`
- **QRious Library** - `https://unpkg.com/qrious@4.0.2/dist/qrious.min.js`

## 💼 Business Use Cases

- **Physical Stores** - Print QR codes for checkout counters
- **Farmers Markets** - Generate QR stickers for each vendor booth
- **Freelancers** - Share QR codes for quick project payments
- **Service Providers** - Add QR codes to invoices or business cards
- **Online Merchants** - Embed QR codes in websites or social media

## 🔒 Security & Privacy

- No personal data stored (stateless application)
- Memos are session-based and not logged
- All transactions happen directly on the Hive blockchain
- Open source code available for audit

## 📄 License

MIT License - feel free to use, modify, and distribute for personal or commercial use.

---

**Powered by the Hive Blockchain** 🍯
