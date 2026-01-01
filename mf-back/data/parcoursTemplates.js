const fs = require('node:fs');
const path = require('node:path');

const templatesDir = process.env.PARCOURS_TEMPLATE_PATH || path.resolve(__dirname, 'parcours_templates');

const intentToTemplate = {
  launch_nft: 'nft_track.json',
  token_launch: 'nft_track.json',
  launchpad_readiness: 'demo_day_track.json',
  investor_pitch: 'pitch_track.json',
  demo_day: 'demo_day_track.json',
  dao_audit: 'dao_track.json',
  launch_dao: 'dao_track.json',
  web3_legal: 'web3legal_track.json',
  growth_strategy: 'demo_day_track.json',
  reflection_phase: 'web3legal_track.json',
  product_build: 'demo_day_track.json',
  user_onboarding: 'demo_day_track.json',
  default: 'demo_day_track.json'
};

function readTemplateFile(fileName) {
  const filePath = path.join(templatesDir, fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to parse parcours template', { fileName, error: error.message });
    return null;
  }
}

function listTemplates() {
  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  return fs.readdirSync(templatesDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
      templateId: path.basename(file, '.json'),
      fileName: file,
      content: readTemplateFile(file)
    }));
}

function loadTemplateForIntent(intent) {
  const templateFile = intentToTemplate[intent] || intentToTemplate.default;
  const templateContent = readTemplateFile(templateFile);
  if (!templateContent) {
    return null;
  }

  return {
    templateId: path.basename(templateFile, '.json'),
    fileName: templateFile,
    content: templateContent
  };
}

module.exports = {
  intentToTemplate,
  listTemplates,
  loadTemplateForIntent
};
