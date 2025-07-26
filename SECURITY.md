# Security Policy

## 🔐 Reporting a Vulnerability

If you discover a security vulnerability in **TubeCatalog**, please **do not open a public issue**.

Instead, report it privately via email:

📧 **luca@lucaberton.com**

We will respond as quickly as possible and coordinate with you to assess and address the issue.

---

## 🔄 Supported Versions

| Version | Supported |
|---------|-----------|
| `main`  | ✅         |
| others  | ❌         |

Only the latest version on the `main` branch is actively maintained and eligible for security patches.

---

## ✅ Security Best Practices (for Contributors)

If you're contributing to TubeCatalog, please:
- Avoid hardcoding sensitive credentials (e.g., API keys)
- Use `.env` for secrets, and **never commit them to Git**
- Sanitize and validate all external inputs
- Keep dependencies updated and reviewed
- Prefer secure-by-default libraries and methods

---

## 🛡️ Dependencies

TubeCatalog uses:
- OpenAI API (GPT-4)
- YouTube Data API v3
- `youtube-transcript` for transcript extraction

Each dependency is reviewed periodically for known vulnerabilities.

---

Thank you for helping keep TubeCatalog and its users secure!
