import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import { 
  X, 
  Upload, 
  Video, 
  Calendar, 
  Clock, 
  Users,
  AlertCircle,
  CheckCircle,
  FileText,
  ExternalLink,
  Download,
  Link,
  Globe,
  User,
  BookOpen,
  Youtube,
  Layers
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'
import Button from '../UI/Button.jsx'
import Select from '../UI/Select.jsx'
import { recordingService, isValidYouTubeUrl, getYouTubeEmbedUrl } from '../../services/recordingService.jsx'
import { courseService } from '../../services/courseService.jsx'

// Helper: fetch YouTube video info using public API (requires API key)
const fetchYouTubeVideoInfo = async (videoId) => {
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoId}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.items && data.items[0]) {
      const duration = data.items[0].contentDetails.duration; // ISO 8601 duration
      const title = data.items[0].snippet.title;
      return { duration, title };
    }
    return null;
  } catch (err) {
    console.error('Error fetching YouTube info:', err);
    return null;
  }
};

// Convert ISO 8601 duration to seconds
const isoDurationToSeconds = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

const CustomInput = React.forwardRef(({ label, type = 'text', placeholder, error, disabled, icon: Icon, suffix, required, autoFocus = false, ...props }, ref) => (
  <div className="space-y-2">
    {label && (
      <label className={`block text-sm font-medium ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-5 w-5 text-gray-400" /></div>}
      <input
        type={type}
        className={`w-full px-4 py-3 border ${error ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-2xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${Icon ? 'pl-10' : ''} ${suffix ? 'pr-16' : ''}`}
        placeholder={placeholder}
        disabled={disabled}
        ref={ref}
        autoFocus={autoFocus}
        {...props}
      />
      {suffix && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 dark:text-gray-400 text-sm">{suffix}</span></div>}
    </div>
    {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
  </div>
));

const CustomTextArea = React.forwardRef(({ label, placeholder, error, disabled, rows = 3, required, autoFocus = false, ...props }, ref) => (
  <div className="space-y-2">
    {label && (
      <label className={`block text-sm font-medium ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <textarea
      rows={rows}
      className={`w-full px-4 py-3 border ${error ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-2xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      placeholder={placeholder}
      disabled={disabled}
      ref={ref}
      autoFocus={autoFocus}
      {...props}
    />
    {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
  </div>
));

const CreateLessonModal = ({ onClose, onSuccess, courseId = null, sectionId = null, initialData = {} }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [youtubePreview, setYoutubePreview] = useState(null)
  const [availableCourses, setAvailableCourses] = useState([])
  const [availableSections, setAvailableSections] = useState([])
  const [fetchingDuration, setFetchingDuration] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty, isValid }, watch, setValue, getValues } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      videoUrl: initialData.videoUrl || '',
      duration: initialData.duration || 0,
      category: initialData.category || 'english',
      level: initialData.level || 'beginner',
      tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''),
      isFree: initialData.isFree ?? true,
      visibility: initialData.visibility || 'enrolled', // enrolled, public, private
      courseId: initialData.courseId || courseId || 'general',
      sectionId: initialData.sectionId || sectionId || '',
      ...initialData
    }
  })

  const watchedValues = watch()
  const selectedCourseId = watchedValues.courseId

  // Load courses taught by this teacher
  useEffect(() => {
    const loadCourses = async () => {
      if (!user?.uid) return;
      try {
        const courses = await courseService.getCoursesByInstructor(user.uid, { includeUnpublished: true });
        setAvailableCourses(courses);
      } catch (err) {
        console.error('Error loading courses:', err);
      }
    };
    loadCourses();
  }, [user]);

  // Load sections when course changes
  useEffect(() => {
    const loadSections = async () => {
      if (selectedCourseId && selectedCourseId !== 'general') {
        try {
          const course = await courseService.getCourseById(selectedCourseId);
          setAvailableSections(course?.sections || []);
        } catch (err) {
          console.error('Error loading sections:', err);
          setAvailableSections([]);
        }
      } else {
        setAvailableSections([]);
      }
    };
    loadSections();
  }, [selectedCourseId]);

  // Handle YouTube URL change and preview + auto‑fetch duration
  useEffect(() => {
    if (watchedValues.videoUrl) {
      const videoId = recordingService.youtubeWorkflow.extractYouTubeId(watchedValues.videoUrl);
      if (videoId) {
        setYoutubePreview({
          isValid: true,
          videoId,
          embedUrl: recordingService.youtubeWorkflow.getYouTubeEmbedUrl(watchedValues.videoUrl),
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        });
        // Auto‑fetch duration
        const autoFetch = async () => {
          setFetchingDuration(true);
          const info = await fetchYouTubeVideoInfo(videoId);
          if (info) {
            const durationSec = isoDurationToSeconds(info.duration);
            setValue('duration', durationSec, { shouldValidate: true });
            // Optionally set title if empty
            if (!getValues('title') && info.title) {
              setValue('title', info.title);
            }
          }
          setFetchingDuration(false);
        };
        autoFetch();
      } else {
        setYoutubePreview({ isValid: false, error: 'Invalid YouTube URL' });
      }
    } else {
      setYoutubePreview(null);
    }
  }, [watchedValues.videoUrl, setValue, getValues]);

  const handleDurationChange = useCallback((e) => {
    const minutes = parseInt(e.target.value) || 0;
    setValue('duration', minutes * 60, { shouldValidate: true }); // store in seconds
  }, [setValue]);

  const processTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return [];
  };

  const createVideoMutation = useMutation(
    async (videoData) => {
      const processedTags = processTags(videoData.tags);
      const payload = {
        title: videoData.title,
        description: videoData.description,
        videoUrl: videoData.videoUrl,
        duration: parseInt(videoData.duration) || 0,
        category: videoData.category,
        level: videoData.level,
        tags: processedTags,
        isFree: videoData.isFree,
        visibility: videoData.visibility,
        instructorId: user.uid,
        instructorName: user.displayName || user.email,
        courseId: videoData.courseId || 'general',
        sectionId: videoData.sectionId || null,
        isPublished: videoData.visibility === 'public'
      };
      return await recordingService.createVideo(payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['videos']);
        setSuccess('Lesson saved successfully!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      },
      onError: (err) => {
        setError(err.message || 'Failed to save lesson');
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    }
  );

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      await createVideoMutation.mutateAsync(data);
      clearInterval(interval);
      setUploadProgress(100);
    } catch (err) {
      clearInterval(interval);
    }
  };

  const categoryOptions = useMemo(() => [
    { value: 'english', label: 'English' },
    { value: 'medical', label: 'Medical Translation' },
    { value: 'business', label: 'Business English' },
    { value: 'general', label: 'General' }
  ], []);

  const levelOptions = useMemo(() => [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ], []);

  const visibilityOptions = useMemo(() => [
    { value: 'enrolled', label: 'Enrolled students only' },
    { value: 'public', label: 'Public (visible to all)' },
    { value: 'private', label: 'Private (draft)' }
  ], []);

  const courseOptions = useMemo(() => {
    const opts = [{ value: 'general', label: 'General (no course)' }];
    availableCourses.forEach(c => {
      opts.push({ value: c.id, label: c.title });
    });
    return opts;
  }, [availableCourses]);

  const sectionOptions = useMemo(() => {
    return availableSections.map(s => ({ value: s.id, label: s.title }));
  }, [availableSections]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Youtube className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add YouTube Lesson
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Paste a YouTube link to add a video lesson
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        {isSubmitting && (
          <div className="px-6 pt-4">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
              {uploadProgress < 100 ? 'Saving lesson...' : 'Saved!'}
            </p>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700"><X size={16} /></button>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <p className="text-green-700 dark:text-green-300 text-sm flex-1">{success}</p>
          </div>
        )}

        {/* YouTube Steps */}
        <div className="px-6 pt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">YouTube Upload Steps</h4>
            <div className="space-y-2">
              {recordingService.youtubeWorkflow.getUploadSteps().map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs font-medium text-blue-800 dark:text-blue-200">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <CustomInput
                label="Lesson Title *"
                placeholder="e.g. Introduction to English Grammar"
                error={errors.title?.message}
                disabled={isSubmitting}
                required
                icon={FileText}
                {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'At least 3 characters' } })}
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <CustomTextArea
                label="Description"
                rows={3}
                placeholder="Describe what students will learn..."
                error={errors.description?.message}
                disabled={isSubmitting}
                {...register('description', { maxLength: { value: 500, message: 'Max 500 characters' } })}
              />
            </div>

            {/* YouTube URL */}
            <div className="lg:col-span-2">
              <CustomInput
                label="YouTube Video URL *"
                type="url"
                placeholder="https://youtu.be/... or https://www.youtube.com/watch?v=..."
                error={errors.videoUrl?.message || (youtubePreview && !youtubePreview.isValid && youtubePreview.error)}
                disabled={isSubmitting}
                required
                icon={Youtube}
                {...register('videoUrl', {
                  required: 'YouTube URL is required',
                  validate: value => isValidYouTubeUrl(value) || 'Please enter a valid YouTube URL'
                })}
              />

              {/* YouTube Preview */}
              {youtubePreview?.isValid && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-start space-x-4">
                    <img src={youtubePreview.thumbnail} alt="Preview" className="w-32 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" /> Valid YouTube URL
                        {fetchingDuration && <span className="ml-2 text-xs text-blue-500"> (fetching duration...)</span>}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Video ID: {youtubePreview.videoId}</p>
                      <a href={watchedValues.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-600 hover:underline mt-2">
                        <ExternalLink size={12} className="mr-1" /> Open in YouTube
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Selection */}
            <div className="lg:col-span-2">
              <Select
                label="Course"
                options={courseOptions}
                value={watchedValues.courseId}
                onChange={(value) => setValue('courseId', value)}
                disabled={isSubmitting}
                icon={BookOpen}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select the course this lesson belongs to (optional).
              </p>
            </div>

            {/* Section Selection (if course has sections) */}
            {sectionOptions.length > 0 && (
              <div className="lg:col-span-2">
                <Select
                  label="Section"
                  options={[{ value: '', label: 'None' }, ...sectionOptions]}
                  value={watchedValues.sectionId}
                  onChange={(value) => setValue('sectionId', value)}
                  disabled={isSubmitting}
                  icon={Layers}
                />
              </div>
            )}

            {/* Duration (minutes) */}
            <div>
              <CustomInput
                label="Duration (minutes) *"
                type="number"
                min="1"
                placeholder="e.g. 15"
                error={errors.duration?.message}
                disabled={isSubmitting || fetchingDuration}
                suffix="min"
                icon={Clock}
                {...register('duration', {
                  required: 'Duration is required',
                  min: { value: 1, message: 'Minimum 1 minute' },
                  valueAsNumber: true
                })}
                onChange={handleDurationChange}
              />
            </div>

            {/* Level */}
            <Select
              label="Level *"
              options={levelOptions}
              value={watchedValues.level}
              onChange={(value) => setValue('level', value, { shouldValidate: true })}
              disabled={isSubmitting}
              error={errors.level?.message}
            />

            {/* Category */}
            <Select
              label="Category"
              options={categoryOptions}
              value={watchedValues.category}
              onChange={(value) => setValue('category', value)}
              disabled={isSubmitting}
            />

            {/* Tags */}
            <div>
              <CustomInput
                label="Tags"
                placeholder="grammar, beginner, speaking (comma separated)"
                error={errors.tags?.message}
                disabled={isSubmitting}
                {...register('tags')}
              />
            </div>

            {/* Free / Paid */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('isFree')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Free preview</span>
              </label>
            </div>

            {/* Visibility */}
            <Select
              label="Visibility"
              options={visibilityOptions}
              value={watchedValues.visibility}
              onChange={(value) => setValue('visibility', value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Instructor Info (read‑only) */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <User className="h-4 w-4 mr-2" /> Instructor
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {user?.displayName || user?.email}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty || !isValid}
              loading={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              icon={Upload}
            >
              {isSubmitting ? 'Saving...' : 'Save Lesson'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLessonModal;