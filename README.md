# OKpay

Simple two-page static point-of-sale helper for the Hive blockchain.

Pages:
- `index.html` – Main payment interface (enter receiving account + USD amount -> deep link to Keychain / fallback HiveSigner).
- `qr.html` – Generates a QR code that pre-fills the main page with receiving account and optional amount.

## Features (MVP)
- Auto unique memo per page load: `okpay-<timestamp>-<rand>`
- Receiving account validation via Hive RPC + avatar preview (`https://images.hive.blog/u/<account>/avatar`)
- Basic 1:1 USD → HBD assumption (TODO: real rate fetch)
- Hive Keychain deep link attempt; fallback to HiveSigner if protocol not handled
- QR generation via QRious CDN

## TODO / Roadmap
- Fetch real HBD/USD rate (Coingecko API or internal feed) and display conversion
- Validate account existence via Hive API before enabling Pay
- Improve memo strategy (optionally merchant-defined prefixes)
- Robust error/status messaging UI
- Add copy payment link + share options
- Optionally embed memo into QR encoded link for reconciliation
- Dark/light theme toggle

## Development
Pure static files. You can serve locally via any static server or VS Code Live Server extension.

## Security Notes
- Always confirm the receiving account visually.
- Memo randomness is simple; if used for reconciliation, ensure server-side logging when adding backend.

## License
MIT (add LICENSE file if needed)
