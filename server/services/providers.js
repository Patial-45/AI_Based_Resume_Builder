import OpenAI from 'openai';
import Groq from 'groq-sdk';
export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('AI_UNAVAILABLE');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 15000, maxRetries: 0 });
}
export function getGroq() {
  if (!process.env.GROQ_API_KEY) throw new Error('AI_UNAVAILABLE');
  return new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 15000, maxRetries: 0 });
}

