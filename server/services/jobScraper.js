import axios from 'axios';
import puppeteer from 'puppeteer';
import Job from '../models/Job.js';
import { getEmbedding } from './aiService.js';
import { findRelevantJobs } from './aiService.js';

// Scrape Indeed jobs with multiple selector attempts
export const scrapeIndeed = async (searchQuery, location = '') => {
  let browser;
  try {
    const jobs = [];
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=${encodeURIComponent(location)}`;
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set a reasonable timeout
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait a bit for dynamic content
    await page.waitForTimeout(3000);
    
    // Try multiple selectors for Indeed
    let jobCards = [];
    try {
      jobCards = await page.$$eval('.job_seen_beacon', (cards) => {
        return cards.slice(0, 20).map(card => {
          const title = card.querySelector('.jobTitle a')?.textContent?.trim() || 
                       card.querySelector('h2 a')?.textContent?.trim() ||
                       card.querySelector('[data-jk]')?.getAttribute('data-jk') || '';
          const company = card.querySelector('.companyName')?.textContent?.trim() || 
                         card.querySelector('.company_location')?.textContent?.trim() || '';
          const location = card.querySelector('.companyLocation')?.textContent?.trim() || 
                          card.querySelector('.location')?.textContent?.trim() || '';
          const link = card.querySelector('.jobTitle a')?.href || 
                      card.querySelector('h2 a')?.href || '';
          const snippet = card.querySelector('.job-snippet')?.textContent?.trim() || 
                         card.querySelector('.summary')?.textContent?.trim() || '';
          
          return {
            title,
            company,
            location,
            link: link.startsWith('http') ? link : (link ? `https://www.indeed.com${link}` : ''),
            snippet
          };
        }).filter(job => job.title && job.link);
      });
    } catch (error) {
      console.warn('First selector failed, trying alternative:', error.message);
      // Try alternative selector
      try {
        jobCards = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('[data-jk], .job_seen_beacon, [class*="job"]'));
          return cards.slice(0, 20).map(card => {
            const titleEl = card.querySelector('h2 a, .jobTitle a, a[data-jk]');
            const title = titleEl?.textContent?.trim() || '';
            const link = titleEl?.href || '';
            const company = card.querySelector('[class*="company"], .companyName')?.textContent?.trim() || '';
            const location = card.querySelector('[class*="location"], .companyLocation')?.textContent?.trim() || '';
            const snippet = card.querySelector('[class*="snippet"], .job-snippet, .summary')?.textContent?.trim() || '';
            
            return {
              title,
              company,
              location,
              link: link.startsWith('http') ? link : (link ? `https://www.indeed.com${link}` : ''),
              snippet
            };
          }).filter(job => job.title && job.link);
        });
      } catch (altError) {
        console.warn('Alternative selector also failed:', altError.message);
      }
    }
    
    await browser.close();
    
    // Fetch full descriptions
    for (const job of jobCards) {
      try {
        const fullDescription = await fetchJobDescription(job.link);
        jobs.push({
          ...job,
          description: fullDescription || job.snippet
        });
      } catch (error) {
        jobs.push({
          ...job,
          description: job.snippet
        });
      }
    }
    
    return jobs;
  } catch (error) {
    console.error('Error scraping Indeed:', error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
    return [];
  }
};

// Scrape LinkedIn jobs
export const scrapeLinkedIn = async (searchQuery, location = '') => {
  let browser;
  try {
    const jobs = [];
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`;
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    let jobCards = [];
    try {
      jobCards = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.jobs-search-results__list-item, [class*="job-card"], .job-result-card'));
        return cards.slice(0, 15).map(card => {
          const titleEl = card.querySelector('.job-result-card__title a, .base-search-card__title a, a[data-control-name="job_card_title"]');
          const title = titleEl?.textContent?.trim() || '';
          const link = titleEl?.href || '';
          const company = card.querySelector('.job-result-card__subtitle, .base-search-card__subtitle, [class*="company"]')?.textContent?.trim() || '';
          const location = card.querySelector('.job-result-card__location, .job-search-card__location, [class*="location"]')?.textContent?.trim() || '';
          const snippet = card.querySelector('.job-result-card__snippet, .job-search-card__snippet, [class*="snippet"]')?.textContent?.trim() || '';
          
          return {
            title,
            company,
            location,
            link: link.startsWith('http') ? link : (link ? `https://www.linkedin.com${link}` : ''),
            snippet
          };
        }).filter(job => job.title && job.link);
      });
    } catch (error) {
      console.warn('LinkedIn selector failed:', error.message);
    }
    
    await browser.close();
    
    for (const job of jobCards) {
      jobs.push({
        ...job,
        description: job.snippet
      });
    }
    
    return jobs;
  } catch (error) {
    console.error('Error scraping LinkedIn:', error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {}
    }
    return [];
  }
};

// Scrape Glassdoor jobs with fallback
export const scrapeGlassdoor = async (searchQuery, location = '') => {
  let browser;
  try {
    const jobs = [];
    const url = `https://www.glassdoor.com/Job/jobs.htm?suggestCount=0&suggestChosen=false&clickSource=searchBtn&typedKeyword=${encodeURIComponent(searchQuery)}&sc.keyword=${encodeURIComponent(searchQuery)}&locT=C&locId=${encodeURIComponent(location)}`;
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for dynamic content
    await page.waitForTimeout(3000);
    
    let jobCards = [];
    try {
      jobCards = await page.$$eval('.react-job-listing', (cards) => {
        return cards.slice(0, 20).map(card => {
          const title = card.querySelector('.jobLink')?.textContent?.trim() || '';
          const company = card.querySelector('.employerName')?.textContent?.trim() || '';
          const location = card.querySelector('.location')?.textContent?.trim() || '';
          const link = card.querySelector('.jobLink')?.href || '';
          const snippet = card.querySelector('.jobDescription')?.textContent?.trim() || '';
          
          return {
            title,
            company,
            location,
            link: link.startsWith('http') ? link : `https://www.glassdoor.com${link}`,
            snippet
          };
        }).filter(job => job.title && job.link);
      });
    } catch (error) {
      console.warn('Glassdoor selector failed, trying alternative:', error.message);
      // Try alternative approach
      try {
        jobCards = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('[class*="job"], [class*="listing"]'));
          return cards.slice(0, 20).map(card => {
            const titleEl = card.querySelector('a[href*="/Job/"]');
            const title = titleEl?.textContent?.trim() || '';
            const link = titleEl?.href || '';
            const company = card.querySelector('[class*="employer"], [class*="company"]')?.textContent?.trim() || '';
            const location = card.querySelector('[class*="location"]')?.textContent?.trim() || '';
            const snippet = card.querySelector('[class*="description"], [class*="snippet"]')?.textContent?.trim() || '';
            
            return {
              title,
              company,
              location,
              link: link.startsWith('http') ? link : (link ? `https://www.glassdoor.com${link}` : ''),
              snippet
            };
          }).filter(job => job.title && job.link);
        });
      } catch (altError) {
        console.warn('Glassdoor alternative selector failed:', altError.message);
      }
    }
    
    await browser.close();
    
    for (const job of jobCards) {
      jobs.push({
        ...job,
        description: job.snippet
      });
    }
    
    return jobs;
  } catch (error) {
    console.error('Error scraping Glassdoor:', error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
    return [];
  }
};

// Scrape Naukri jobs (Indian job portal)
export const scrapeNaukri = async (searchQuery, location = '') => {
  let browser;
  try {
    const jobs = [];
    const url = `https://www.naukri.com/${encodeURIComponent(searchQuery.replace(/\s+/g, '-'))}-jobs${location ? `-in-${encodeURIComponent(location.replace(/\s+/g, '-'))}` : ''}`;
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    let jobCards = [];
    try {
      jobCards = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.jobTuple, [class*="jobTuple"], .row, [data-job-id]'));
        return cards.slice(0, 20).map(card => {
          const titleEl = card.querySelector('.title a, a[data-ga-track="Job Title"], [class*="title"] a');
          const title = titleEl?.textContent?.trim() || '';
          const link = titleEl?.href || '';
          const company = card.querySelector('.companyName, [class*="company"], .subtitle')?.textContent?.trim() || '';
          const location = card.querySelector('.locWdth, .location, [class*="location"]')?.textContent?.trim() || '';
          const snippet = card.querySelector('.job-desc, .job-description, [class*="description"]')?.textContent?.trim() || '';
          
          return {
            title,
            company,
            location,
            link: link.startsWith('http') ? link : (link ? `https://www.naukri.com${link}` : ''),
            snippet
          };
        }).filter(job => job.title && job.link);
      });
    } catch (error) {
      console.warn('Naukri selector failed:', error.message);
    }
    
    await browser.close();
    
    for (const job of jobCards) {
      jobs.push({
        ...job,
        description: job.snippet
      });
    }
    
    return jobs;
  } catch (error) {
    console.error('Error scraping Naukri:', error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {}
    }
    return [];
  }
};

// Scrape iimjobs (Indian job portal)
export const scrapeIimjobs = async (searchQuery, location = '') => {
  let browser;
  try {
    const jobs = [];
    const url = `https://www.iimjobs.com/search/${encodeURIComponent(searchQuery)}${location ? `/${encodeURIComponent(location)}` : ''}`;
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    let jobCards = [];
    try {
      jobCards = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.job-tuple, .job-listing, [class*="job-card"], .job-item'));
        return cards.slice(0, 20).map(card => {
          const titleEl = card.querySelector('.job-title a, a[href*="/j/"], h3 a, .title a');
          const title = titleEl?.textContent?.trim() || '';
          const link = titleEl?.href || '';
          const company = card.querySelector('.company-name, .company, [class*="company"]')?.textContent?.trim() || '';
          const location = card.querySelector('.location, .loc, [class*="location"]')?.textContent?.trim() || '';
          const snippet = card.querySelector('.job-description, .description, [class*="description"]')?.textContent?.trim() || '';
          
          return {
            title,
            company,
            location,
            link: link.startsWith('http') ? link : (link ? `https://www.iimjobs.com${link}` : ''),
            snippet
          };
        }).filter(job => job.title && job.link);
      });
    } catch (error) {
      console.warn('iimjobs selector failed:', error.message);
    }
    
    await browser.close();
    
    for (const job of jobCards) {
      jobs.push({
        ...job,
        description: job.snippet
      });
    }
    
    return jobs;
  } catch (error) {
    console.error('Error scraping iimjobs:', error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {}
    }
    return [];
  }
};

// Scrape Unstop jobs (Indian job portal for students/freshers)
export const scrapeUnstop = async (searchQuery, location = '') => {
  let browser;
  try {
    const jobs = [];
    const url = `https://unstop.com/jobs?q=${encodeURIComponent(searchQuery)}${location ? `&location=${encodeURIComponent(location)}` : ''}`;
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    let jobCards = [];
    try {
      jobCards = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.job-card, [class*="job-card"], .opportunity-card, [data-testid*="job"]'));
        return cards.slice(0, 20).map(card => {
          const titleEl = card.querySelector('.job-title a, a[href*="/jobs/"], h3 a, .title a');
          const title = titleEl?.textContent?.trim() || '';
          const link = titleEl?.href || '';
          const company = card.querySelector('.company-name, .org-name, [class*="company"]')?.textContent?.trim() || '';
          const location = card.querySelector('.location, .job-location, [class*="location"]')?.textContent?.trim() || '';
          const snippet = card.querySelector('.job-description, .description, [class*="description"]')?.textContent?.trim() || '';
          
          return {
            title,
            company,
            location,
            link: link.startsWith('http') ? link : (link ? `https://unstop.com${link}` : ''),
            snippet
          };
        }).filter(job => job.title && job.link);
      });
    } catch (error) {
      console.warn('Unstop selector failed:', error.message);
    }
    
    await browser.close();
    
    for (const job of jobCards) {
      jobs.push({
        ...job,
        description: job.snippet
      });
    }
    
    return jobs;
  } catch (error) {
    console.error('Error scraping Unstop:', error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {}
    }
    return [];
  }
};

// Scrape Foundit (formerly Monster India) jobs
export const scrapeFoundit = async (searchQuery, location = '') => {
  let browser;
  try {
    const jobs = [];
    const url = `https://www.foundit.in/srp/results?query=${encodeURIComponent(searchQuery)}${location ? `&locations=${encodeURIComponent(location)}` : ''}`;
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    let jobCards = [];
    try {
      jobCards = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.srpJobTuple, .job-tuple, [class*="jobTuple"], .card-apply'));
        return cards.slice(0, 20).map(card => {
          const titleEl = card.querySelector('.jobTitle a, a[data-ga-track="Job Title"], .title a, h3 a');
          const title = titleEl?.textContent?.trim() || '';
          const link = titleEl?.href || '';
          const company = card.querySelector('.companyName, .company, [class*="company"]')?.textContent?.trim() || '';
          const location = card.querySelector('.locWdth, .location, [class*="location"]')?.textContent?.trim() || '';
          const snippet = card.querySelector('.job-desc, .job-description, [class*="description"]')?.textContent?.trim() || '';
          
          return {
            title,
            company,
            location,
            link: link.startsWith('http') ? link : (link ? `https://www.foundit.in${link}` : ''),
            snippet
          };
        }).filter(job => job.title && job.link);
      });
    } catch (error) {
      console.warn('Foundit selector failed:', error.message);
    }
    
    await browser.close();
    
    for (const job of jobCards) {
      jobs.push({
        ...job,
        description: job.snippet
      });
    }
    
    return jobs;
  } catch (error) {
    console.error('Error scraping Foundit:', error.message);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {}
    }
    return [];
  }
};

// Fetch full job description from URL
const fetchJobDescription = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    // Simple text extraction without cheerio to avoid import issues
    // Extract text from HTML using regex (basic approach)
    const htmlText = response.data;
    
    // Remove script and style tags
    let text = htmlText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Try to find job description in common containers
    const descMatch = htmlText.match(/<div[^>]*class="[^"]*job[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                     htmlText.match(/<div[^>]*id="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                     htmlText.match(/<section[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
    
    if (descMatch) {
      // Remove HTML tags from matched content
      text = descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      // Fallback: extract all text
      text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    return text.substring(0, 5000); // Limit to 5000 chars
  } catch (error) {
    console.error('Error fetching job description:', error);
    return null;
  }
};

// Main job scraping function that uses AI to find relevant jobs
export const scanJobPortals = async (resumeText, resumeSections, userPreferences = {}) => {
  try {
    // Use Llama to determine search queries
    let searchData;
    try {
      searchData = await findRelevantJobs(resumeText, resumeSections, userPreferences);
    } catch (error) {
      console.warn('Error getting AI search queries, using fallback:', error.message);
      // Fallback to basic search queries
      const jobTitles = resumeSections?.experience?.[0]?.title 
        ? [resumeSections.experience[0].title]
        : ['Software Engineer', 'Developer', 'Engineer'];
      searchData = {
        searchQueries: jobTitles,
        jobTitles: jobTitles,
        keySkills: resumeSections?.skills || [],
        industryKeywords: []
      };
    }
    
    const allJobs = [];
    // Include all job platforms
    const sources = ['indeed', 'glassdoor', 'linkedin', 'naukri', 'iimjobs', 'unstop', 'foundit'];
    
    // If no search queries, use fallback
    const queries = searchData?.searchQueries || searchData?.jobTitles || ['software engineer', 'developer'];
    
    // Scrape from multiple sources (limit queries to avoid timeout)
    for (const query of queries.slice(0, 2)) { // Limit to 2 queries to avoid timeout
      for (const source of sources) {
        try {
          let jobs = [];
          
          switch (source) {
            case 'indeed':
              jobs = await scrapeIndeed(query, userPreferences.location || '');
              break;
            case 'glassdoor':
              jobs = await scrapeGlassdoor(query, userPreferences.location || '');
              break;
            case 'linkedin':
              jobs = await scrapeLinkedIn(query, userPreferences.location || '');
              break;
            case 'naukri':
              jobs = await scrapeNaukri(query, userPreferences.location || '');
              break;
            case 'iimjobs':
              jobs = await scrapeIimjobs(query, userPreferences.location || '');
              break;
            case 'unstop':
              jobs = await scrapeUnstop(query, userPreferences.location || '');
              break;
            case 'foundit':
              jobs = await scrapeFoundit(query, userPreferences.location || '');
              break;
          }
          
          // Add source to each job
          jobs = jobs.map(job => ({
            ...job,
            source: source
          }));
          
          allJobs.push(...jobs);
          
          // Add small delay between sources to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error scraping ${source}:`, error.message);
        }
      }
    }
    
    // Remove duplicates based on URL
    const uniqueJobs = [];
    const seenUrls = new Set();
    
    for (const job of allJobs) {
      if (!seenUrls.has(job.link)) {
        seenUrls.add(job.link);
        uniqueJobs.push(job);
      }
    }
    
    // If no jobs found from scraping, generate sample jobs based on resume
    if (uniqueJobs.length === 0) {
      console.warn('No jobs found from scraping. Generating sample jobs based on resume...');
      return generateSampleJobs(resumeText, resumeSections, userPreferences);
    }
    
    // Save jobs to database and generate embeddings
    const savedJobs = [];
    for (const job of uniqueJobs.slice(0, 50)) { // Limit to 50 jobs
      try {
        // Validate job data
        if (!job.title || !job.link) {
          console.warn('Skipping job with missing title or link');
          continue;
        }
        
        // Check if job already exists
        let existingJob = await Job.findOne({ sourceUrl: job.link });
        
        if (!existingJob) {
          // Generate embedding (optional, don't fail if it doesn't work)
          let embedding = null;
          try {
            const textForEmbedding = `${job.title} ${job.description || ''}`.trim();
            if (textForEmbedding) {
              embedding = await getEmbedding(textForEmbedding);
            }
          } catch (error) {
            console.warn('Failed to generate embedding for job, continuing without it:', error.message);
          }
          
          existingJob = await Job.create({
            title: job.title,
            company: job.company || 'Unknown',
            location: job.location || 'Not specified',
            remote: job.location?.toLowerCase().includes('remote') || false,
            source: job.source || 'other',
            sourceUrl: job.link,
            description: job.description || job.snippet || '',
            extractedText: job.description || job.snippet || '',
            embedding,
            keywords: extractKeywords(job.description || job.snippet || ''),
            requirements: extractRequirements(job.description || job.snippet || '')
          });
        }
        
        savedJobs.push(existingJob);
      } catch (error) {
        console.error('Error saving job:', error);
        // Continue with other jobs even if one fails
      }
    }
    
    return savedJobs;
  } catch (error) {
    console.error('Error scanning job portals:', error);
    throw error;
  }
};

// Extract keywords from job description
const extractKeywords = (text) => {
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
    'typescript', 'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes',
    'git', 'agile', 'scrum', 'ci/cd', 'rest api', 'graphql', 'microservices'
  ];
  
  const textLower = text.toLowerCase();
  const foundKeywords = commonSkills.filter(skill => textLower.includes(skill));
  
  return foundKeywords;
};

// Extract requirements from job description
const extractRequirements = (text) => {
  const requirements = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.match(/^\s*[-•*]\s*|^\d+\./)) {
      requirements.push(line.trim());
    }
  }
  
  return requirements.slice(0, 10); // Limit to 10 requirements
};

// Generate sample jobs when scraping fails
const generateSampleJobs = async (resumeText, resumeSections, userPreferences) => {
  try {
    const jobs = [];
    const skills = resumeSections?.skills || [];
    const experience = resumeSections?.experience || [];
    const jobTitle = experience[0]?.title || resumeSections?.summary?.match(/\b(engineer|developer|manager|analyst|designer|specialist)\b/i)?.[0] || 'Software Engineer';
    
    // Generate 10-15 sample jobs based on resume
    const sampleJobTitles = [
      jobTitle,
      `Senior ${jobTitle}`,
      `${jobTitle} - Remote`,
      `Lead ${jobTitle}`,
      `${jobTitle} - ${userPreferences.location || 'Remote'}`,
      ...(skills.slice(0, 5).map(skill => `${jobTitle} - ${skill}`))
    ].slice(0, 15);
    
    const companies = [
      'Tech Corp', 'Innovation Labs', 'Digital Solutions', 'Cloud Services Inc',
      'Software Systems', 'Data Analytics Co', 'Web Technologies', 'Enterprise Solutions',
      'Startup Hub', 'Global Tech', 'Future Systems', 'Smart Solutions'
    ];
    
    for (let i = 0; i < sampleJobTitles.length; i++) {
      const title = sampleJobTitles[i];
      const company = companies[i % companies.length];
      const location = userPreferences.location || (Math.random() > 0.5 ? 'Remote' : 'San Francisco, CA');
      
      const description = `We are looking for a ${title} to join our team. 
      
Requirements:
- Experience with ${skills.slice(0, 3).join(', ') || 'relevant technologies'}
- Strong problem-solving skills
- Excellent communication abilities
- ${experience.length > 0 ? '2+ years of experience' : 'Relevant experience'}

Benefits:
- Competitive salary
- Health insurance
- Remote work options
- Professional development opportunities

${title} position with ${company}. Apply now!`;
      
      // Create a unique URL for each sample job
      const sourceUrl = `https://sample-jobs.com/job/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}-${i}`;
      
      // Generate embedding if possible
      let embedding = null;
      try {
        const textForEmbedding = `${title} ${description}`.trim();
        if (textForEmbedding) {
          embedding = await getEmbedding(textForEmbedding);
        }
      } catch (error) {
        console.warn('Failed to generate embedding for sample job:', error.message);
      }
      
      // Check if job already exists
      let existingJob = await Job.findOne({ sourceUrl });
      
      if (!existingJob) {
        existingJob = await Job.create({
          title,
          company,
          location,
          remote: location.toLowerCase().includes('remote'),
          source: 'sample',
          sourceUrl,
          description,
          extractedText: description,
          embedding,
          keywords: extractKeywords(description),
          requirements: extractRequirements(description),
          postedDate: new Date()
        });
      }
      
      jobs.push(existingJob);
    }
    
    console.log(`Generated ${jobs.length} sample jobs based on resume`);
    return jobs;
  } catch (error) {
    console.error('Error generating sample jobs:', error);
    return [];
  }
};

