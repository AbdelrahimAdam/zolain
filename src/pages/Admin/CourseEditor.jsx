// src/pages/Admin/CourseEditor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { courseService, userService } from '../../services';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  Save,
  X,
  Plus,
  Trash2,
  Youtube,
  FileText,
  BookOpen,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CourseEditor = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const isEditing = !!courseId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [teachers, setTeachers] = useState([]);

  // Course form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    level: 'beginner',
    category: 'general',
    language: 'en',
    thumbnailUrl: '',
    promoVideoUrl: '',
    isFree: true,
    price: 0,
    currency: 'USD',
    isPublished: false,
    isFeatured: false,
    instructorId: '',
    instructorName: '',
    sections: [],
    requirements: [],
    learningOutcomes: [],
    targetAudience: [],
    tags: [],
    settings: {
      allowDownloads: true,
      enableDiscussions: true,
      enableCertificates: false,
      requiresApproval: false,
      maxStudents: 0
    }
  });

  // Local UI state for dynamic inputs
  const [newRequirement, setNewRequirement] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newTag, setNewTag] = useState('');

  // Load teachers for admin
  useEffect(() => {
    const loadTeachers = async () => {
      if (userRole === 'admin') {
        try {
          const teachersList = await userService.getAllUsers({ role: 'teacher', status: 'active' });
          setTeachers(teachersList);
        } catch (err) {
          console.error('Error loading teachers:', err);
        }
      }
    };
    loadTeachers();
  }, [userRole]);

  // Load existing course if editing
  useEffect(() => {
    if (isEditing && courseId) {
      const loadCourse = async () => {
        setLoading(true);
        try {
          const course = await courseService.getCourseById(courseId);
          if (!course) {
            setError('Course not found');
            return;
          }
          // Permission check: admin can edit any, teachers only their own
          if (userRole !== 'admin' && course.instructorId !== user?.uid) {
            setError('You do not have permission to edit this course');
            setTimeout(() => navigate(userRole === 'teacher' ? '/teacher/courses' : '/admin/courses'), 2000);
            return;
          }
          setFormData(course);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      loadCourse();
    } else {
      // Set default instructor for new course if teacher
      if (userRole === 'teacher' && user) {
        setFormData(prev => ({
          ...prev,
          instructorId: user.uid,
          instructorName: user.displayName || user.email
        }));
      }
    }
  }, [isEditing, courseId, user, userRole, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleInstructorChange = (e) => {
    const instructorId = e.target.value;
    const selected = teachers.find(t => t.id === instructorId);
    setFormData(prev => ({
      ...prev,
      instructorId,
      instructorName: selected?.displayName || selected?.email || ''
    }));
  };

  // Sections management
  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: Date.now().toString(),
          title: '',
          lessons: []
        }
      ]
    }));
  };

  const updateSection = (sectionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    }));
  };

  const removeSection = (sectionId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  // Lessons management
  const addLesson = (sectionId, type = 'video') => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            lessons: [
              ...s.lessons,
              {
                id: Date.now().toString() + Math.random(),
                title: '',
                type,
                url: '',
                description: '',
                duration: 0
              }
            ]
          };
        }
        return s;
      })
    }));
  };

  const updateLesson = (sectionId, lessonId, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            lessons: s.lessons.map(l =>
              l.id === lessonId ? { ...l, [field]: value } : l
            )
          };
        }
        return s;
      })
    }));
  };

  const removeLesson = (sectionId, lessonId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            lessons: s.lessons.filter(l => l.id !== lessonId)
          };
        }
        return s;
      })
    }));
  };

  // Arrays management
  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addOutcome = () => {
    if (newOutcome.trim()) {
      setFormData(prev => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, newOutcome.trim()]
      }));
      setNewOutcome('');
    }
  };

  const removeOutcome = (index) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const addAudience = () => {
    if (newAudience.trim()) {
      setFormData(prev => ({
        ...prev,
        targetAudience: [...prev.targetAudience, newAudience.trim()]
      }));
      setNewAudience('');
    }
  };

  const removeAudience = (index) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Validation
  const validateForm = () => {
    if (!formData.title.trim()) return 'Course title is required';
    if (!formData.description.trim()) return 'Course description is required';
    if (formData.sections.length === 0) return 'At least one section is required';
    for (const section of formData.sections) {
      if (!section.title.trim()) return 'All sections must have a title';
      if (section.lessons.length === 0) return `Section "${section.title}" must have at least one lesson`;
      for (const lesson of section.lessons) {
        if (!lesson.title.trim()) return 'All lessons must have a title';
        if (lesson.type === 'video' && !lesson.url.trim()) return `Lesson "${lesson.title}" requires a YouTube URL`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Compute derived fields
      const totalLessons = formData.sections.reduce((sum, s) => sum + s.lessons.length, 0);
      const totalDuration = formData.sections.reduce(
        (sum, s) =>
          sum +
          s.lessons
            .filter(l => l.type === 'video')
            .reduce((acc, l) => acc + (l.duration || 0), 0),
        0
      );

      const coursePayload = {
        ...formData,
        totalLessons,
        totalDuration,
        updatedAt: new Date()
      };

      let result;
      if (isEditing) {
        result = await courseService.updateCourse(courseId, coursePayload);
      } else {
        result = await courseService.createCourse({
          ...coursePayload,
          createdBy: user.uid
        });
      }

      setSuccess(true);
      // Navigate to appropriate list after short delay
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin/courses');
        } else {
          navigate('/teacher/courses');
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isEditing
            ? 'Update course details, sections, and lessons.'
            : 'Fill in the details to create a new course.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50/80 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50/80 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/50 rounded-2xl p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-green-700 dark:text-green-300 text-sm flex-1">
            Course {isEditing ? 'updated' : 'created'} successfully! Redirecting...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Course Title *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. English for Beginners"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <Input
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Brief summary (max 150 chars)"
                maxLength={150}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Full Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed course description..."
                required
              />
            </div>
          </div>
        </section>

        {/* Categorization */}
        <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <h2 className="text-xl font-bold mb-4">Categorization</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="english">English</option>
                <option value="medical">Medical Translation</option>
                <option value="business">Business</option>
                <option value="test-prep">Test Preparation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
              <Input
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        {/* Instructor & Pricing */}
        <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <h2 className="text-xl font-bold mb-4">Instructor & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userRole === 'admin' ? (
              <div>
                <label className="block text-sm font-medium mb-1">Instructor *</label>
                <select
                  value={formData.instructorId}
                  onChange={handleInstructorChange}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select instructor</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.displayName || t.email}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Instructor</label>
                <Input
                  value={formData.instructorName}
                  disabled
                  className="bg-gray-100 dark:bg-gray-600"
                />
              </div>
            )}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Free course</span>
              </label>
              {!formData.isFree && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    className="w-32"
                  />
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="px-3 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50"
                  >
                    <option value="USD">USD</option>
                    <option value="SDG">SDG</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Publish immediately</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Feature this course</span>
              </label>
            </div>
          </div>
        </section>

        {/* Sections & Lessons */}
        <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Course Content</h2>
            <Button type="button" onClick={addSection} size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          {formData.sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-2xl">
              <BookOpen className="mx-auto h-12 w-12 mb-3" />
              <p>No sections yet. Click "Add Section" to start building your course.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.sections.map((section) => (
                <div key={section.id} className="border border-blue-100 dark:border-gray-700 rounded-2xl p-4 bg-white/50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 mr-4">
                      <Input
                        placeholder="Section title (e.g. Introduction)"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addLesson(section.id, 'video')}
                        title="Add YouTube video"
                      >
                        <Youtube className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addLesson(section.id, 'pdf')}
                        title="Add PDF worksheet"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addLesson(section.id, 'quiz')}
                        title="Add quiz"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => removeSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {section.lessons.length > 0 && (
                    <div className="ml-6 space-y-3 mt-3">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-start space-x-2 bg-white/30 dark:bg-gray-700/30 p-3 rounded-xl">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              placeholder="Lesson title"
                              value={lesson.title}
                              onChange={(e) => updateLesson(section.id, lesson.id, 'title', e.target.value)}
                              className="text-sm"
                            />
                            {lesson.type === 'video' && (
                              <>
                                <Input
                                  placeholder="YouTube URL"
                                  value={lesson.url}
                                  onChange={(e) => updateLesson(section.id, lesson.id, 'url', e.target.value)}
                                  className="text-sm"
                                />
                                <Input
                                  type="number"
                                  placeholder="Duration (minutes)"
                                  value={lesson.duration}
                                  onChange={(e) => updateLesson(section.id, lesson.id, 'duration', parseInt(e.target.value) || 0)}
                                  className="text-sm sm:col-span-1"
                                />
                              </>
                            )}
                            {lesson.type === 'pdf' && (
                              <Input
                                placeholder="PDF URL or file upload"
                                value={lesson.url}
                                onChange={(e) => updateLesson(section.id, lesson.id, 'url', e.target.value)}
                                className="text-sm sm:col-span-2"
                              />
                            )}
                            {lesson.type === 'quiz' && (
                              <Input
                                placeholder="Quiz description (placeholder)"
                                value={lesson.description}
                                onChange={(e) => updateLesson(section.id, lesson.id, 'description', e.target.value)}
                                className="text-sm sm:col-span-2"
                              />
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeLesson(section.id, lesson.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Learning Outcomes & Requirements */}
        <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <h2 className="text-xl font-bold mb-4">Learning Outcomes & Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium mb-2">Requirements (what students need before taking this course)</label>
              <div className="space-y-2">
                {formData.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/30 dark:bg-gray-700/30 p-2 rounded-lg">
                    <span className="text-sm">{req}</span>
                    <button type="button" onClick={() => removeRequirement(idx)} className="text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement"
                    className="flex-1 mr-2"
                  />
                  <Button type="button" onClick={addRequirement} size="sm">Add</Button>
                </div>
              </div>
            </div>
            {/* Learning Outcomes */}
            <div>
              <label className="block text-sm font-medium mb-2">Learning Outcomes (what students will learn)</label>
              <div className="space-y-2">
                {formData.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/30 dark:bg-gray-700/30 p-2 rounded-lg">
                    <span className="text-sm">{outcome}</span>
                    <button type="button" onClick={() => removeOutcome(idx)} className="text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex">
                  <Input
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    placeholder="Add an outcome"
                    className="flex-1 mr-2"
                  />
                  <Button type="button" onClick={addOutcome} size="sm">Add</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <div className="space-y-2">
                {formData.targetAudience.map((aud, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/30 dark:bg-gray-700/30 p-2 rounded-lg">
                    <span className="text-sm">{aud}</span>
                    <button type="button" onClick={() => removeAudience(idx)} className="text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex">
                  <Input
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    placeholder="e.g. Beginner English learners"
                    className="flex-1 mr-2"
                  />
                  <Button type="button" onClick={addAudience} size="sm">Add</Button>
                </div>
              </div>
            </div>
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="space-y-2">
                {formData.tags.map((tag, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/30 dark:bg-gray-700/30 p-2 rounded-lg">
                    <span className="text-sm">#{tag}</span>
                    <button type="button" onClick={() => removeTag(idx)} className="text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 mr-2"
                  />
                  <Button type="button" onClick={addTag} size="sm">Add</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-500" />
            Course Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="allowDownloads"
                checked={formData.settings.allowDownloads}
                onChange={handleSettingsChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Allow downloads</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="enableDiscussions"
                checked={formData.settings.enableDiscussions}
                onChange={handleSettingsChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Enable discussions</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="enableCertificates"
                checked={formData.settings.enableCertificates}
                onChange={handleSettingsChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Issue certificates</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="requiresApproval"
                checked={formData.settings.requiresApproval}
                onChange={handleSettingsChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Requires approval</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Max students (0 = unlimited)</label>
              <Input
                type="number"
                name="maxStudents"
                value={formData.settings.maxStudents}
                onChange={handleSettingsChange}
                min="0"
                className="w-32"
              />
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Course' : 'Create Course'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourseEditor;