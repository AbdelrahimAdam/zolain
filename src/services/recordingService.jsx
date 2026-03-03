import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
  Timestamp,
  getCountFromServer,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from '../config/firebase'

// YouTube URL helpers
const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?([a-zA-Z0-9_-]{11})(\S*)?$/;
const YOUTUBE_EMBED_BASE = 'https://www.youtube.com/embed/';

// Utility functions
const generateVideoId = () => `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const sanitizeVideoData = (data) => {
  const sanitized = { ...data };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });
  return sanitized;
};

const convertToTimestamp = (date) => {
  if (!date) return null;
  if (date instanceof Date) return Timestamp.fromDate(date);
  if (typeof date === 'string') return Timestamp.fromDate(new Date(date));
  return date;
};

/**
 * Extract YouTube video ID from various URL formats
 */
export const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Generate YouTube embed URL from a video ID or full URL
 */
export const getYouTubeEmbedUrl = (url) => {
  const videoId = extractYouTubeId(url);
  return videoId ? `${YOUTUBE_EMBED_BASE}${videoId}` : null;
};

/**
 * Validate YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  return YOUTUBE_REGEX.test(url);
};

export const recordingService = {
  // ==================== VIDEO CRUD ====================

  // Create a new video (lesson) with YouTube integration
  createVideo: async (videoData) => {
    try {
      console.log('🔄 Creating video:', videoData.title);
      
      if (!videoData.title || !videoData.instructorId) {
        throw new Error('Video title and instructor ID are required');
      }

      const videoId = videoData.videoId || generateVideoId();
      const youtubeId = extractYouTubeId(videoData.videoUrl);
      const embedUrl = youtubeId ? `${YOUTUBE_EMBED_BASE}${youtubeId}` : '';

      const video = {
        // Core information
        title: videoData.title.trim(),
        description: videoData.description || '',
        videoId: videoId,
        
        // YouTube specific
        videoUrl: videoData.videoUrl || '',
        youtubeId: youtubeId,
        embedUrl: embedUrl,
        thumbnailUrl: videoData.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        duration: videoData.duration || 0, // in seconds
        
        // Course association
        courseId: videoData.courseId || 'general',
        sectionId: videoData.sectionId || null,
        order: videoData.order || 0,
        
        // Status and visibility
        isPublished: videoData.isPublished ?? false,
        isFree: videoData.isFree ?? true,
        visibility: videoData.visibility || 'enrolled', // enrolled, public, private
        
        // Instructor info
        instructorId: videoData.instructorId,
        instructorName: videoData.instructorName || '',
        
        // Metadata and analytics
        views: 0,
        likes: 0,
        averageRating: 0,
        totalRatings: 0,
        
        // Categorization
        category: videoData.category || 'general',
        tags: videoData.tags || [],
        level: videoData.level || 'beginner',
        
        // Student progress tracking
        studentProgress: {},
        completedBy: [],
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: videoData.isPublished ? serverTimestamp() : null,
        
        // SEO
        slug: videoData.slug || videoData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      };

      const sanitized = sanitizeVideoData(video);
      const docRef = await addDoc(collection(db, 'videos'), sanitized);
      console.log('✅ Video created successfully:', docRef.id);
      
      return {
        success: true,
        id: docRef.id,
        ...sanitized
      };
    } catch (error) {
      console.error('❌ Error creating video:', error);
      throw new Error(`Failed to create video: ${error.message}`);
    }
  },

  // Alias for backward compatibility
  createRecording: async (data) => {
    return recordingService.createVideo(data);
  },

  // Get video by ID
  getVideoById: async (videoId) => {
    try {
      console.log('🔄 Fetching video:', videoId);
      
      if (!videoId) throw new Error('Video ID is required');
      const docRef = doc(db, 'videos', videoId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.warn('⚠️ Video not found:', videoId);
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.(),
        updatedAt: data.updatedAt?.toDate?.(),
        publishedAt: data.publishedAt?.toDate?.()
      };
    } catch (error) {
      console.error('❌ Error fetching video:', error);
      throw new Error(`Failed to fetch video: ${error.message}`);
    }
  },

  getRecordingById: async (recordingId) => {
    return recordingService.getVideoById(recordingId);
  },

  // Get published videos for students
  getPublishedVideos: async (options = {}) => {
    try {
      console.log('🔄 Fetching published videos');
      const { limit: resultLimit = 20, courseId = null, category = 'all' } = options;

      let q = query(
        collection(db, 'videos'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        limit(resultLimit)
      );

      if (courseId) {
        q = query(q, where('courseId', '==', courseId));
      }
      if (category !== 'all') {
        q = query(q, where('category', '==', category));
      }

      const snapshot = await getDocs(q);
      const videos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.(),
          updatedAt: data.updatedAt?.toDate?.(),
          publishedAt: data.publishedAt?.toDate?.()
        };
      });

      console.log(`✅ Fetched ${videos.length} published videos`);
      return videos;
    } catch (error) {
      console.error('❌ Error fetching published videos:', error);
      throw new Error(`Failed to fetch published videos: ${error.message}`);
    }
  },

  getAvailableRecordings: async (options) => {
    return recordingService.getPublishedVideos(options);
  },

  // Get videos for a teacher (all their videos)
  getTeacherVideos: async (teacherId, options = {}) => {
    try {
      console.log('🔄 Fetching teacher videos:', teacherId);
      const { limit: resultLimit = 50, status = 'all' } = options;

      let q = query(
        collection(db, 'videos'),
        where('instructorId', '==', teacherId),
        orderBy('createdAt', 'desc'),
        limit(resultLimit)
      );

      if (status !== 'all') {
        q = query(q, where('isPublished', '==', (status === 'published')));
      }

      const snapshot = await getDocs(q);
      const videos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.(),
          updatedAt: data.updatedAt?.toDate?.(),
          publishedAt: data.publishedAt?.toDate?.()
        };
      });

      console.log(`✅ Fetched ${videos.length} teacher videos`);
      return videos;
    } catch (error) {
      console.error('❌ Error fetching teacher videos:', error);
      throw new Error(`Failed to fetch teacher videos: ${error.message}`);
    }
  },

  getTeacherRecordings: async (options) => {
    const { teacherId, ...rest } = options;
    return recordingService.getTeacherVideos(teacherId, rest);
  },

  // Get videos for a student (based on enrolled courses)
  getStudentVideos: async (studentId, options = {}) => {
    try {
      console.log('🔄 Fetching student videos:', studentId);
      const { limit: resultLimit = 50, courseIds = [] } = options;

      let q = query(
        collection(db, 'videos'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        limit(resultLimit)
      );

      if (courseIds.length > 0) {
        q = query(q, where('courseId', 'in', courseIds));
      }

      const snapshot = await getDocs(q);
      const videos = snapshot.docs.map(doc => {
        const data = doc.data();
        const watched = data.studentProgress?.[studentId]?.watched || false;
        const progress = data.studentProgress?.[studentId]?.progress || 0;
        return {
          id: doc.id,
          ...data,
          watched,
          progress,
          createdAt: data.createdAt?.toDate?.(),
          updatedAt: data.updatedAt?.toDate?.(),
          publishedAt: data.publishedAt?.toDate?.()
        };
      });

      console.log(`✅ Fetched ${videos.length} student videos`);
      return videos;
    } catch (error) {
      console.error('❌ Error fetching student videos:', error);
      throw new Error(`Failed to fetch student videos: ${error.message}`);
    }
  },

  getStudentRecordings: async (options) => {
    const { studentId, ...rest } = options;
    return recordingService.getStudentVideos(studentId, rest);
  },

  // Update video
  updateVideo: async (videoId, updates) => {
    try {
      console.log('🔄 Updating video:', videoId);
      
      if (!videoId) throw new Error('Video ID is required');

      const allowedFields = [
        'title', 'description', 'videoUrl', 'youtubeId', 'embedUrl', 'thumbnailUrl',
        'duration', 'courseId', 'sectionId', 'order', 'isPublished', 'isFree',
        'visibility', 'category', 'tags', 'level'
      ];

      const filtered = {};
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) filtered[key] = updates[key];
      });

      // If videoUrl is updated, recalc youtubeId and embedUrl
      if (updates.videoUrl) {
        const youtubeId = extractYouTubeId(updates.videoUrl);
        if (youtubeId) {
          filtered.youtubeId = youtubeId;
          filtered.embedUrl = `${YOUTUBE_EMBED_BASE}${youtubeId}`;
          if (!updates.thumbnailUrl) {
            filtered.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
          }
        }
      }

      const updateData = {
        ...filtered,
        updatedAt: serverTimestamp()
      };

      if (updates.isPublished && !updates.publishedAt) {
        const current = await recordingService.getVideoById(videoId);
        if (current && !current.publishedAt) {
          updateData.publishedAt = serverTimestamp();
        }
      }

      await updateDoc(doc(db, 'videos', videoId), updateData);
      console.log('✅ Video updated successfully:', videoId);
      
      return { success: true, videoId, updatedFields: Object.keys(filtered) };
    } catch (error) {
      console.error('❌ Error updating video:', error);
      throw new Error(`Failed to update video: ${error.message}`);
    }
  },

  updateRecording: async (recordingId, updates) => {
    return recordingService.updateVideo(recordingId, updates);
  },

  // Publish/unpublish
  publishVideo: async (videoId) => {
    try {
      console.log('🔄 Publishing video:', videoId);
      await updateDoc(doc(db, 'videos', videoId), {
        isPublished: true,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, videoId };
    } catch (error) {
      console.error('❌ Error publishing video:', error);
      throw new Error(`Failed to publish video: ${error.message}`);
    }
  },

  unpublishVideo: async (videoId) => {
    try {
      console.log('🔄 Unpublishing video:', videoId);
      await updateDoc(doc(db, 'videos', videoId), {
        isPublished: false,
        updatedAt: serverTimestamp()
      });
      return { success: true, videoId };
    } catch (error) {
      console.error('❌ Error unpublishing video:', error);
      throw new Error(`Failed to unpublish video: ${error.message}`);
    }
  },

  // Student progress tracking
  updateStudentProgress: async (videoId, studentId, progressData) => {
    try {
      console.log('🔄 Updating student progress:', { videoId, studentId });
      
      const updateData = {
        [`studentProgress.${studentId}`]: {
          progress: progressData.progress || 0,
          watched: progressData.watched || false,
          lastWatched: serverTimestamp(),
          completedAt: progressData.progress >= 95 ? serverTimestamp() : null,
          ...progressData
        },
        updatedAt: serverTimestamp()
      };

      if (progressData.progress >= 95) {
        const video = await recordingService.getVideoById(videoId);
        if (video && !video.completedBy?.includes(studentId)) {
          updateData.completedBy = arrayUnion(studentId);
        }
      }

      await updateDoc(doc(db, 'videos', videoId), updateData);
      console.log('✅ Student progress updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating student progress:', error);
      throw new Error(`Failed to update progress: ${error.message}`);
    }
  },

  // Increment views
  incrementViews: async (videoId) => {
    try {
      const video = await recordingService.getVideoById(videoId);
      if (!video) return;
      const newViews = (video.views || 0) + 1;
      await updateDoc(doc(db, 'videos', videoId), {
        views: newViews,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error incrementing views:', error);
    }
  },

  // Rating
  updateRating: async (videoId, rating, studentId) => {
    try {
      console.log('🔄 Updating rating:', { videoId, rating });
      const video = await recordingService.getVideoById(videoId);
      if (!video) throw new Error('Video not found');

      const totalRatings = (video.totalRatings || 0) + 1;
      const averageRating = ((video.averageRating || 0) * (totalRatings - 1) + rating) / totalRatings;

      const updateData = {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        updatedAt: serverTimestamp()
      };

      if (studentId) {
        updateData[`ratings.${studentId}`] = { rating, ratedAt: serverTimestamp() };
      }

      await updateDoc(doc(db, 'videos', videoId), updateData);
      return { success: true, averageRating, totalRatings };
    } catch (error) {
      console.error('❌ Error updating rating:', error);
      throw new Error(`Failed to update rating: ${error.message}`);
    }
  },

  // Get video statistics
  getVideoStats: async (instructorId = null) => {
    try {
      console.log('🔄 Fetching video statistics');
      
      let baseQuery = collection(db, 'videos');
      if (instructorId) {
        baseQuery = query(baseQuery, where('instructorId', '==', instructorId));
      }

      const [total, published, allVideos] = await Promise.all([
        getCountFromServer(baseQuery),
        getCountFromServer(query(baseQuery, where('isPublished', '==', true))),
        recordingService.getAllVideos({ limit: 1000, instructorId })
      ]);

      const stats = {
        total: total.data().count,
        published: published.data().count,
        totalViews: allVideos.reduce((sum, v) => sum + (v.views || 0), 0),
        totalDuration: allVideos.reduce((sum, v) => sum + (v.duration || 0), 0),
        averageRating: allVideos.length > 0 
          ? allVideos.reduce((sum, v) => sum + (v.averageRating || 0), 0) / allVideos.length
          : 0,
        categories: allVideos.reduce((acc, v) => {
          const cat = v.category || 'uncategorized';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {}),
        levels: allVideos.reduce((acc, v) => {
          const lvl = v.level || 'unknown';
          acc[lvl] = (acc[lvl] || 0) + 1;
          return acc;
        }, {})
      };

      console.log('✅ Video statistics fetched:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching video statistics:', error);
      throw new Error(`Failed to fetch video statistics: ${error.message}`);
    }
  },

  getAllVideos: async (options = {}) => {
    try {
      console.log('🔄 Fetching all videos with options:', options);
      const { limit: resultLimit = 50, instructorId = null, status = 'all' } = options;

      let q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(resultLimit));
      if (instructorId) q = query(q, where('instructorId', '==', instructorId));
      if (status !== 'all') q = query(q, where('isPublished', '==', (status === 'published')));

      const snapshot = await getDocs(q);
      const videos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.(),
          updatedAt: data.updatedAt?.toDate?.(),
          publishedAt: data.publishedAt?.toDate?.()
        };
      });
      return videos;
    } catch (error) {
      console.error('❌ Error fetching all videos:', error);
      throw new Error(`Failed to fetch videos: ${error.message}`);
    }
  },

  // YouTube workflow helpers
  youtubeWorkflow: {
    getUploadSteps: () => [
      "1. Go to YouTube Studio",
      "2. Click 'Create' → 'Upload videos'",
      "3. Select your recorded video file",
      "4. Set visibility to 'Unlisted' or 'Private'",
      "5. Add title, description, and tags",
      "6. Click 'Publish' or 'Save'",
      "7. Copy the video URL from the browser",
      "8. Paste the link in this form"
    ],

    getShareableLinkSteps: () => [
      "1. Open the video in YouTube",
      "2. Click 'Share' below the video",
      "3. Copy the link",
      "4. Paste it here"
    ],

    validateYouTubeUrl: isValidYouTubeUrl,
    extractYouTubeId,
    getYouTubeEmbedUrl
  }
};

// Named exports
export const createVideo = recordingService.createVideo;
export const getVideoById = recordingService.getVideoById;
export const getPublishedVideos = recordingService.getPublishedVideos;
export const getTeacherVideos = recordingService.getTeacherVideos;
export const getStudentVideos = recordingService.getStudentVideos;
export const updateVideo = recordingService.updateVideo;
export const publishVideo = recordingService.publishVideo;
export const unpublishVideo = recordingService.unpublishVideo;
export const updateStudentProgress = recordingService.updateStudentProgress;
export const incrementViews = recordingService.incrementViews;
export const updateRating = recordingService.updateRating;
export const getVideoStats = recordingService.getVideoStats;

export default recordingService;