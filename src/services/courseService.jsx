import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc,
  setDoc, 
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
  increment,
  FieldPath
} from 'firebase/firestore'
import { db } from '../config/firebase'

const courseService = {
  // ==================== COURSE CRUD ====================

  // Create a new course with comprehensive validation
  createCourse: async (courseData) => {
    try {
      console.log('🔄 Creating course:', courseData.title);
      
      // Validate required fields
      if (!courseData.title || !courseData.createdBy) {
        throw new Error('Course title and creator are required');
      }

      const course = {
        // Core course information
        title: courseData.title.trim(),
        description: courseData.description || '',
        shortDescription: courseData.shortDescription || courseData.description?.substring(0, 150) || '',
        
        // Course metadata
        category: courseData.category || 'general',
        level: courseData.level || 'beginner', // beginner, intermediate, advanced
        language: courseData.language || 'en',
        tags: courseData.tags || [],
        
        // Media and assets
        thumbnailUrl: courseData.thumbnailUrl || '',
        promoVideoUrl: courseData.promoVideoUrl || '',
        
        // Pricing and access
        isFree: courseData.isFree ?? true,
        price: courseData.price || 0,
        currency: courseData.currency || 'USD',
        accessType: courseData.accessType || 'public', // public, private, enrolled
        
        // Status and visibility
        isPublished: courseData.isPublished ?? false,
        isFeatured: courseData.isFeatured ?? false,
        status: courseData.status || 'draft', // draft, published, archived
        
        // Instructor information
        instructorId: courseData.instructorId,
        instructorName: courseData.instructorName,
        instructorBio: courseData.instructorBio || '',
        
        // Course structure
        sections: courseData.sections || [],
        totalLessons: courseData.totalLessons || 0,
        totalDuration: courseData.totalDuration || 0, // in minutes
        resources: courseData.resources || [],
        
        // Analytics and engagement
        studentsEnrolled: 0,
        totalRatings: 0,
        averageRating: 0,
        completionRate: 0,
        totalViews: 0,
        
        // Requirements and outcomes
        requirements: courseData.requirements || [],
        learningOutcomes: courseData.learningOutcomes || [],
        targetAudience: courseData.targetAudience || [],
        
        // Timestamps and metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: null,
        createdBy: courseData.createdBy,
        
        // SEO and discoverability
        slug: courseData.slug || courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        metaTitle: courseData.metaTitle || courseData.title,
        metaDescription: courseData.metaDescription || courseData.description?.substring(0, 160) || '',
        
        // Settings and configuration
        settings: {
          allowDownloads: courseData.settings?.allowDownloads ?? true,
          enableDiscussions: courseData.settings?.enableDiscussions ?? true,
          enableCertificates: courseData.settings?.enableCertificates ?? false,
          requiresApproval: courseData.settings?.requiresApproval ?? false,
          maxStudents: courseData.settings?.maxStudents || 0, // 0 = unlimited
          ...courseData.settings
        }
      };

      const docRef = await addDoc(collection(db, 'courses'), course);
      console.log('✅ Course created successfully:', docRef.id);
      
      return {
        success: true,
        id: docRef.id,
        ...course
      };
    } catch (error) {
      console.error('❌ Error creating course:', error);
      throw new Error(`Failed to create course: ${error.message}`);
    }
  },

  // Get course by ID with comprehensive data
  getCourseById: async (courseId) => {
    try {
      console.log('🔄 Fetching course:', courseId);
      
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      
      if (!courseDoc.exists()) {
        console.warn('⚠️ Course not found:', courseId);
        return null;
      }

      const courseData = courseDoc.data();
      
      const transformedCourse = {
        id: courseDoc.id,
        ...courseData,
        createdAt: courseData.createdAt?.toDate?.(),
        updatedAt: courseData.updatedAt?.toDate?.(),
        publishedAt: courseData.publishedAt?.toDate?.()
      };

      console.log('✅ Course fetched successfully:', courseId);
      return transformedCourse;
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      throw new Error(`Failed to fetch course: ${error.message}`);
    }
  },

  // Get all courses with advanced filtering and pagination
  getAllCourses: async (options = {}) => {
    try {
      console.log('🔄 Fetching all courses with options:', options);
      
      const {
        limit: resultLimit = 50,
        status = 'all', // all, published, draft, archived
        category = 'all',
        level = 'all',
        isFeatured = 'all', // all, featured, not_featured
        instructorId = null,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        searchTerm = ''
      } = options;

      let coursesQuery = query(collection(db, 'courses'), orderBy(sortBy, sortOrder));

      if (status !== 'all') {
        if (status === 'published') {
          coursesQuery = query(coursesQuery, where('isPublished', '==', true));
        } else if (status === 'draft') {
          coursesQuery = query(coursesQuery, where('isPublished', '==', false));
        } else if (status === 'archived') {
          coursesQuery = query(coursesQuery, where('status', '==', 'archived'));
        }
      }

      if (category !== 'all') {
        coursesQuery = query(coursesQuery, where('category', '==', category));
      }

      if (level !== 'all') {
        coursesQuery = query(coursesQuery, where('level', '==', level));
      }

      if (isFeatured !== 'all') {
        coursesQuery = query(coursesQuery, where('isFeatured', '==', (isFeatured === 'featured')));
      }

      if (instructorId) {
        coursesQuery = query(coursesQuery, where('instructorId', '==', instructorId));
      }

      coursesQuery = query(coursesQuery, limit(resultLimit));

      const snapshot = await getDocs(coursesQuery);
      const courses = snapshot.docs.map(doc => {
        const courseData = doc.data();
        return {
          id: doc.id,
          ...courseData,
          createdAt: courseData.createdAt?.toDate?.(),
          updatedAt: courseData.updatedAt?.toDate?.(),
          publishedAt: courseData.publishedAt?.toDate?.()
        };
      });

      let filteredCourses = courses;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredCourses = courses.filter(course => 
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower) ||
          course.shortDescription?.toLowerCase().includes(searchLower) ||
          course.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
          course.instructorName?.toLowerCase().includes(searchLower)
        );
      }

      console.log(`✅ Fetched ${filteredCourses.length} courses`);
      return filteredCourses;
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }
  },

  // Get published courses (public catalog)
  getPublishedCourses: async (resultLimit = 20) => {
    try {
      console.log('🔄 Fetching published courses');
      
      const coursesQuery = query(
        collection(db, 'courses'),
        where('isPublished', '==', true),
        where('status', '!=', 'archived'),
        orderBy('createdAt', 'desc'),
        limit(resultLimit)
      );

      const snapshot = await getDocs(coursesQuery);
      const courses = snapshot.docs.map(doc => {
        const courseData = doc.data();
        return {
          id: doc.id,
          ...courseData,
          createdAt: courseData.createdAt?.toDate?.(),
          updatedAt: courseData.updatedAt?.toDate?.(),
          publishedAt: courseData.publishedAt?.toDate?.()
        };
      });

      console.log(`✅ Fetched ${courses.length} published courses`);
      return courses;
    } catch (error) {
      console.error('❌ Error fetching published courses:', error);
      throw new Error(`Failed to fetch published courses: ${error.message}`);
    }
  },

  // Get courses by category
  getCoursesByCategory: async (category, resultLimit = 20) => {
    try {
      console.log('🔄 Fetching courses by category:', category);
      
      const coursesQuery = query(
        collection(db, 'courses'),
        where('category', '==', category),
        where('isPublished', '==', true),
        where('status', '!=', 'archived'),
        orderBy('createdAt', 'desc'),
        limit(resultLimit)
      );

      const snapshot = await getDocs(coursesQuery);
      const courses = snapshot.docs.map(doc => {
        const courseData = doc.data();
        return {
          id: doc.id,
          ...courseData,
          createdAt: courseData.createdAt?.toDate?.(),
          updatedAt: courseData.updatedAt?.toDate?.(),
          publishedAt: courseData.publishedAt?.toDate?.()
        };
      });

      console.log(`✅ Fetched ${courses.length} courses in category: ${category}`);
      return courses;
    } catch (error) {
      console.error('❌ Error fetching courses by category:', error);
      throw new Error(`Failed to fetch courses by category: ${error.message}`);
    }
  },

  // Get courses by level
  getCoursesByLevel: async (level, resultLimit = 20) => {
    try {
      console.log('🔄 Fetching courses by level:', level);
      
      const coursesQuery = query(
        collection(db, 'courses'),
        where('level', '==', level),
        where('isPublished', '==', true),
        where('status', '!=', 'archived'),
        orderBy('createdAt', 'desc'),
        limit(resultLimit)
      );

      const snapshot = await getDocs(coursesQuery);
      const courses = snapshot.docs.map(doc => {
        const courseData = doc.data();
        return {
          id: doc.id,
          ...courseData,
          createdAt: courseData.createdAt?.toDate?.(),
          updatedAt: courseData.updatedAt?.toDate?.(),
          publishedAt: courseData.publishedAt?.toDate?.()
        };
      });

      console.log(`✅ Fetched ${courses.length} courses for level: ${level}`);
      return courses;
    } catch (error) {
      console.error('❌ Error fetching courses by level:', error);
      throw new Error(`Failed to fetch courses by level: ${error.message}`);
    }
  },

  // Get courses by instructor
  getCoursesByInstructor: async (instructorId, options = {}) => {
    try {
      console.log('🔄 Fetching courses by instructor:', instructorId);
      
      const {
        limit: resultLimit = 50,
        status = 'all'
      } = options;

      let coursesQuery = query(
        collection(db, 'courses'),
        where('instructorId', '==', instructorId),
        orderBy('createdAt', 'desc')
      );

      if (status !== 'all') {
        if (status === 'published') {
          coursesQuery = query(coursesQuery, where('isPublished', '==', true));
        } else if (status === 'draft') {
          coursesQuery = query(coursesQuery, where('isPublished', '==', false));
        }
      }

      coursesQuery = query(coursesQuery, limit(resultLimit));

      const snapshot = await getDocs(coursesQuery);
      const courses = snapshot.docs.map(doc => {
        const courseData = doc.data();
        return {
          id: doc.id,
          ...courseData,
          createdAt: courseData.createdAt?.toDate?.(),
          updatedAt: courseData.updatedAt?.toDate?.(),
          publishedAt: courseData.publishedAt?.toDate?.()
        };
      });

      console.log(`✅ Fetched ${courses.length} courses for instructor: ${instructorId}`);
      return courses;
    } catch (error) {
      console.error('❌ Error fetching instructor courses:', error);
      throw new Error(`Failed to fetch instructor courses: ${error.message}`);
    }
  },

  // Get featured courses
  getFeaturedCourses: async (resultLimit = 10) => {
    try {
      console.log('🔄 Fetching featured courses');
      
      const coursesQuery = query(
        collection(db, 'courses'),
        where('isPublished', '==', true),
        where('isFeatured', '==', true),
        where('status', '!=', 'archived'),
        orderBy('createdAt', 'desc'),
        limit(resultLimit)
      );

      const snapshot = await getDocs(coursesQuery);
      const courses = snapshot.docs.map(doc => {
        const courseData = doc.data();
        return {
          id: doc.id,
          ...courseData,
          createdAt: courseData.createdAt?.toDate?.(),
          updatedAt: courseData.updatedAt?.toDate?.(),
          publishedAt: courseData.publishedAt?.toDate?.()
        };
      });

      console.log(`✅ Fetched ${courses.length} featured courses`);
      return courses;
    } catch (error) {
      console.error('❌ Error fetching featured courses:', error);
      throw new Error(`Failed to fetch featured courses: ${error.message}`);
    }
  },

  // ==================== UPDATE / DELETE ====================

  // Update course with comprehensive validation
  updateCourse: async (courseId, updates) => {
    try {
      console.log('🔄 Updating course:', courseId);
      
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      const allowedFields = [
        'title', 'description', 'shortDescription', 'category', 'level', 'language',
        'tags', 'thumbnailUrl', 'promoVideoUrl', 'isFree', 'price', 'currency',
        'accessType', 'isPublished', 'isFeatured', 'status', 'instructorName',
        'instructorBio', 'sections', 'totalLessons', 'totalDuration', 'resources',
        'requirements', 'learningOutcomes', 'targetAudience', 'slug',
        'metaTitle', 'metaDescription', 'settings'
      ];

      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const updateData = {
        ...filteredUpdates,
        updatedAt: serverTimestamp()
      };

      if (updates.isPublished && !updates.publishedAt) {
        const course = await courseService.getCourseById(courseId);
        if (course && !course.publishedAt) {
          updateData.publishedAt = serverTimestamp();
        }
      }

      await updateDoc(doc(db, 'courses', courseId), updateData);
      console.log('✅ Course updated successfully:', courseId);
      
      return {
        success: true,
        courseId,
        updatedFields: Object.keys(filteredUpdates)
      };
    } catch (error) {
      console.error('❌ Error updating course:', error);
      throw new Error(`Failed to update course: ${error.message}`);
    }
  },

  // Publish course
  publishCourse: async (courseId) => {
    try {
      console.log('🔄 Publishing course:', courseId);
      
      const updateData = {
        isPublished: true,
        status: 'published',
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'courses', courseId), updateData);
      console.log('✅ Course published successfully:', courseId);
      
      return {
        success: true,
        courseId,
        publishedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Error publishing course:', error);
      throw new Error(`Failed to publish course: ${error.message}`);
    }
  },

  // Unpublish course
  unpublishCourse: async (courseId) => {
    try {
      console.log('🔄 Unpublishing course:', courseId);
      
      const updateData = {
        isPublished: false,
        status: 'draft',
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'courses', courseId), updateData);
      console.log('✅ Course unpublished successfully:', courseId);
      
      return {
        success: true,
        courseId
      };
    } catch (error) {
      console.error('❌ Error unpublishing course:', error);
      throw new Error(`Failed to unpublish course: ${error.message}`);
    }
  },

  // Archive course
  archiveCourse: async (courseId) => {
    try {
      console.log('🔄 Archiving course:', courseId);
      
      const updateData = {
        status: 'archived',
        isPublished: false,
        isFeatured: false,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'courses', courseId), updateData);
      console.log('✅ Course archived successfully:', courseId);
      
      return {
        success: true,
        courseId,
        archivedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Error archiving course:', error);
      throw new Error(`Failed to archive course: ${error.message}`);
    }
  },

  // Delete course (soft delete by archiving)
  deleteCourse: async (courseId) => {
    try {
      console.log('🔄 Deleting course:', courseId);
      return await courseService.archiveCourse(courseId);
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  },

  // ==================== STUDENT ENROLLMENT & PROGRESS ====================

  /**
   * Get courses the student is enrolled in, with progress data
   */
  getEnrolledCourses: async (studentId) => {
    try {
      console.log('🔄 Fetching enrolled courses for student:', studentId);

      // Query enrollments collection
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        where('status', '==', 'active')
      );
      const enrollmentsSnap = await getDocs(enrollmentsQuery);
      const courseIds = enrollmentsSnap.docs.map(doc => doc.data().courseId);

      if (courseIds.length === 0) return [];

      // Fetch each course document
      const coursePromises = courseIds.map(async (courseId) => {
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        return courseDoc.exists() ? courseDoc : null;
      });
      const courseDocs = (await Promise.all(coursePromises)).filter(Boolean);

      // Merge enrollment data (progress, etc.)
      const enrolledCourses = courseDocs.map(doc => {
        const courseData = doc.data();
        const enrollment = enrollmentsSnap.docs.find(
          e => e.data().courseId === doc.id
        )?.data();
        return {
          id: doc.id,
          ...courseData,
          progress: enrollment?.progress || 0,
          enrolledAt: enrollment?.enrolledAt?.toDate?.(),
          lastAccessed: enrollment?.lastAccessed?.toDate?.(),
          completedAt: enrollment?.completedAt?.toDate?.(),
          createdAt: courseData.createdAt?.toDate?.(),
          updatedAt: courseData.updatedAt?.toDate?.(),
          publishedAt: courseData.publishedAt?.toDate?.()
        };
      });

      console.log(`✅ Fetched ${enrolledCourses.length} enrolled courses`);
      return enrolledCourses;
    } catch (error) {
      console.error('❌ Error fetching enrolled courses:', error);
      throw new Error(`Failed to fetch enrolled courses: ${error.message}`);
    }
  },

  /**
   * Enroll a student in a course
   */
  enrollStudent: async (courseId, studentId) => {
    try {
      console.log('🔄 Enrolling student:', studentId, 'in course:', courseId);

      // Check if already enrolled
      const enrollmentsRef = collection(db, 'enrollments');
      const q = query(
        enrollmentsRef,
        where('studentId', '==', studentId),
        where('courseId', '==', courseId)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        console.log('ℹ️ Student already enrolled');
        return { alreadyEnrolled: true };
      }

      // Create enrollment document
      const enrollmentRef = doc(enrollmentsRef);
      await setDoc(enrollmentRef, {
        studentId,
        courseId,
        enrolledAt: serverTimestamp(),
        progress: 0,
        status: 'active',
        lastAccessed: null,
        completedAt: null,
      });

      // Increment student count on course
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        studentsEnrolled: increment(1)
      });

      console.log('✅ Student enrolled successfully');
      return { success: true, enrollmentId: enrollmentRef.id };
    } catch (error) {
      console.error('❌ Error enrolling student:', error);
      throw new Error(`Failed to enroll: ${error.message}`);
    }
  },

  /**
   * Update student progress in a course
   */
  updateProgress: async (courseId, studentId, progress) => {
    try {
      console.log('🔄 Updating progress for student:', studentId, 'course:', courseId);

      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(enrollmentsQuery);
      if (snapshot.empty) {
        throw new Error('Enrollment not found');
      }

      const enrollmentDoc = snapshot.docs[0];
      const updateData = {
        progress,
        lastAccessed: serverTimestamp(),
      };
      if (progress >= 100) {
        updateData.completedAt = serverTimestamp();
        updateData.status = 'completed';
      }

      await updateDoc(enrollmentDoc.ref, updateData);

      console.log('✅ Progress updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      throw new Error(`Failed to update progress: ${error.message}`);
    }
  },

  /**
   * Get all available courses for a student (not yet enrolled)
   */
  getAvailableCourses: async (studentId, resultLimit = 20) => {
    try {
      console.log('🔄 Fetching available courses for student:', studentId);

      // First get enrolled course IDs
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId)
      );
      const enrollmentsSnap = await getDocs(enrollmentsQuery);
      const enrolledCourseIds = new Set(enrollmentsSnap.docs.map(doc => doc.data().courseId));

      // Get all published courses
      const coursesQuery = query(
        collection(db, 'courses'),
        where('isPublished', '==', true),
        where('status', '!=', 'archived'),
        orderBy('createdAt', 'desc'),
        limit(resultLimit)
      );
      const snapshot = await getDocs(coursesQuery);
      
      const courses = snapshot.docs
        .map(doc => {
          const courseData = doc.data();
          return {
            id: doc.id,
            ...courseData,
            isEnrolled: enrolledCourseIds.has(doc.id),
            createdAt: courseData.createdAt?.toDate?.(),
            updatedAt: courseData.updatedAt?.toDate?.(),
            publishedAt: courseData.publishedAt?.toDate?.()
          };
        })
        .filter(course => !course.isEnrolled); // only those not enrolled

      console.log(`✅ Fetched ${courses.length} available courses`);
      return courses;
    } catch (error) {
      console.error('❌ Error fetching available courses:', error);
      throw new Error(`Failed to fetch available courses: ${error.message}`);
    }
  },

  // ==================== ANALYTICS & STATISTICS ====================

  // Update enrollment count
  updateEnrollmentCount: async (courseId, change = 1) => {
    try {
      console.log('🔄 Updating enrollment count for course:', courseId);
      
      const course = await courseService.getCourseById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      const newCount = (course.studentsEnrolled || 0) + change;
      
      await updateDoc(doc(db, 'courses', courseId), {
        studentsEnrolled: newCount,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Enrollment count updated:', { courseId, newCount });
      
      return {
        success: true,
        courseId,
        studentsEnrolled: newCount
      };
    } catch (error) {
      console.error('❌ Error updating enrollment count:', error);
      throw new Error(`Failed to update enrollment count: ${error.message}`);
    }
  },

  // Update course rating
  updateCourseRating: async (courseId, newRating) => {
    try {
      console.log('🔄 Updating course rating:', { courseId, newRating });
      
      const course = await courseService.getCourseById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      const totalRatings = (course.totalRatings || 0) + 1;
      const averageRating = ((course.averageRating || 0) * (totalRatings - 1) + newRating) / totalRatings;

      await updateDoc(doc(db, 'courses', courseId), {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        updatedAt: serverTimestamp()
      });

      console.log('✅ Course rating updated:', { courseId, averageRating, totalRatings });
      
      return {
        success: true,
        courseId,
        averageRating,
        totalRatings
      };
    } catch (error) {
      console.error('❌ Error updating course rating:', error);
      throw new Error(`Failed to update course rating: ${error.message}`);
    }
  },

  // Increment course views
  incrementCourseViews: async (courseId) => {
    try {
      const course = await courseService.getCourseById(courseId);
      if (!course) return;

      const newViews = (course.totalViews || 0) + 1;
      
      await updateDoc(doc(db, 'courses', courseId), {
        totalViews: newViews,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Course views incremented:', { courseId, newViews });
    } catch (error) {
      console.error('❌ Error incrementing course views:', error);
    }
  },

  // Get comprehensive course statistics
  getCourseStats: async () => {
    try {
      console.log('🔄 Fetching course statistics');
      
      const [
        totalCoursesCount,
        publishedCoursesCount,
        draftCoursesCount,
        archivedCoursesCount,
        featuredCoursesCount,
        allCourses
      ] = await Promise.all([
        getCountFromServer(collection(db, 'courses')),
        getCountFromServer(query(collection(db, 'courses'), where('isPublished', '==', true))),
        getCountFromServer(query(collection(db, 'courses'), where('isPublished', '==', false))),
        getCountFromServer(query(collection(db, 'courses'), where('status', '==', 'archived'))),
        getCountFromServer(query(collection(db, 'courses'), where('isFeatured', '==', true))),
        courseService.getAllCourses({ limit: 1000 })
      ]);

      const stats = {
        total: totalCoursesCount.data().count,
        published: publishedCoursesCount.data().count,
        draft: draftCoursesCount.data().count,
        archived: archivedCoursesCount.data().count,
        featured: featuredCoursesCount.data().count,
        
        totalStudents: allCourses.reduce((sum, course) => sum + (course.studentsEnrolled || 0), 0),
        totalRevenue: allCourses.reduce((sum, course) => {
          if (!course.isFree) {
            return sum + (course.price || 0) * (course.studentsEnrolled || 0);
          }
          return sum;
        }, 0),
        averageRating: allCourses.length > 0 
          ? allCourses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / allCourses.length
          : 0,
        
        categories: allCourses.reduce((acc, course) => {
          const category = course.category || 'uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {}),
        
        levels: allCourses.reduce((acc, course) => {
          const level = course.level || 'unknown';
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        }, {})
      };

      console.log('✅ Course statistics fetched:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching course statistics:', error);
      throw new Error(`Failed to fetch course statistics: ${error.message}`);
    }
  },

  // Get total courses count (lightweight)
  getTotalCourses: async () => {
    try {
      console.log('🔄 Getting total courses count');
      const coll = collection(db, 'courses');
      const snapshot = await getCountFromServer(coll);
      const count = snapshot.data().count;
      console.log('✅ Total courses count:', count);
      return count;
    } catch (error) {
      console.error('❌ Error getting courses count:', error);
      return 0;
    }
  },

  // ==================== VALIDATION ====================

  // Validate course data before creation/update
  validateCourseData: (courseData, isUpdate = false) => {
    const errors = [];

    if (!isUpdate || courseData.title !== undefined) {
      if (!courseData.title || courseData.title.trim().length === 0) {
        errors.push('Course title is required');
      }
      if (courseData.title && courseData.title.length > 100) {
        errors.push('Course title must be less than 100 characters');
      }
    }

    if (courseData.description && courseData.description.length > 2000) {
      errors.push('Course description must be less than 2000 characters');
    }

    if (courseData.price !== undefined && courseData.price < 0) {
      errors.push('Course price cannot be negative');
    }

    if (courseData.totalDuration !== undefined && courseData.totalDuration < 0) {
      errors.push('Total duration cannot be negative');
    }

    if (courseData.tags && courseData.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Named exports for individual functions
export const createCourse = courseService.createCourse;
export const getCourseById = courseService.getCourseById;
export const getAllCourses = courseService.getAllCourses;
export const getPublishedCourses = courseService.getPublishedCourses;
export const getCoursesByCategory = courseService.getCoursesByCategory;
export const getCoursesByLevel = courseService.getCoursesByLevel;
export const getCoursesByInstructor = courseService.getCoursesByInstructor;
export const getFeaturedCourses = courseService.getFeaturedCourses;
export const updateCourse = courseService.updateCourse;
export const publishCourse = courseService.publishCourse;
export const unpublishCourse = courseService.unpublishCourse;
export const archiveCourse = courseService.archiveCourse;
export const deleteCourse = courseService.deleteCourse;
export const getEnrolledCourses = courseService.getEnrolledCourses;
export const enrollStudent = courseService.enrollStudent;
export const updateProgress = courseService.updateProgress;
export const getAvailableCourses = courseService.getAvailableCourses;
export const updateEnrollmentCount = courseService.updateEnrollmentCount;
export const updateCourseRating = courseService.updateCourseRating;
export const incrementCourseViews = courseService.incrementCourseViews;
export const getCourseStats = courseService.getCourseStats;
export const getTotalCourses = courseService.getTotalCourses;
export const validateCourseData = courseService.validateCourseData;

// Default export for the entire service
export default courseService;