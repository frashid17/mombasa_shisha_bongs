# Install PDFKit for Receipt Generation

The receipt generation feature requires `pdfkit` to be installed. Please run the following command:

```bash
npm install pdfkit @types/pdfkit
```

After installation, the receipt download will generate proper PDF files instead of HTML.

## Alternative: If Installation Fails

If you encounter permission issues, you can:

1. **Install manually in terminal:**
   ```bash
   cd /Users/fahimrashid/mombasa-shisha-bongs
   npm install pdfkit @types/pdfkit
   ```

2. **Or use sudo (not recommended for production):**
   ```bash
   sudo npm install pdfkit @types/pdfkit
   ```

3. **Or fix npm permissions:**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

After installation, restart your development server:
```bash
npm run dev
```

The receipt generation will then work properly and generate PDF files.

