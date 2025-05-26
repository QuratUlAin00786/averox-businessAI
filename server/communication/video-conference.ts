import express from 'express';
import { db } from '../db';
import crypto from 'crypto';

export interface VideoMeeting {
  id: string;
  title: string;
  hostId: number;
  startTime: Date;
  duration: number; // minutes
  participants: MeetingParticipant[];
  roomUrl: string;
  status: 'scheduled' | 'active' | 'ended';
  recordingUrl?: string;
  settings: {
    enableRecording: boolean;
    enableScreenShare: boolean;
    enableChat: boolean;
    waitingRoom: boolean;
    maxParticipants: number;
  };
}

export interface MeetingParticipant {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'moderator' | 'participant';
  joinedAt?: Date;
  leftAt?: Date;
  status: 'invited' | 'joined' | 'left';
}

class VideoConferenceManager {
  private activeMeetings: Map<string, VideoMeeting> = new Map();

  // Create a new video meeting
  async createMeeting(hostId: number, meetingData: {
    title: string;
    startTime: Date;
    duration: number;
    participants: { name: string; email: string; role?: 'moderator' | 'participant' }[];
    settings?: Partial<VideoMeeting['settings']>;
  }): Promise<VideoMeeting> {
    const meetingId = crypto.randomUUID();
    const roomUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/meeting/${meetingId}`;

    const meeting: VideoMeeting = {
      id: meetingId,
      title: meetingData.title,
      hostId,
      startTime: meetingData.startTime,
      duration: meetingData.duration,
      participants: meetingData.participants.map(p => ({
        id: crypto.randomUUID(),
        name: p.name,
        email: p.email,
        role: p.role || 'participant',
        status: 'invited'
      })),
      roomUrl,
      status: 'scheduled',
      settings: {
        enableRecording: true,
        enableScreenShare: true,
        enableChat: true,
        waitingRoom: false,
        maxParticipants: 50,
        ...meetingData.settings
      }
    };

    this.activeMeetings.set(meetingId, meeting);
    console.log(`[VideoConference] Meeting created: ${meeting.title} (${meetingId})`);

    return meeting;
  }

  // Join a meeting
  async joinMeeting(meetingId: string, participantData: {
    name: string;
    email: string;
  }): Promise<{ success: boolean; meeting?: VideoMeeting; error?: string }> {
    const meeting = this.activeMeetings.get(meetingId);
    
    if (!meeting) {
      return { success: false, error: 'Meeting not found' };
    }

    if (meeting.status === 'ended') {
      return { success: false, error: 'Meeting has ended' };
    }

    // Check if participant is invited or if it's an open meeting
    const existingParticipant = meeting.participants.find(p => p.email === participantData.email);
    
    if (existingParticipant) {
      existingParticipant.status = 'joined';
      existingParticipant.joinedAt = new Date();
    } else {
      // Add as new participant if under limit
      if (meeting.participants.length >= meeting.settings.maxParticipants) {
        return { success: false, error: 'Meeting is at capacity' };
      }

      meeting.participants.push({
        id: crypto.randomUUID(),
        name: participantData.name,
        email: participantData.email,
        role: 'participant',
        status: 'joined',
        joinedAt: new Date()
      });
    }

    // Start meeting if host joins
    if (meeting.status === 'scheduled') {
      meeting.status = 'active';
    }

    console.log(`[VideoConference] ${participantData.name} joined meeting: ${meeting.title}`);
    
    return { success: true, meeting };
  }

  // Get meeting details
  getMeeting(meetingId: string): VideoMeeting | undefined {
    return this.activeMeetings.get(meetingId);
  }

  // Get all meetings for a user
  getUserMeetings(userId: number): VideoMeeting[] {
    return Array.from(this.activeMeetings.values())
      .filter(meeting => 
        meeting.hostId === userId || 
        meeting.participants.some(p => p.email.includes('@'))
      );
  }
}

export const videoConferenceManager = new VideoConferenceManager();

// Express routes for video conferencing
export function setupVideoConferenceRoutes(app: express.Application) {
  // Create meeting
  app.post('/api/meetings/create', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { title, startTime, duration, participants, settings } = req.body;
      
      const meeting = await videoConferenceManager.createMeeting(req.user.id, {
        title,
        startTime: new Date(startTime),
        duration,
        participants,
        settings
      });

      res.json({ success: true, meeting });
    } catch (error) {
      console.error('[VideoConference] Create meeting error:', error);
      res.status(500).json({ error: 'Failed to create meeting' });
    }
  });

  // Join meeting
  app.post('/api/meetings/:id/join', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const result = await videoConferenceManager.joinMeeting(id, { name, email });
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('[VideoConference] Join meeting error:', error);
      res.status(500).json({ error: 'Failed to join meeting' });
    }
  });

  // Get meeting details
  app.get('/api/meetings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const meeting = videoConferenceManager.getMeeting(id);
      
      if (meeting) {
        res.json(meeting);
      } else {
        res.status(404).json({ error: 'Meeting not found' });
      }
    } catch (error) {
      console.error('[VideoConference] Get meeting error:', error);
      res.status(500).json({ error: 'Failed to get meeting' });
    }
  });
}