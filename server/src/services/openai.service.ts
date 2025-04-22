/**
 * @file OpenAI service
 * @description Provides OpenAI API integration for AI-powered insights
 * @module services/openai
 */

import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/error-handler';

/**
 * OpenAI API client
 */
const openai = new OpenAI({
  apiKey: config.apis.openai.apiKey,
});

/**
 * Options for generating analysis
 */
interface AnalysisOptions {
  prompt: string;
  context?: string;
  type?: 'leads' | 'opportunities' | 'customers' | 'general';
}

/**
 * Options for generating insights
 */
interface InsightOptions {
  data: any;
  type: 'leads' | 'opportunities' | 'customers' | 'all';
}

/**
 * Options for generating recommendations
 */
interface RecommendationOptions {
  entityType: string;
  entityData: any;
}

/**
 * Options for generating email templates
 */
interface EmailTemplateOptions {
  recipientName: string;
  recipientCompany?: string;
  emailType: string;
  additionalContext?: string;
}

/**
 * Options for summarizing meetings
 */
interface MeetingSummaryOptions {
  meetingNotes: string;
  participants?: string[];
  duration?: string;
  meetingType?: string;
}

/**
 * Checks if an error message indicates an OpenAI quota error
 * @param errorMessage Error message to check
 * @returns True if the error is related to quota or rate limits
 */
export function isOpenAIQuotaError(errorMessage: string): boolean {
  const quotaErrorPhrases = [
    'quota',
    'rate limit',
    'billing',
    'exceeded your current quota',
    'exceeded your current monthly limit',
    'maximum monthly',
    'capacity',
    'usage limit',
  ];
  
  return quotaErrorPhrases.some(phrase => 
    errorMessage.toLowerCase().includes(phrase.toLowerCase())
  );
}

/**
 * OpenAI service class
 * Provides methods for AI-powered insights
 */
export class OpenAIService {
  /**
   * Generate analysis using OpenAI API
   * @param options Analysis options
   * @returns Generated analysis
   */
  async generateAnalysis(options: AnalysisOptions) {
    try {
      const { prompt, context, type = 'general' } = options;
      
      // Construct system message based on analysis type
      let systemContent = 'You are an AI assistant for a CRM system helping to analyze data.';
      
      switch (type) {
        case 'leads':
          systemContent = 'You are a lead generation expert helping to analyze lead data and provide actionable insights.';
          break;
        case 'opportunities':
          systemContent = 'You are a sales expert helping to analyze sales opportunities and provide strategies to close deals.';
          break;
        case 'customers':
          systemContent = 'You are a customer relationship expert helping to analyze customer data and provide retention strategies.';
          break;
      }
      
      // Define messages
      const messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: prompt }
      ];
      
      // Add context if provided
      if (context) {
        messages.push({ role: 'user', content: `Additional context: ${context}` });
      }
      
      // Make API call
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI analysis generation error', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isQuotaError = isOpenAIQuotaError(errorMessage);
      
      if (isQuotaError) {
        throw new ApiError(
          'OpenAI API quota exceeded. Please contact your administrator or try again later.',
          429,
          'OPENAI_QUOTA_EXCEEDED'
        );
      }
      
      throw new ApiError(
        `Failed to generate analysis: ${errorMessage}`,
        500,
        'OPENAI_ERROR'
      );
    }
  }
  
  /**
   * Generate insights using OpenAI API
   * @param options Insight options
   * @returns Generated insights
   */
  async generateInsights(options: InsightOptions) {
    try {
      const { data, type } = options;
      
      // Determine the system prompt based on the type
      let systemPrompt = 'You are a CRM analytics expert.';
      let userPrompt = '';
      
      switch (type) {
        case 'leads':
          systemPrompt = 'You are a lead generation expert. Analyze the given lead data and provide actionable insights.';
          userPrompt = `Analyze the following lead data and provide 3-5 key insights in JSON format. Data: ${JSON.stringify(data)}`;
          break;
        case 'opportunities':
          systemPrompt = 'You are a sales expert. Analyze the given opportunity data and provide actionable insights.';
          userPrompt = `Analyze the following opportunity data and provide 3-5 key insights in JSON format. Data: ${JSON.stringify(data)}`;
          break;
        case 'customers':
          systemPrompt = 'You are a customer relationship expert. Analyze the given customer data and provide actionable insights.';
          userPrompt = `Analyze the following customer data and provide 3-5 key insights in JSON format. Data: ${JSON.stringify(data)}`;
          break;
        case 'all':
          systemPrompt = 'You are a business analytics expert. Analyze the given business data and provide actionable insights.';
          userPrompt = `Analyze the following business data and provide 3-5 key insights in JSON format. Focus on actionable recommendations. Data: ${JSON.stringify(data)}`;
          break;
      }
      
      // Define messages
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];
      
      // Make API call
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI insights generation error', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isQuotaError = isOpenAIQuotaError(errorMessage);
      
      if (isQuotaError) {
        throw new ApiError(
          'OpenAI API quota exceeded. Please contact your administrator or try again later.',
          429,
          'OPENAI_QUOTA_EXCEEDED'
        );
      }
      
      throw new ApiError(
        `Failed to generate insights: ${errorMessage}`,
        500,
        'OPENAI_ERROR'
      );
    }
  }
  
  /**
   * Generate recommendations using OpenAI API
   * @param options Recommendation options
   * @returns Generated recommendations
   */
  async generateRecommendations(options: RecommendationOptions) {
    try {
      const { entityType, entityData } = options;
      
      // Construct system message based on entity type
      let systemContent = 'You are an AI assistant for a CRM system helping to provide recommendations.';
      
      switch (entityType.toLowerCase()) {
        case 'lead':
          systemContent = 'You are a lead conversion expert helping to provide the next best actions to convert this lead.';
          break;
        case 'opportunity':
          systemContent = 'You are a sales expert helping to provide strategies to progress and close this opportunity.';
          break;
        case 'customer':
        case 'contact':
          systemContent = 'You are a customer relationship expert helping to provide ways to strengthen this customer relationship.';
          break;
      }
      
      // Define messages
      const messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: `Based on the following ${entityType} data, provide 3-5 specific, actionable recommendations in JSON format. Data: ${JSON.stringify(entityData)}` }
      ];
      
      // Make API call
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI recommendations generation error', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isQuotaError = isOpenAIQuotaError(errorMessage);
      
      if (isQuotaError) {
        throw new ApiError(
          'OpenAI API quota exceeded. Please contact your administrator or try again later.',
          429,
          'OPENAI_QUOTA_EXCEEDED'
        );
      }
      
      throw new ApiError(
        `Failed to generate recommendations: ${errorMessage}`,
        500,
        'OPENAI_ERROR'
      );
    }
  }
  
  /**
   * Generate email template using OpenAI API
   * @param options Email template options
   * @returns Generated email template
   */
  async generateEmailTemplate(options: EmailTemplateOptions) {
    try {
      const { recipientName, recipientCompany, emailType, additionalContext } = options;
      
      // Construct user message with template requirements
      let userMessage = `Create a professional email template for ${emailType}. `;
      userMessage += `The recipient is ${recipientName}`;
      
      if (recipientCompany) {
        userMessage += ` from ${recipientCompany}`;
      }
      
      userMessage += '. ';
      
      if (additionalContext) {
        userMessage += `Additional context: ${additionalContext}`;
      }
      
      // Define messages
      const messages = [
        { role: 'system', content: 'You are an expert in business communication and email writing. Create professional, concise, and effective email templates.' },
        { role: 'user', content: userMessage }
      ];
      
      // Make API call
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI email template generation error', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isQuotaError = isOpenAIQuotaError(errorMessage);
      
      if (isQuotaError) {
        throw new ApiError(
          'OpenAI API quota exceeded. Please contact your administrator or try again later.',
          429,
          'OPENAI_QUOTA_EXCEEDED'
        );
      }
      
      throw new ApiError(
        `Failed to generate email template: ${errorMessage}`,
        500,
        'OPENAI_ERROR'
      );
    }
  }
  
  /**
   * Summarize meeting using OpenAI API
   * @param options Meeting summary options
   * @returns Generated meeting summary
   */
  async summarizeMeeting(options: MeetingSummaryOptions) {
    try {
      const { meetingNotes, participants, duration, meetingType } = options;
      
      // Construct user message with meeting details
      let userMessage = 'Summarize the following meeting notes: \n\n';
      userMessage += meetingNotes;
      
      if (participants?.length) {
        userMessage += `\n\nParticipants: ${participants.join(', ')}`;
      }
      
      if (duration) {
        userMessage += `\n\nDuration: ${duration}`;
      }
      
      if (meetingType) {
        userMessage += `\n\nMeeting Type: ${meetingType}`;
      }
      
      userMessage += '\n\nPlease provide a concise summary including key points, action items, and decisions made.';
      
      // Define messages
      const messages = [
        { role: 'system', content: 'You are an expert meeting summarizer. Create clear, organized summaries from meeting notes.' },
        { role: 'user', content: userMessage }
      ];
      
      // Make API call
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.5,
        max_tokens: 1000,
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI meeting summary generation error', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isQuotaError = isOpenAIQuotaError(errorMessage);
      
      if (isQuotaError) {
        throw new ApiError(
          'OpenAI API quota exceeded. Please contact your administrator or try again later.',
          429,
          'OPENAI_QUOTA_EXCEEDED'
        );
      }
      
      throw new ApiError(
        `Failed to generate meeting summary: ${errorMessage}`,
        500,
        'OPENAI_ERROR'
      );
    }
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();