import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKENS_FILE = path.join(__dirname, '../../tokens.json');

class TokenStore {
  constructor() {
    this.tokens = { google: {} };
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const data = await fs.readFile(TOKENS_FILE, 'utf-8');
      this.tokens = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, use default empty structure
        await this.save();
      } else {
        console.error('Error reading tokens file:', error);
      }
    }
    this.initialized = true;
  }

  async save() {
    try {
      await fs.writeFile(TOKENS_FILE, JSON.stringify(this.tokens, null, 2));
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  }

  async getGoogleTokens(accountId) {
    await this.initialize();
    return this.tokens.google[accountId] || null;
  }

  async getAllGoogleAccounts() {
    await this.initialize();
    return Object.entries(this.tokens.google).map(([id, data]) => ({
      id,
      email: data.email,
      isValid: !!data.access_token
    }));
  }

  async saveGoogleTokens(accountId, tokens, email) {
    await this.initialize();
    this.tokens.google[accountId] = {
      ...tokens,
      email,
      updatedAt: new Date().toISOString()
    };
    await this.save();
  }

  async removeGoogleAccount(accountId) {
    await this.initialize();
    delete this.tokens.google[accountId];
    await this.save();
  }
}

export default new TokenStore();
