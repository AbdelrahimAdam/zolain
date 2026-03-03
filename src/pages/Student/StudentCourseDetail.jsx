import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { courseService } from '../../services';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import {
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  PlayCircle,
  ChevronLeft,
  Menu,
  X,
  Download,
  ExternalLink
} from 'lucide-react';

// Helper to extract YouTube video ID from various URL formats
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourseById(courseId);
      if (!courseData) {
        setError('Course not found');
        return;
      }
      // Ensure course is published
      if (!courseData.isPublished) {
        setError('This course is not available');
        return;
      }
      setCourse(courseData);
      // Set first lesson as selected if any
      const firstSection = courseData.sections?.[0];
      const firstLesson = firstSection?.lessons?.[0];
      if (firstLesson) {
        setSelectedLesson({ sectionId: firstSection.id, lesson: firstLesson });
      }
      // Load student progress (optional)
      if (user) {
        // You can fetch progress from enrollments if needed
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (sectionId, lesson) => {
    setSelectedLesson({ sectionId, lesson });
    setSidebarOpen(false); // close sidebar on mobile after selection
  };

  const handleMarkCompleted = () => {
    if (selectedLesson) {
      // Update progress (could save to backend)
      setProgress(prev => ({
        ...prev,
        [selectedLesson.lesson.id]: true
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Course not found'}
          </h3>
          <Button onClick={() => navigate('/student/courses')} className="mt-4">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar - course navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-bold text-lg truncate">{course.title}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {course.sections?.map((section, idx) => (
              <div key={section.id} className="mb-6">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Section {idx + 1}: {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.lessons?.map((lesson) => {
                    const isSelected = selectedLesson?.lesson.id === lesson.id;
                    const isCompleted = progress[lesson.id];
                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => handleLessonClick(section.id, lesson)}
                          className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex-shrink-0 mr-3">
                            {lesson.type === 'video' ? (
                              <Video className="h-4 w-4" />
                            ) : lesson.type === 'pdf' ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lesson.title}</p>
                            {lesson.type === 'video' && lesson.duration > 0 && (
                              <p className="text-xs text-gray-500">{lesson.duration} min</p>
                            )}
                          </div>
                          {isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {selectedLesson ? (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to courses
            </button>
            <h1 className="text-2xl font-bold mb-2">{selectedLesson.lesson.title}</h1>
            {selectedLesson.lesson.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedLesson.lesson.description}</p>
            )}

            {/* Content based on lesson type */}
            {selectedLesson.lesson.type === 'video' && (
              <div className="aspect-w-16 aspect-h-9 mb-6">
                {getYouTubeEmbedUrl(selectedLesson.lesson.url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedLesson.lesson.url)}
                    title={selectedLesson.lesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
                    <p className="text-gray-500">Invalid YouTube URL</p>
                  </div>
                )}
              </div>
            )}

            {selectedLesson.lesson.type === 'pdf' && (
              <div className="mb-6">
                {selectedLesson.lesson.url ? (
                  <div className="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">{selectedLesson.lesson.title}</p>
                      <p className="text-sm text-gray-500">PDF Worksheet</p>
                    </div>
                    <a
                      href={selectedLesson.lesson.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">No PDF available</p>
                )}
              </div>
            )}

            {selectedLesson.lesson.type === 'quiz' && (
              <div className="mb-6 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  Quiz: {selectedLesson.lesson.description || 'No description'}
                </p>
                <Button className="mt-4">Start Quiz</Button>
              </div>
            )}

            {/* Mark as completed button */}
            <button
              onClick={handleMarkCompleted}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Completed
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <PlayCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select a lesson to start learning
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourseDetail;