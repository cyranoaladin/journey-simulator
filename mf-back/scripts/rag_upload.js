/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');
const FormData = require('form-data');

const DEFAULT_ENDPOINT = process.env.RAG_UPLOAD_ENDPOINT || 'http://localhost:3000/admin/rag/upload';
const API_KEY = process.env.ADMIN_API_KEY || 'admin-key';

async function main() {
  const filePath = process.argv[2] || path.resolve(__dirname, '../data/rag-documents/tokenomics_model.txt');

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const form = new FormData();
  form.append('document', fs.createReadStream(filePath));

  try {
    const response = await axios.post(DEFAULT_ENDPOINT, form, {
      headers: {
        ...form.getHeaders(),
        'x-api-key': API_KEY
      }
    });

    console.log('✅ RAG upload success');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ RAG upload failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Body:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

main();
