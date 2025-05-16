import { Router } from 'express';
import { 
  makeOutboundCall, 
  sendSMS, 
  getCallRecordings, 
  getCallLogs, 
  generateVoiceResponse,
  createConferenceCall
} from './telephony-service';
import { db } from './db';
import { communications } from '@shared/schema';
import { isAuthenticated, isAdmin } from './middleware/auth';

export const telephonyRouter = Router();

// Secure all telephony routes
telephonyRouter.use(isAuthenticated);

// Make outbound call
telephonyRouter.post('/call', async (req, res) => {
  try {
    const { to, from, callbackUrl, options } = req.body;
    
    if (!to || !from || !callbackUrl) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    const result = await makeOutboundCall(to, from, callbackUrl, options);
    
    // If call was successful, record in the communications table
    if (result.success) {
      await db.insert(communications).values({
        channel: 'Phone',
        direction: 'Outbound',
        content: `Call initiated to ${to}`,
        status: 'Unread',
        sentAt: new Date(),
        ownerId: req.user.id,
        contactType: req.body.contactType,
        contactId: req.body.contactId,
        leadId: req.body.leadId,
        metadata: {
          callSid: result.callSid,
          provider: 'Twilio',
          status: result.status
        }
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error making outbound call:', error);
    res.status(500).json({ success: false, message: 'Failed to make call', error: error.message });
  }
});

// Send SMS
telephonyRouter.post('/sms', async (req, res) => {
  try {
    const { to, from, body, options } = req.body;
    
    if (!to || !from || !body) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    const result = await sendSMS(to, from, body, options);
    
    // If SMS was successful, record in the communications table
    if (result.success) {
      await db.insert(communications).values({
        channel: 'SMS',
        direction: 'Outbound',
        content: body,
        status: 'Unread',
        sentAt: new Date(),
        ownerId: req.user.id,
        contactType: req.body.contactType,
        contactId: req.body.contactId,
        leadId: req.body.leadId,
        metadata: {
          messageSid: result.messageSid,
          provider: 'Twilio',
          status: result.status
        }
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, message: 'Failed to send SMS', error: error.message });
  }
});

// Conference call
telephonyRouter.post('/conference', async (req, res) => {
  try {
    const { participants, from, options } = req.body;
    
    if (!participants || !Array.isArray(participants) || participants.length < 2 || !from) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    const result = await createConferenceCall(participants, from, options);
    
    // If conference was successful, record in the communications table
    if (result.success) {
      await db.insert(communications).values({
        channel: 'Phone',
        direction: 'Outbound',
        content: `Conference call initiated with ${participants.length} participants`,
        status: 'Unread',
        sentAt: new Date(),
        ownerId: req.user.id,
        metadata: {
          conferenceRoom: result.conferenceRoom,
          provider: 'Twilio',
          participants: result.participants
        }
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error creating conference call:', error);
    res.status(500).json({ success: false, message: 'Failed to create conference call', error: error.message });
  }
});

// Get call recordings
telephonyRouter.get('/recordings/:callSid', async (req, res) => {
  try {
    const { callSid } = req.params;
    
    if (!callSid) {
      return res.status(400).json({ success: false, message: 'Missing call SID' });
    }
    
    const result = await getCallRecordings(callSid);
    res.json(result);
  } catch (error) {
    console.error('Error getting call recordings:', error);
    res.status(500).json({ success: false, message: 'Failed to get call recordings', error: error.message });
  }
});

// Get call logs
telephonyRouter.get('/logs', async (req, res) => {
  try {
    const options = {
      from: req.query.from as string,
      to: req.query.to as string,
      status: req.query.status as string,
      startTimeAfter: req.query.startTimeAfter ? new Date(req.query.startTimeAfter as string) : undefined,
      startTimeBefore: req.query.startTimeBefore ? new Date(req.query.startTimeBefore as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };
    
    const result = await getCallLogs(options);
    res.json(result);
  } catch (error) {
    console.error('Error getting call logs:', error);
    res.status(500).json({ success: false, message: 'Failed to get call logs', error: error.message });
  }
});

// Handle incoming voice calls
telephonyRouter.post('/incoming/voice', (req, res) => {
  try {
    const response = generateVoiceResponse({
      sayMessage: 'Thank you for calling. Your call is being recorded for quality and training purposes.',
      recordCall: true,
      redirectUrl: '/api/telephony/call-menu'
    });
    
    res.type('text/xml');
    res.send(response);
  } catch (error) {
    console.error('Error handling incoming voice call:', error);
    res.status(500).send('Error handling call');
  }
});

// Call menu
telephonyRouter.post('/call-menu', (req, res) => {
  try {
    const response = generateVoiceResponse({
      sayMessage: 'Press 1 for sales, 2 for support, or 3 to speak with an operator.',
      gatherDigits: true,
      redirectUrl: '/api/telephony/handle-menu-selection'
    });
    
    res.type('text/xml');
    res.send(response);
  } catch (error) {
    console.error('Error handling call menu:', error);
    res.status(500).send('Error handling call');
  }
});

// Handle menu selection
telephonyRouter.post('/handle-menu-selection', (req, res) => {
  try {
    const { Digits } = req.body;
    let response;
    
    switch (Digits) {
      case '1':
        response = generateVoiceResponse({
          sayMessage: 'Connecting you to sales. Please wait.',
          redirectUrl: '/api/telephony/connect-to-sales'
        });
        break;
      case '2':
        response = generateVoiceResponse({
          sayMessage: 'Connecting you to support. Please wait.',
          redirectUrl: '/api/telephony/connect-to-support'
        });
        break;
      case '3':
        response = generateVoiceResponse({
          sayMessage: 'Connecting you to an operator. Please wait.',
          redirectUrl: '/api/telephony/connect-to-operator'
        });
        break;
      default:
        response = generateVoiceResponse({
          sayMessage: 'Invalid selection. Please try again.',
          gatherDigits: true,
          redirectUrl: '/api/telephony/handle-menu-selection'
        });
    }
    
    res.type('text/xml');
    res.send(response);
  } catch (error) {
    console.error('Error handling menu selection:', error);
    res.status(500).send('Error handling call');
  }
});

// Webhook for call status updates
telephonyRouter.post('/webhook/status', async (req, res) => {
  try {
    const { CallSid, CallStatus } = req.body;
    
    // Log the call status update
    console.log(`Call ${CallSid} status updated to ${CallStatus}`);
    
    // Update the communication record if it exists
    // This would require a separate method to find the communication by CallSid
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling call status webhook:', error);
    res.status(500).send('Error handling webhook');
  }
});

// Handle incoming SMS
telephonyRouter.post('/incoming/sms', async (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;
    
    // Record the incoming SMS in the communications table
    await db.insert(communications).values({
      channel: 'SMS',
      direction: 'Inbound',
      content: Body,
      status: 'Unread',
      sentAt: new Date(),
      receivedAt: new Date(),
      metadata: {
        messageSid: MessageSid,
        provider: 'Twilio',
        from: From
      }
    });
    
    // For now, just acknowledge receipt
    const { VoiceResponse } = require('twilio').twiml;
    const twiml = new VoiceResponse();
    // Could add auto-responder here if needed
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
    res.status(500).send('Error handling SMS');
  }
});

// Admin-only routes
telephonyRouter.use(isAdmin);

// Get all call logs (admin-only)
telephonyRouter.get('/admin/logs', async (req, res) => {
  try {
    const result = await getCallLogs({
      limit: 100 // Get more logs for admin view
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting admin call logs:', error);
    res.status(500).json({ success: false, message: 'Failed to get call logs', error: error.message });
  }
});

export default telephonyRouter;