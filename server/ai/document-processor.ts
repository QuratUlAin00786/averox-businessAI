import OpenAI from 'openai';
import { db } from '../db';

export interface DocumentAnalysisResult {
  documentType: 'invoice' | 'contract' | 'receipt' | 'business_card' | 'form' | 'other';
  extractedData: {
    text: string;
    entities: {
      names: string[];
      emails: string[];
      phones: string[];
      addresses: string[];
      dates: string[];
      amounts: string[];
      companies: string[];
    };
    structured?: {
      [key: string]: any;
    };
  };
  confidence: number;
  suggestions: string[];
}

export interface VoiceCommandResult {
  intent: string;
  entities: { [key: string]: any };
  action: string;
  response: string;
  confidence: number;
}

class AIDocumentProcessor {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for AI document processing');
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // Process document with AI
  async processDocument(fileBuffer: Buffer, fileName: string): Promise<DocumentAnalysisResult> {
    try {
      console.log(`[AI] Processing document: ${fileName}`);
      
      // Convert buffer to base64 for OpenAI Vision API
      const base64Image = fileBuffer.toString('base64');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // Latest model with vision capabilities
        messages: [
          {
            role: "system",
            content: `You are an expert document analysis AI. Analyze the document and extract all relevant business information. 
            Return a JSON response with the following structure:
            {
              "documentType": "invoice|contract|receipt|business_card|form|other",
              "extractedData": {
                "text": "full extracted text",
                "entities": {
                  "names": ["person names"],
                  "emails": ["email addresses"],
                  "phones": ["phone numbers"],
                  "addresses": ["physical addresses"],
                  "dates": ["dates found"],
                  "amounts": ["monetary amounts"],
                  "companies": ["company names"]
                },
                "structured": {
                  "invoice_number": "if invoice",
                  "total_amount": "if financial doc",
                  "due_date": "if applicable",
                  "vendor": "if applicable"
                }
              },
              "confidence": 0.95,
              "suggestions": ["actionable suggestions"]
            }`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze this business document: ${fileName}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      console.log(`[AI] Document analysis complete: ${result.documentType} with ${result.confidence} confidence`);
      
      return result;
    } catch (error) {
      console.error('[AI] Document processing error:', error);
      throw new Error('Failed to process document with AI');
    }
  }

  // Process voice commands
  async processVoiceCommand(audioBuffer: Buffer): Promise<VoiceCommandResult> {
    try {
      console.log('[AI] Processing voice command');
      
      // First, transcribe the audio
      const transcription = await this.openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
        model: 'whisper-1',
      });

      const transcript = transcription.text;
      console.log(`[AI] Voice transcribed: "${transcript}"`);

      // Then, understand the intent and extract entities
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a CRM voice assistant. Analyze voice commands and return structured data.
            Available actions: create_lead, create_contact, create_task, create_opportunity, search_leads, search_contacts, get_stats, schedule_meeting
            
            Return JSON:
            {
              "intent": "user's intention",
              "entities": {
                "name": "if creating contact/lead",
                "company": "if mentioned",
                "phone": "if mentioned",
                "email": "if mentioned",
                "amount": "if opportunity",
                "date": "if scheduling"
              },
              "action": "specific action to take",
              "response": "friendly response to user",
              "confidence": 0.95
            }`
          },
          {
            role: "user",
            content: transcript
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      console.log(`[AI] Voice command processed: ${result.action}`);
      
      return result;
    } catch (error) {
      console.error('[AI] Voice processing error:', error);
      throw new Error('Failed to process voice command');
    }
  }

  // Analyze customer sentiment from communications
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    emotions: string[];
    urgency: 'low' | 'medium' | 'high';
    actionRequired: boolean;
  }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze the sentiment and urgency of customer communication. Return JSON:
            {
              "sentiment": "positive|negative|neutral",
              "score": 0.85,
              "emotions": ["frustrated", "excited", "urgent"],
              "urgency": "low|medium|high",
              "actionRequired": true
            }`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('[AI] Sentiment analysis error:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }
}

export const aiDocumentProcessor = new AIDocumentProcessor();