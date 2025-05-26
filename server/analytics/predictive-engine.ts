import express from 'express';
import { db } from '../db';
import { leads, contacts, opportunities, tasks, activities } from '../../shared/schema';
import { eq, gte, desc, sql } from 'drizzle-orm';

export interface LeadScore {
  leadId: number;
  score: number;
  confidence: number;
  factors: {
    factor: string;
    weight: number;
    value: string;
  }[];
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ChurnPrediction {
  customerId: number;
  customerName: string;
  riskLevel: 'low' | 'medium' | 'high';
  churnProbability: number;
  riskFactors: string[];
  recommendations: string[];
  lastActivity: Date;
  valueAtRisk: number;
}

export interface RevenueForecast {
  period: string;
  predictedRevenue: number;
  confidence: number;
  breakdown: {
    category: string;
    amount: number;
    probability: number;
  }[];
  trends: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    description: string;
  };
}

export interface BusinessInsight {
  type: 'opportunity' | 'risk' | 'trend' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  suggestedActions: string[];
  data: any;
  priority: number;
}

class PredictiveAnalyticsEngine {
  // Lead Scoring Algorithm using real database data
  async calculateLeadScores(userId?: number): Promise<LeadScore[]> {
    try {
      console.log('[Analytics] Calculating lead scores from database...');
      
      // Get actual leads from database
      const leadsData = await db.select().from(leads).limit(50);
      
      const scoredLeads: LeadScore[] = [];

      for (const lead of leadsData) {
        const score = await this.calculateIndividualLeadScore(lead);
        scoredLeads.push(score);
      }

      // Sort by score descending
      scoredLeads.sort((a, b) => b.score - a.score);
      
      console.log(`[Analytics] Calculated scores for ${scoredLeads.length} actual leads`);
      return scoredLeads;
      
    } catch (error) {
      console.error('[Analytics] Lead scoring error:', error);
      throw new Error('Failed to calculate lead scores');
    }
  }

  private async calculateIndividualLeadScore(lead: any): Promise<LeadScore> {
    const factors: LeadScore['factors'] = [];
    let totalScore = 0;
    
    // Company size factor
    if (lead.company) {
      const companyScore = this.scoreCompanySize(lead.company);
      factors.push({
        factor: 'Company Presence',
        weight: 0.2,
        value: lead.company
      });
      totalScore += companyScore * 0.2;
    }

    // Email domain factor
    if (lead.email) {
      const emailScore = this.scoreEmailDomain(lead.email);
      factors.push({
        factor: 'Email Domain',
        weight: 0.15,
        value: this.extractDomain(lead.email)
      });
      totalScore += emailScore * 0.15;
    }

    // Activity level factor from real database
    const activityScore = await this.getLeadActivityScore(lead.id);
    factors.push({
      factor: 'Engagement Level',
      weight: 0.3,
      value: activityScore > 70 ? 'High' : activityScore > 40 ? 'Medium' : 'Low'
    });
    totalScore += activityScore * 0.3;

    // Lead source factor
    const sourceScore = this.scoreLeadSource(lead.source);
    factors.push({
      factor: 'Lead Source',
      weight: 0.2,
      value: lead.source || 'Unknown'
    });
    totalScore += sourceScore * 0.2;

    // Recency factor
    const recencyScore = this.scoreRecency(lead.createdAt);
    factors.push({
      factor: 'Recency',
      weight: 0.15,
      value: this.getRecencyLabel(lead.createdAt)
    });
    totalScore += recencyScore * 0.15;

    const finalScore = Math.min(100, Math.max(0, totalScore));
    const confidence = this.calculateConfidence(factors);

    return {
      leadId: lead.id,
      score: Math.round(finalScore),
      confidence,
      factors,
      recommendation: this.generateLeadRecommendation(finalScore, factors),
      priority: finalScore >= 70 ? 'high' : finalScore >= 40 ? 'medium' : 'low'
    };
  }

  // Churn Prediction using actual customer data
  async predictCustomerChurn(userId?: number): Promise<ChurnPrediction[]> {
    try {
      console.log('[Analytics] Predicting customer churn from database...');
      
      // Get actual customers from database
      const customers = await db.select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        createdAt: contacts.createdAt
      }).from(contacts).limit(30);

      const churnPredictions: ChurnPrediction[] = [];

      for (const customer of customers) {
        const prediction = await this.calculateChurnRisk(customer);
        churnPredictions.push(prediction);
      }

      // Sort by risk level (high first)
      churnPredictions.sort((a, b) => {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      });

      console.log(`[Analytics] Calculated churn predictions for ${churnPredictions.length} actual customers`);
      return churnPredictions;
      
    } catch (error) {
      console.error('[Analytics] Churn prediction error:', error);
      throw new Error('Failed to predict customer churn');
    }
  }

  private async calculateChurnRisk(customer: any): Promise<ChurnPrediction> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Activity recency factor using real data
    const daysSinceCreated = Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    // Check for recent activities in database
    const recentActivities = await db.select().from(activities)
      .where(sql`${activities.relatedToId} = ${customer.id}`)
      .limit(1);

    if (recentActivities.length === 0 && daysSinceCreated > 30) {
      riskFactors.push('No recent activity (30+ days)');
      riskScore += 40;
    }

    // Email engagement (check if email exists and domain)
    if (!customer.email || this.extractDomain(customer.email).includes('temp')) {
      riskFactors.push('Poor contact information');
      riskScore += 20;
    }

    // Customer longevity
    if (daysSinceCreated > 365) {
      riskFactors.push('Long-term customer - may be taking business elsewhere');
      riskScore += 15;
    }

    // Check for opportunities associated with this contact
    const opportunities = await db.select().from(opportunities)
      .where(sql`${opportunities.accountId} = ${customer.id}`)
      .limit(1);

    if (opportunities.length === 0) {
      riskFactors.push('No active opportunities');
      riskScore += 25;
    }

    const churnProbability = Math.min(95, riskScore);
    const riskLevel: ChurnPrediction['riskLevel'] = 
      churnProbability >= 60 ? 'high' :
      churnProbability >= 30 ? 'medium' : 'low';

    // Calculate actual business value from opportunities
    const customerValue = opportunities.length > 0 ? 
      parseFloat(opportunities[0].amount) || 10000 : 5000;

    return {
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      riskLevel,
      churnProbability,
      riskFactors,
      recommendations: this.generateChurnRecommendations(riskLevel, riskFactors),
      lastActivity: new Date(customer.createdAt),
      valueAtRisk: customerValue
    };
  }

  // Revenue Forecasting using real opportunities data
  async generateRevenueForecast(period: 'month' | 'quarter' | 'year' = 'month'): Promise<RevenueForecast> {
    try {
      console.log(`[Analytics] Generating ${period} revenue forecast from database...`);
      
      // Get actual opportunities from database
      const opportunitiesData = await db.select().from(opportunities).limit(100);
      
      let totalPredicted = 0;
      const breakdown: RevenueForecast['breakdown'] = [];
      
      // Calculate by actual stages in database
      const stages = ['Lead Generation', 'Qualification', 'Proposal', 'Negotiation', 'Closing'];
      
      for (const stage of stages) {
        const stageOpps = opportunitiesData.filter(opp => opp.stage === stage);
        const stageValue = stageOpps.reduce((sum, opp) => {
          const amount = typeof opp.amount === 'string' ? parseFloat(opp.amount) : opp.amount;
          const probability = opp.probability / 100;
          return sum + (amount * probability);
        }, 0);
        
        breakdown.push({
          category: stage,
          amount: stageValue,
          probability: this.getStageProbability(stage)
        });
        
        totalPredicted += stageValue;
      }

      // Calculate trend based on actual data patterns
      const recentOpps = opportunitiesData.filter(opp => {
        const oppDate = new Date(opp.createdAt);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return oppDate > thirtyDaysAgo;
      });
      
      const recentValue = recentOpps.reduce((sum, opp) => {
        const amount = typeof opp.amount === 'string' ? parseFloat(opp.amount) : opp.amount;
        return sum + amount;
      }, 0);

      const olderValue = totalPredicted - recentValue;
      const growthPercentage = olderValue > 0 ? ((recentValue - olderValue) / olderValue) * 100 : 0;
      
      const forecast: RevenueForecast = {
        period: this.getPeriodLabel(period),
        predictedRevenue: Math.round(totalPredicted),
        confidence: 85,
        breakdown,
        trends: {
          direction: growthPercentage > 5 ? 'up' : growthPercentage < -5 ? 'down' : 'stable',
          percentage: Math.abs(growthPercentage),
          description: this.getTrendDescription(growthPercentage)
        }
      };

      console.log(`[Analytics] Revenue forecast from real data: $${totalPredicted.toLocaleString()}`);
      return forecast;
      
    } catch (error) {
      console.error('[Analytics] Revenue forecast error:', error);
      throw new Error('Failed to generate revenue forecast');
    }
  }

  // Get real activity score from database
  private async getLeadActivityScore(leadId: number): Promise<number> {
    try {
      const leadActivities = await db.select().from(activities)
        .where(sql`${activities.relatedToId} = ${leadId} AND ${activities.relatedToType} = 'lead'`)
        .limit(10);

      // Score based on actual activity count and recency
      if (leadActivities.length === 0) return 20;
      if (leadActivities.length >= 5) return 90;
      if (leadActivities.length >= 3) return 70;
      if (leadActivities.length >= 1) return 50;
      
      return 30;
    } catch (error) {
      console.error('[Analytics] Error getting activity score:', error);
      return 40; // Default score if query fails
    }
  }

  // Helper methods for scoring
  private scoreCompanySize(companyName: string): number {
    if (!companyName) return 30;
    
    const enterprise = ['corp', 'corporation', 'inc', 'ltd', 'llc', 'group', 'global', 'international'];
    const hasEnterpriseIndicator = enterprise.some(indicator => 
      companyName.toLowerCase().includes(indicator)
    );
    
    return hasEnterpriseIndicator ? 80 : 50;
  }

  private scoreEmailDomain(email: string): number {
    const domain = this.extractDomain(email);
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    return freeDomains.includes(domain) ? 30 : 70;
  }

  private extractDomain(email: string): string {
    return email.split('@')[1] || '';
  }

  private scoreLeadSource(source: string): number {
    const sourceScores: { [key: string]: number } = {
      'Website': 60,
      'Referral': 80,
      'Social Media': 40,
      'Cold Call': 30,
      'Email Campaign': 50,
      'Trade Show': 70
    };
    
    return sourceScores[source] || 40;
  }

  private scoreRecency(createdAt: string): number {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return 90;
    if (days <= 30) return 70;
    if (days <= 90) return 50;
    return 30;
  }

  private getRecencyLabel(createdAt: string): string {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return 'This week';
    if (days <= 30) return 'This month';
    if (days <= 90) return 'Last 3 months';
    return 'Older than 3 months';
  }

  private calculateConfidence(factors: LeadScore['factors']): number {
    return Math.min(95, 60 + (factors.length * 5));
  }

  private generateLeadRecommendation(score: number, factors: LeadScore['factors']): string {
    if (score >= 80) return 'Immediate follow-up recommended - high conversion probability';
    if (score >= 60) return 'Schedule follow-up within 24 hours';
    if (score >= 40) return 'Add to nurturing campaign';
    return 'Low priority - monitor for engagement changes';
  }

  private generateChurnRecommendations(riskLevel: ChurnPrediction['riskLevel'], factors: string[]): string[] {
    if (riskLevel === 'high') {
      return [
        'Schedule immediate retention call',
        'Offer loyalty discount or upgrade',
        'Assign dedicated account manager',
        'Conduct satisfaction survey'
      ];
    } else if (riskLevel === 'medium') {
      return [
        'Send check-in email',
        'Provide additional value content',
        'Monitor engagement closely'
      ];
    } else {
      return [
        'Continue regular communication',
        'Identify upsell opportunities'
      ];
    }
  }

  private getStageProbability(stage: string): number {
    const probabilities: { [key: string]: number } = {
      'Lead Generation': 10,
      'Qualification': 25,
      'Proposal': 50,
      'Negotiation': 75,
      'Closing': 90
    };
    return probabilities[stage] || 20;
  }

  private getPeriodLabel(period: string): string {
    const now = new Date();
    switch (period) {
      case 'month':
        return now.toLocaleString('default', { month: 'long', year: 'numeric' });
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Q${quarter} ${now.getFullYear()}`;
      case 'year':
        return now.getFullYear().toString();
      default:
        return 'Current Period';
    }
  }

  private getTrendDescription(growthPercentage: number): string {
    if (growthPercentage > 15) return 'Strong growth trajectory';
    if (growthPercentage > 5) return 'Moderate growth';
    if (growthPercentage > -5) return 'Stable performance';
    if (growthPercentage > -15) return 'Slight decline';
    return 'Significant decline requiring attention';
  }
}

export const predictiveAnalyticsEngine = new PredictiveAnalyticsEngine();

// Express routes for predictive analytics
export function setupPredictiveAnalyticsRoutes(app: express.Application) {
  // Get lead scores from real data
  app.get('/api/analytics/lead-scores', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const leadScores = await predictiveAnalyticsEngine.calculateLeadScores(req.user.id);
      res.json({ leadScores });
    } catch (error) {
      console.error('[Analytics] Lead scores error:', error);
      res.status(500).json({ error: 'Failed to get lead scores' });
    }
  });

  // Get churn predictions from real data
  app.get('/api/analytics/churn-predictions', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const churnPredictions = await predictiveAnalyticsEngine.predictCustomerChurn(req.user.id);
      res.json({ churnPredictions });
    } catch (error) {
      console.error('[Analytics] Churn predictions error:', error);
      res.status(500).json({ error: 'Failed to get churn predictions' });
    }
  });

  // Get revenue forecast from real data
  app.get('/api/analytics/revenue-forecast', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { period = 'month' } = req.query;
      const forecast = await predictiveAnalyticsEngine.generateRevenueForecast(period as any);
      res.json({ forecast });
    } catch (error) {
      console.error('[Analytics] Revenue forecast error:', error);
      res.status(500).json({ error: 'Failed to get revenue forecast' });
    }
  });
}