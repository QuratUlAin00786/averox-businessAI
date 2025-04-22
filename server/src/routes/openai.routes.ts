/**
 * @file OpenAI routes
 * @description Defines API routes for AI-powered features
 * @module routes/openai
 */

import { Router } from 'express';
import { openaiController } from '../controllers/openai.controller';
import { asyncHandler } from '../utils/error-handler';
import { isAuthenticated } from '../middleware/auth.middleware';

// Create router
const router = Router();

/**
 * @route POST /api/ai/insights
 * @desc Generate AI insights
 * @access Private
 */
router.post('/ai/insights', isAuthenticated, asyncHandler(openaiController.generateInsights.bind(openaiController)));

/**
 * @route POST /api/ai/analysis
 * @desc Generate AI analysis
 * @access Private
 */
router.post('/ai/analysis', isAuthenticated, asyncHandler(openaiController.generateAnalysis.bind(openaiController)));

/**
 * @route POST /api/ai/recommendations
 * @desc Generate AI recommendations
 * @access Private
 */
router.post('/ai/recommendations', isAuthenticated, asyncHandler(openaiController.generateRecommendations.bind(openaiController)));

/**
 * @route POST /api/ai/email-template
 * @desc Generate email template
 * @access Private
 */
router.post('/ai/email-template', isAuthenticated, asyncHandler(openaiController.generateEmailTemplate.bind(openaiController)));

/**
 * @route POST /api/ai/summarize-meeting
 * @desc Summarize meeting notes
 * @access Private
 */
router.post('/ai/summarize-meeting', isAuthenticated, asyncHandler(openaiController.summarizeMeeting.bind(openaiController)));

export default router;