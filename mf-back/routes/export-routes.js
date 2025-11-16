const express = require('express');
const PDFDocument = require('pdfkit');

const router = express.Router();

function buildMissionMarkdown(summary) {
  const lines = [];
  lines.push(`# Mission Report – ${summary?.title || 'Zyno Session'}`);
  lines.push('');
  lines.push(`- **User:** ${summary?.userId || 'unknown'}`);
  lines.push(`- **Generated:** ${new Date(summary?.timestamp || Date.now()).toISOString()}`);
  lines.push(`- **AEPO Score:** ${summary?.aepo ?? 'N/A'}`);
  lines.push(`- **AECO Phase:** ${summary?.aecoPhase || 'N/A'}`);
  lines.push('');

  if (Array.isArray(summary?.agents) && summary.agents.length > 0) {
    lines.push('## Agents Activated');
    summary.agents.forEach((agent) => {
      const name = typeof agent === 'string' ? agent : agent?.name;
      if (name) {
        lines.push(`- ${name}`);
      }
    });
    lines.push('');
  }

  if (summary?.generatedText) {
    lines.push('## Generated Insights');
    lines.push('');
    lines.push(summary.generatedText);
    lines.push('');
  }

  if (Array.isArray(summary?.actions) && summary.actions.length > 0) {
    lines.push('## Recommended Actions');
    summary.actions.forEach((action, index) => {
      lines.push(`${index + 1}. ${action}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

function buildMissionPdfBuffer(summary) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(summary?.title || 'Mission Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`User: ${summary?.userId || 'Unknown'}`);
    doc.text(`Generated: ${new Date(summary?.timestamp || Date.now()).toLocaleString()}`);
    doc.text(`AEPO Score: ${summary?.aepo ?? 'N/A'}`);
    doc.text(`AECO Phase: ${summary?.aecoPhase || 'N/A'}`);
    doc.moveDown();

    if (Array.isArray(summary?.agents) && summary.agents.length > 0) {
      doc.fontSize(14).text('Agents Activated', { underline: true });
      doc.moveDown(0.5);
      summary.agents.forEach((agent) => {
        const name = typeof agent === 'string' ? agent : agent?.name;
        if (name) {
          doc.fontSize(12).text(`• ${name}`);
        }
      });
      doc.moveDown();
    }

    if (summary?.generatedText) {
      doc.fontSize(14).text('Generated Insights', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(summary.generatedText, { lineGap: 4 });
      doc.moveDown();
    }

    if (Array.isArray(summary?.actions) && summary.actions.length > 0) {
      doc.fontSize(14).text('Recommended Actions', { underline: true });
      doc.moveDown(0.5);
      summary.actions.forEach((action, idx) => {
        doc.fontSize(12).text(`${idx + 1}. ${action}`);
      });
      doc.moveDown();
    }

    doc.end();
  });
}

router.post('/admin/export/mission', async (req, res) => {
  const apiKey = req.header('x-api-key');
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { summary, format = 'pdf' } = req.body || {};
  if (!summary || typeof summary !== 'object') {
    return res.status(400).json({ error: 'Missing mission summary payload.' });
  }

  try {
    if (format === 'notion') {
      const markdown = buildMissionMarkdown(summary);
      return res.json({ format: 'notion-markdown', content: markdown });
    }

    const buffer = await buildMissionPdfBuffer(summary);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="mission-report.pdf"');
    return res.send(buffer);
  } catch (error) {
    console.error('Mission export error:', error);
    return res.status(500).json({ error: 'Unable to generate export' });
  }
});

module.exports = router;
