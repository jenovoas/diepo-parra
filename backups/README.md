# Backups Directory

This directory contains encrypted database backups.

## ⚠️ IMPORTANT

- **DO NOT** commit unencrypted backups to Git
- All backups are encrypted with AES-256
- Backups are automatically pushed to GitHub
- Keep your `ENCRYPTION_KEY` safe and secure

## Files

- `*.db.enc` - Encrypted database backups
- `*.meta.json` - Backup metadata (timestamp, size, etc.)

## Usage

See main README for backup/restore instructions.
