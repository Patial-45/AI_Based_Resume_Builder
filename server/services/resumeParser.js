import fs from 'node:fs/promises';
import { HttpError } from '../middleware/errors.js';

// Exact standalone headings only. Never guess a company, job title, date or skill.
export function extractSections(source) {
  const sections = { summary: '', experience: [], education: [], skills: [], certifications: [] };
  const names = { summary: /^(professional summary|summary|profile|objective|about me)$/i,
    experience: /^(professional experience|work experience|experience|employment|work history)$/i,
    education: /^(education|academic background|qualifications)$/i,
    skills: /^(skills|technical skills|core competencies|technologies|tech stack)$/i,
    certifications: /^(certifications?|certificates?|licenses?)$/i,
    other: /^(projects|contact|awards|languages|interests|volunteering|publications|references)$/i };
  const blocks = { summary: [], experience: [], education: [], skills: [], certifications: [], other: [] };
  let current = 'other';
  for (const line of source.split(/\r?\n/)) {
    const heading = line.trim().replace(/:$/, '');
    const match = Object.entries(names).find(([, expression]) => expression.test(heading));
    if (match) current = match[0]; else blocks[current].push(line);
  }
  sections.summary = blocks.summary.join('\n').trim();
  const experience = blocks.experience.join('\n').trim();
  if (experience) sections.experience = [{ title: '', company: '', duration: '', description: experience }];
  const education = blocks.education.join('\n').trim();
  if (education) sections.education = [{ degree: education, institution: '', year: '' }];
  // Hyphens, '+' and periods inside a skill name are content, not separators.
  sections.skills = [...new Set(blocks.skills.join('\n').split(/[,;|\n]/).map(s => s.replace(/^\s*[•*]\s*/, '').trim()).filter(Boolean))];
  sections.certifications = blocks.certifications.map(s => s.trim()).filter(Boolean);
  return sections;
}
export async function parseBuffer(data, mimeType) {
  try {
    let extractedText;
    // Each upload has an isolated worker. Load only the parser this format needs;
    // a plain-text upload must not pay PDF/DOCX module startup costs.
    if (mimeType === 'application/pdf') {
      const { default: pdfParse } = await import('pdf-parse');
      extractedText = (await pdfParse(data)).text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const { default: mammoth } = await import('mammoth');
      extractedText = (await mammoth.extractRawText({ buffer: data })).value;
    }
    else if (mimeType === 'text/plain') extractedText = new TextDecoder('utf-8', { fatal: true }).decode(data);
    else throw new Error('UNSUPPORTED');
    if (typeof extractedText !== 'string') throw new Error('INVALID_TEXT');
    extractedText = extractedText.trim();
    if (!extractedText || extractedText.length > 100000) throw new Error('INVALID_TEXT');
    return { extractedText, sections: extractSections(extractedText) };
  } catch {
    throw new HttpError(422, 'PARSE_FAILED', 'We could not read this document. Use a text-based PDF, DOCX, or UTF-8 text file. Scanned images need text extraction first.');
  }
}
export async function parseResume(filePath, mimeType) { return parseBuffer(await fs.readFile(filePath), mimeType); }
