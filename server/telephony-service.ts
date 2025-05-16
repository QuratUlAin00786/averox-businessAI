import { Twilio } from 'twilio';
import { apiKeys } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';

// Get Twilio client from API keys
async function getTwilioClient() {
  try {
    // Find Twilio API key
    const [twilioKeys] = await db.select()
      .from(apiKeys)
      .where(eq(apiKeys.provider, 'Twilio'))
      .where(eq(apiKeys.isActive, true));
    
    if (!twilioKeys) {
      throw new Error('No active Twilio API key found');
    }
    
    // Extract credentials from API key
    const accountSid = twilioKeys.key;
    const authToken = twilioKeys.secret;
    
    if (!accountSid || !authToken) {
      throw new Error('Invalid Twilio credentials');
    }
    
    // Create and return Twilio client
    return new Twilio(accountSid, authToken);
  } catch (error) {
    console.error('Error initializing Twilio client:', error);
    throw new Error('Could not initialize Twilio client');
  }
}

// Make an outbound call
export async function makeOutboundCall(
  to: string, 
  from: string, 
  callbackUrl: string,
  options: {
    record?: boolean;
    transcribe?: boolean;
    recordingStatusCallback?: string;
    customParameters?: Record<string, string>;
  } = {}
) {
  try {
    const client = await getTwilioClient();
    
    const callParams: any = {
      to,
      from,
      url: callbackUrl,
      statusCallback: options.recordingStatusCallback,
      record: options.record ? 'record-from-answer' : 'do-not-record',
    };
    
    // Add transcription if requested
    if (options.transcribe) {
      callParams.transcribe = true;
      callParams.transcribeCallback = `${callbackUrl}/transcription`;
    }
    
    // Add custom parameters
    if (options.customParameters) {
      Object.entries(options.customParameters).forEach(([key, value]) => {
        callParams[key] = value;
      });
    }
    
    const call = await client.calls.create(callParams);
    
    return {
      success: true,
      callSid: call.sid,
      status: call.status,
      startTime: call.startTime,
      direction: call.direction
    };
  } catch (error) {
    console.error('Error making outbound call:', error);
    return {
      success: false,
      error: error.message || 'Failed to make call'
    };
  }
}

// Send SMS
export async function sendSMS(
  to: string, 
  from: string, 
  body: string,
  options: {
    mediaUrls?: string[];
    statusCallback?: string;
  } = {}
) {
  try {
    const client = await getTwilioClient();
    
    const messageParams: any = {
      to,
      from,
      body,
    };
    
    // Add media URLs if provided
    if (options.mediaUrls && options.mediaUrls.length > 0) {
      messageParams.mediaUrl = options.mediaUrls;
    }
    
    // Add status callback if provided
    if (options.statusCallback) {
      messageParams.statusCallback = options.statusCallback;
    }
    
    const message = await client.messages.create(messageParams);
    
    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
      dateCreated: message.dateCreated
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS'
    };
  }
}

// Get call recordings
export async function getCallRecordings(callSid: string) {
  try {
    const client = await getTwilioClient();
    const recordings = await client.recordings.list({ callSid });
    
    return {
      success: true,
      recordings: recordings.map(recording => ({
        sid: recording.sid,
        duration: recording.duration,
        channels: recording.channels,
        status: recording.status,
        dateCreated: recording.dateCreated,
        url: `https://api.twilio.com/2010-04-01/Accounts/${client.accountSid}/Recordings/${recording.sid}.mp3`
      }))
    };
  } catch (error) {
    console.error('Error getting call recordings:', error);
    return {
      success: false,
      error: error.message || 'Failed to get call recordings'
    };
  }
}

// Get call logs
export async function getCallLogs(
  options: {
    from?: string;
    to?: string;
    status?: string;
    startTimeAfter?: Date;
    startTimeBefore?: Date;
    limit?: number;
  } = {}
) {
  try {
    const client = await getTwilioClient();
    
    const params: any = {};
    
    if (options.from) params.from = options.from;
    if (options.to) params.to = options.to;
    if (options.status) params.status = options.status;
    if (options.startTimeAfter) params.startTimeAfter = options.startTimeAfter;
    if (options.startTimeBefore) params.startTimeBefore = options.startTimeBefore;
    
    const calls = await client.calls.list({
      ...params,
      limit: options.limit || 20
    });
    
    return {
      success: true,
      calls: calls.map(call => ({
        sid: call.sid,
        from: call.from,
        to: call.to,
        status: call.status,
        direction: call.direction,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime,
        price: call.price,
        priceUnit: call.priceUnit
      }))
    };
  } catch (error) {
    console.error('Error getting call logs:', error);
    return {
      success: false,
      error: error.message || 'Failed to get call logs'
    };
  }
}

// Generate TwiML for call handling
export function generateVoiceResponse(options: {
  sayMessage?: string;
  playUrl?: string;
  gatherDigits?: boolean;
  redirectUrl?: string;
  recordCall?: boolean;
  hangUp?: boolean;
}) {
  // Import VoiceResponse from twilio.twiml.VoiceResponse
  const { VoiceResponse } = require('twilio').twiml;
  const response = new VoiceResponse();
  
  // Say a message
  if (options.sayMessage) {
    response.say({ voice: 'alice' }, options.sayMessage);
  }
  
  // Play an audio file
  if (options.playUrl) {
    response.play(options.playUrl);
  }
  
  // Gather digits
  if (options.gatherDigits) {
    const gather = response.gather({
      numDigits: 1,
      action: options.redirectUrl || '/api/telephony/handle-digits',
      method: 'POST',
    });
    gather.say({ voice: 'alice' }, 'Please press a key to continue');
  }
  
  // Record the call
  if (options.recordCall) {
    response.record({
      action: options.redirectUrl || '/api/telephony/recording-complete',
      method: 'POST',
      maxLength: 30,
      playBeep: true
    });
  }
  
  // Hang up
  if (options.hangUp) {
    response.hangup();
  }
  
  return response.toString();
}

// Create a conference call
export async function createConferenceCall(
  participants: string[],
  from: string,
  options: {
    friendlyName?: string;
    recordConference?: boolean;
    statusCallback?: string;
  } = {}
) {
  try {
    const client = await getTwilioClient();
    
    // Create a friendly name for the conference
    const friendlyName = options.friendlyName || `Conference_${Date.now()}`;
    
    // Make calls to all participants
    const calls = await Promise.all(participants.map(participant => {
      const { VoiceResponse } = require('twilio').twiml;
      const twiml = new VoiceResponse();
      
      // Add participant to the conference
      const dial = twiml.dial();
      dial.conference({
        startConferenceOnEnter: true,
        endConferenceOnExit: participants.indexOf(participant) === 0, // First participant controls the conference
        record: options.recordConference ? 'record-from-start' : 'do-not-record',
        statusCallback: options.statusCallback,
        statusCallbackEvent: ['join', 'leave', 'end', 'start'],
        statusCallbackMethod: 'POST'
      }, friendlyName);
      
      // Call this participant
      return client.calls.create({
        twiml: twiml.toString(),
        to: participant,
        from
      });
    }));
    
    return {
      success: true,
      conferenceRoom: friendlyName,
      participants: calls.map(call => ({
        sid: call.sid,
        to: call.to,
        status: call.status
      }))
    };
  } catch (error) {
    console.error('Error creating conference call:', error);
    return {
      success: false,
      error: error.message || 'Failed to create conference call'
    };
  }
}