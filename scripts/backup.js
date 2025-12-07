#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates encrypted backup of SQLite database and pushes to GitHub
 * 
 * Usage:
 *   npm run backup
 *   npm run backup:restore <backup-file>
 */

// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    console.error('❌ Error: BACKUP_ENCRYPTION_KEY or ENCRYPTION_KEY must be set in .env file');
    process.exit(1);
}

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Encrypt file
 */
function encryptFile(inputPath, outputPath) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    // Write IV to the beginning of the file
    output.write(iv);

    input.pipe(cipher).pipe(output);

    return new Promise((resolve, reject) => {
        output.on('finish', resolve);
        output.on('error', reject);
    });
}

/**
 * Decrypt file
 */
function decryptFile(inputPath, outputPath) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    // Read IV from the beginning of the file
    input.once('readable', () => {
        const iv = input.read(16);
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        input.pipe(decipher).pipe(output);
    });

    return new Promise((resolve, reject) => {
        output.on('finish', resolve);
        output.on('error', reject);
    });
}

/**
 * Create backup
 */
async function createBackup() {
    console.log('🔄 Creating database backup...');

    if (!fs.existsSync(DB_PATH)) {
        console.error(`❌ Database not found at: ${DB_PATH}`);
        process.exit(1);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}.db`;
    const encryptedName = `${backupName}.enc`;

    const tempPath = path.join(BACKUP_DIR, backupName);
    const encryptedPath = path.join(BACKUP_DIR, encryptedName);

    try {
        // Copy database
        fs.copyFileSync(DB_PATH, tempPath);
        console.log(`✅ Database copied to: ${tempPath}`);

        // Encrypt backup
        await encryptFile(tempPath, encryptedPath);
        console.log(`🔒 Backup encrypted: ${encryptedName}`);

        // Remove unencrypted copy
        fs.unlinkSync(tempPath);

        // Get file size
        const stats = fs.statSync(encryptedPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`📦 Backup size: ${sizeMB} MB`);

        // Create metadata file
        const metadata = {
            timestamp: new Date().toISOString(),
            filename: encryptedName,
            size: stats.size,
            dbPath: DB_PATH,
        };
        fs.writeFileSync(
            path.join(BACKUP_DIR, `${backupName}.meta.json`),
            JSON.stringify(metadata, null, 2)
        );

        // Push to GitHub
        await pushToGitHub(encryptedName);

        console.log('✅ Backup completed successfully!');
        console.log(`📁 Backup location: ${encryptedPath}`);

        // Clean old backups (keep last 30)
        cleanOldBackups();

        return encryptedPath;
    } catch (error) {
        console.error('❌ Backup failed:', error);
        // Clean up on error
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        if (fs.existsSync(encryptedPath)) fs.unlinkSync(encryptedPath);
        process.exit(1);
    }
}

/**
 * Restore backup
 */
async function restoreBackup(backupFile) {
    console.log(`🔄 Restoring backup from: ${backupFile}`);

    const encryptedPath = path.join(BACKUP_DIR, backupFile);

    if (!fs.existsSync(encryptedPath)) {
        console.error(`❌ Backup file not found: ${encryptedPath}`);
        process.exit(1);
    }

    const tempPath = path.join(BACKUP_DIR, 'temp-restore.db');

    try {
        // Decrypt backup
        await decryptFile(encryptedPath, tempPath);
        console.log('🔓 Backup decrypted');

        // Backup current database
        if (fs.existsSync(DB_PATH)) {
            const currentBackup = `${DB_PATH}.before-restore`;
            fs.copyFileSync(DB_PATH, currentBackup);
            console.log(`💾 Current database backed up to: ${currentBackup}`);
        }

        // Restore
        fs.copyFileSync(tempPath, DB_PATH);
        fs.unlinkSync(tempPath);

        console.log('✅ Database restored successfully!');
        console.log('⚠️  Remember to restart your application');
    } catch (error) {
        console.error('❌ Restore failed:', error);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        process.exit(1);
    }
}

/**
 * Push backup to GitHub
 */
async function pushToGitHub(filename) {
    try {
        console.log('📤 Pushing backup to GitHub...');

        // Check if git is initialized
        if (!fs.existsSync(path.join(__dirname, '../.git'))) {
            console.log('⚠️  Git not initialized, skipping GitHub push');
            return;
        }

        // Add backup file
        execSync(`git add backups/${filename}`, { cwd: path.join(__dirname, '..') });
        execSync(`git add backups/${filename.replace('.enc', '.meta.json')}`, { cwd: path.join(__dirname, '..') });

        // Commit
        execSync(`git commit -m "chore: automated backup ${new Date().toISOString()}"`, {
            cwd: path.join(__dirname, '..'),
        });

        // Push to GitHub
        execSync('git push origin main', { cwd: path.join(__dirname, '..') });

        console.log('✅ Backup pushed to GitHub');
    } catch (error) {
        console.warn('⚠️  Failed to push to GitHub:', error.message);
        console.log('💡 Backup saved locally, you can push manually later');
    }
}

/**
 * Clean old backups (keep last 30)
 */
function cleanOldBackups() {
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.db.enc'))
        .map(f => ({
            name: f,
            path: path.join(BACKUP_DIR, f),
            time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

    if (files.length > 30) {
        console.log(`🧹 Cleaning old backups (keeping last 30)...`);
        files.slice(30).forEach(file => {
            fs.unlinkSync(file.path);
            // Also remove metadata
            const metaPath = file.path.replace('.db.enc', '.db.meta.json');
            if (fs.existsSync(metaPath)) {
                fs.unlinkSync(metaPath);
            }
            console.log(`🗑️  Removed: ${file.name}`);
        });
    }
}

/**
 * List backups
 */
function listBackups() {
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.db.enc'))
        .map(f => {
            const stats = fs.statSync(path.join(BACKUP_DIR, f));
            const metaPath = path.join(BACKUP_DIR, f.replace('.db.enc', '.db.meta.json'));
            let metadata = {};
            if (fs.existsSync(metaPath)) {
                metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            }
            return {
                name: f,
                size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
                date: stats.mtime.toLocaleString(),
                ...metadata,
            };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('\n📋 Available backups:\n');
    files.forEach((file, i) => {
        console.log(`${i + 1}. ${file.name}`);
        console.log(`   Date: ${file.date}`);
        console.log(`   Size: ${file.size}\n`);
    });
}

// CLI
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
    case 'create':
    case undefined:
        createBackup();
        break;
    case 'restore':
        if (!arg) {
            console.error('❌ Usage: npm run backup:restore <backup-file>');
            process.exit(1);
        }
        restoreBackup(arg);
        break;
    case 'list':
        listBackups();
        break;
    default:
        console.log('Usage:');
        console.log('  npm run backup          - Create new backup');
        console.log('  npm run backup:restore <file> - Restore from backup');
        console.log('  npm run backup:list     - List available backups');
        process.exit(1);
}
