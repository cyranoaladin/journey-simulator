/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

describe('parcoursTemplates helper', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    delete process.env.PARCOURS_TEMPLATE_PATH;
    jest.resetModules();
  });

  it('returns the expected NFT template from the default dataset', () => {
    const { loadTemplateForIntent } = require('../data/parcoursTemplates');
    const template = loadTemplateForIntent('launch_nft');
    const sequence = template?.content?.phases || template?.content?.stages || template?.content?.steps;

    expect(template?.templateId).toBe('nft_track');
    expect(Array.isArray(sequence)).toBe(true);
  });

  it('falls back to the default template for unknown intents', () => {
    const { loadTemplateForIntent } = require('../data/parcoursTemplates');
    const template = loadTemplateForIntent('unknown');

    expect(template?.templateId).toBe('demo_day_track');
  });

  it('gracefully handles missing template directories', () => {
    process.env.PARCOURS_TEMPLATE_PATH = path.join(os.tmpdir(), 'missing-parcours');
    jest.resetModules();
    const { listTemplates } = require('../data/parcoursTemplates');

    expect(listTemplates()).toEqual([]);
  });

  it('returns null when the mapped file does not exist', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'parcours-empty-'));

    try {
      process.env.PARCOURS_TEMPLATE_PATH = tempDir;
      jest.resetModules();

      const { loadTemplateForIntent } = require('../data/parcoursTemplates');
      const template = loadTemplateForIntent('launch_nft');

      expect(template).toBeNull();
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('skips malformed template files without throwing', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'parcours-invalid-'));

    try {
      const validPath = path.join(tempDir, 'nft_track.json');
      const invalidPath = path.join(tempDir, 'broken.json');

      fs.writeFileSync(validPath, JSON.stringify({ stages: [] }), 'utf8');
      fs.writeFileSync(invalidPath, '{ broken json', 'utf8');

      process.env.PARCOURS_TEMPLATE_PATH = tempDir;
      jest.resetModules();

      const { listTemplates, loadTemplateForIntent } = require('../data/parcoursTemplates');
      const templates = listTemplates();
      const template = loadTemplateForIntent('launch_nft');

      expect(templates).toHaveLength(2);
      expect(templates.find((item) => item.fileName === 'broken.json')?.content).toBeNull();
      expect(template?.content).toEqual({ stages: [] });
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
