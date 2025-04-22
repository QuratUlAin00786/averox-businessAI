/**
 * @file OpenAI controller
 * @description Handles HTTP requests for AI-powered features
 * @module controllers/openai
 */

import { Request, Response } from 'express';
import { openaiService } from '../services/openai.service';
import { handleControllerError } from '../utils/error-handler';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/error-handler';
import { config } from '../config';

/**
 * OpenAI controller class
 * Handles HTTP requests for AI-powered features
 */
export class OpenAIController {
  /**
   * Generate AI insights for dashboard
   * @route POST /api/ai/insights
   */
  async generateInsights(req: Request, res: Response) {
    try {
      // Check if OpenAI integration is enabled
      if (!config.features.openAiIntegration) {
        return res.status(503).json({
          success: false,
          error: 'OpenAI integration is not enabled',
          message: 'The AI insights feature is not currently available'
        });
      }
      
      // Check if OpenAI API key is configured
      if (!config.apis.openai.apiKey) {
        return res.status(503).json({
          success: false,
          error: 'OpenAI API key not configured',
          message: 'The AI insights feature is not properly configured'
        });
      }
      
      const { data, type } = req.body;
      
      if (!data || !type) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Data and type are required'
        });
      }
      
      // Generate insights
      const insights = await openaiService.generateInsights({
        data,
        type
      });
      
      logger.info('AI insights generated successfully', { 
        userId: req.user?.id,
        type
      });
      
      res.json({ content: insights });
    } catch (error) {
      // Handle OpenAI quota errors specially
      if (error instanceof ApiError && error.statusCode === 429) {
        return res.status(429).json({
          success: false,
          error: 'OpenAI API Error',
          message: error.message,
          isQuotaError: true
        });
      }
      
      handleControllerError(res, error);
    }
  }

  /**
   * Generate AI analysis
   * @route POST /api/ai/analysis
   */
  async generateAnalysis(req: Request, res: Response) {
    try {
      // Check if OpenAI integration is enabled
      if (!config.features.openAiIntegration) {
        return res.status(503).json({
          success: false,
          error: 'OpenAI integration is not enabled',
          message: 'The AI analysis feature is not currently available'
        });
      }
      
      const { prompt, context, type } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Prompt is required'
        });
      }
      
      // Generate analysis
      const analysis = await openaiService.generateAnalysis({
        prompt,
        context,
        type
      });
      
      logger.info('AI analysis generated successfully', { 
        userId: req.user?.id,
        type
      });
      
      res.json({ content: analysis });
    } catch (error) {
      // Handle OpenAI quota errors specially
      if (error instanceof ApiError && error.statusCode === 429) {
        return res.status(429).json({
          success: false,
          error: 'OpenAI API Error',
          message: error.message,
          isQuotaError: true
        });
      }
      
      handleControllerError(res, error);
    }
  }

  /**
   * Generate AI recommendations
   * @route POST /api/ai/recommendations
   */
  async generateRecommendations(req: Request, res: Response) {
    try {
      // Check if OpenAI integration is enabled
      if (!config.features.openAiIntegration) {
        return res.status(503).json({
          success: false,
          error: 'OpenAI integration is not enabled',
          message: 'The AI recommendations feature is not currently available'
        });
      }
      
      const { entityType, entityData } = req.body;
      
      if (!entityType || !entityData) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Entity type and data are required'
        });
      }
      
      // Generate recommendations
      const recommendations = await openaiService.generateRecommendations({
        entityType,
        entityData
      });
      
      logger.info('AI recommendations generated successfully', { 
        userId: req.user?.id,
        entityType
      });
      
      res.json({ content: recommendations });
    } catch (error) {
      // Handle OpenAI quota errors specially
      if (error instanceof ApiError && error.statusCode === 429) {
        return res.status(429).json({
          success: false,
          error: 'OpenAI API Error',
          message: error.message,
          isQuotaError: true
        });
      }
      
      handleControllerError(res, error);
    }
  }

  /**
   * Generate email template
   * @route POST /api/ai/email-template
   */
  async generateEmailTemplate(req: Request, res: Response) {
    try {
      // Check if OpenAI integration is enabled
      if (!config.features.openAiIntegration) {
        return res.status(503).json({
          success: false,
          error: 'OpenAI integration is not enabled',
          message: 'The AI email template feature is not currently available'
        });
      }
      
      const { recipientName, recipientCompany, emailType, additionalContext } = req.body;
      
      if (!recipientName || !emailType) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Recipient name and email type are required'
        });
      }
      
      // Generate email template
      const emailTemplate = await openaiService.generateEmailTemplate({
        recipientName,
        recipientCompany,
        emailType,
        additionalContext
      });
      
      logger.info('AI email template generated successfully', { 
        userId: req.user?.id,
        emailType
      });
      
      res.json({ content: emailTemplate });
    } catch (error) {
      // Handle OpenAI quota errors specially
      if (error instanceof ApiError && error.statusCode === 429) {
        return res.status(429).json({
          success: false,
          error: 'OpenAI API Error',
          message: error.message,
          isQuotaError: true
        });
      }
      
      handleControllerError(res, error);
    }
  }

  /**
   * Summarize meeting
   * @route POST /api/ai/summarize-meeting
   */
  async summarizeMeeting(req: Request, res: Response) {
    try {
      // Check if OpenAI integration is enabled
      if (!config.features.openAiIntegration) {
        return res.status(503).json({
          success: false,
          error: 'OpenAI integration is not enabled',
          message: 'The AI meeting summary feature is not currently available'
        });
      }
      
      const { meetingNotes, participants, duration, meetingType } = req.body;
      
      if (!meetingNotes) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Meeting notes are required'
        });
      }
      
      // Generate meeting summary
      const summary = await openaiService.summarizeMeeting({
        meetingNotes,
        participants,
        duration,
        meetingType
      });
      
      logger.info('AI meeting summary generated successfully', { 
        userId: req.user?.id,
        meetingType
      });
      
      res.json({ content: summary });
    } catch (error) {
      // Handle OpenAI quota errors specially
      if (error instanceof ApiError && error.statusCode === 429) {
        return res.status(429).json({
          success: false,
          error: 'OpenAI API Error',
          message: error.message,
          isQuotaError: true
        });
      }
      
      handleControllerError(res, error);
    }
  }
}

// Export singleton instance
export const openaiController = new OpenAIController();