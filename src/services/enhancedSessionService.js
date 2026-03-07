import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { sessionService } from './sessionService'; // import base

export const enhancedSessionService = {
  // Re‑export base methods
  ...sessionService,

  // Create session with Google Meet integration
  createMeetSession: async (sessionData) => {
    try {
      console.log('🔄 Creating Google Meet session:', sessionData.topic);

      // Generate a unique Meet-like ID
      const meetId = generateMeetId();
      const meetLink = `https://meet.google.com/${meetId}`;

      const session = {
        meetLink: meetLink,
        meetId: meetId,
        topic: sessionData.topic,
        description: sessionData.description || '',
        date: Timestamp.fromDate(new Date(sessionData.date)),
        duration: sessionData.duration || 60,
        
        // Teacher info
        teacherId: sessionData.teacherId,
        teacherName: sessionData.teacherName,
        createdBy: sessionData.teacherId,
        
        // Session settings
        settings: {
          allowRecording: sessionData.allowRecording ?? true,
          enableWaitingRoom: sessionData.enableWaitingRoom ?? true,
          allowScreenShare: sessionData.allowScreenShare ?? true,
          maxParticipants: sessionData.maxParticipants || 50
        },
        
        // Status
        status: 'scheduled',
        isRecorded: false,
        recordingUrl: '',
        
        // Participants
        participants: [],
        participantCount: 0,
        invitedStudents: sessionData.invitedStudents || [],
        
        // Course relation
        courseId: sessionData.courseId || null,
        courseName: sessionData.courseName || '',
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'sessions'), session);
      console.log('✅ Google Meet session created:', docRef.id);

      return {
        success: true,
        id: docRef.id,
        meetLink: meetLink,
        meetId: meetId,
        ...session
      };

    } catch (error) {
      console.error('❌ Error generating Meet session:', error);
      throw new Error(`Failed to create Google Meet session: ${error.message}`);
    }
  },

  // Get sessions for a specific teacher
  getTeacherSessions: async (teacherId, options = {}) => {
    try {
      console.log('🔄 Fetching teacher sessions:', teacherId);
      
      const {
        status = 'all',
        limit = 50,
        dateRange = 'all'
      } = options;

      let sessionsQuery = query(
        collection(db, 'sessions'), 
        where('teacherId', '==', teacherId),
        orderBy('date', 'desc')
      );

      if (status !== 'all') {
        sessionsQuery = query(sessionsQuery, where('status', '==', status));
      }

      if (dateRange === 'upcoming') {
        sessionsQuery = query(sessionsQuery, where('date', '>=', Timestamp.now()));
      } else if (dateRange === 'past') {
        sessionsQuery = query(sessionsQuery, where('date', '<', Timestamp.now()));
      }

      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = [];
      
      sessionsSnapshot.forEach(doc => {
        const sessionData = doc.data();
        sessions.push({
          id: doc.id,
          ...sessionData,
          date: sessionData.date?.toDate?.(),
          createdAt: sessionData.createdAt?.toDate?.(),
          updatedAt: sessionData.updatedAt?.toDate?.()
        });
      });

      console.log(`✅ Fetched ${sessions.length} sessions for teacher: ${teacherId}`);
      return sessions;
    } catch (error) {
      console.error('❌ Error fetching teacher sessions:', error);
      throw new Error(`Failed to fetch teacher sessions: ${error.message}`);
    }
  },

  // Get session analytics for teacher dashboard
  getTeacherSessionAnalytics: async (teacherId) => {
    try {
      console.log('🔄 Fetching teacher session analytics:', teacherId);
      
      const sessions = await enhancedSessionService.getTeacherSessions(teacherId, { dateRange: 'all' });
      
      const now = new Date();
      const pastSessions = sessions.filter(s => new Date(s.date) < now);
      const upcomingSessions = sessions.filter(s => new Date(s.date) >= now);
      
      // Get unique students from all sessions
      const allParticipants = sessions.flatMap(session => session.participants || []);
      const uniqueStudentIds = [...new Set(allParticipants.map(p => p.id || p.userId || p))].filter(Boolean);
      
      const analytics = {
        totalSessions: sessions.length,
        pastSessions: pastSessions.length,
        upcomingSessions: upcomingSessions.length,
        recordedSessions: sessions.filter(s => s.isRecorded).length,
        averageAttendance: pastSessions.length > 0 
          ? pastSessions.reduce((sum, session) => sum + (session.participantCount || 0), 0) / pastSessions.length
          : 0,
        totalStudents: uniqueStudentIds.length,
        totalParticipants: pastSessions.reduce((sum, session) => sum + (session.participantCount || 0), 0),
        completionRate: pastSessions.length > 0 
          ? (pastSessions.filter(s => s.status === 'completed').length / pastSessions.length) * 100
          : 0,
        
        // Recent activity
        recentSessions: sessions.slice(0, 5),
        popularSessions: [...sessions]
          .sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))
          .slice(0, 5)
      };

      console.log('✅ Teacher analytics fetched:', analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching teacher analytics:', error);
      throw new Error(`Failed to fetch teacher analytics: ${error.message}`);
    }
  },
};

// Helper function to generate Meet-like ID
const generateMeetId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result.slice(0, 3)}-${result.slice(3, 7)}-${result.slice(7)}`;
};

export default enhancedSessionService;