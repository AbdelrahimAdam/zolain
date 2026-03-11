import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { courseService } from '../../services';
import { BookOpen, Users, Clock, Award, MessageCircle } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const location = useLocation();

  const whatsappNumber = '249903806123'; // Same as in footer

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const levelParam = params.get('level');
    const typeParam = params.get('type');
    if (levelParam) {
      setFilter(levelParam);
    } else if (typeParam) {
      setFilter(typeParam);
    } else {
      setFilter('all');
    }
  }, [location]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const mockCourses = [
          { id: '1', title: 'Starter English', level: 'starter', category: 'level', description: 'For absolute beginners. Learn alphabet, greetings, and basic phrases.', instructor: 'Ahmed Ali', students: 150, duration: '6 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=400&h=300&fit=crop' },
          { id: '2', title: 'Beginner English', level: 'beginner', category: 'level', description: 'Build foundational vocabulary and simple sentence structures.', instructor: 'Sara Hassan', students: 140, duration: '8 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop' },
          { id: '3', title: 'Pre-intermediate English', level: 'pre-intermediate', category: 'level', description: 'Expand grammar and start expressing opinions.', instructor: 'John Smith', students: 90, duration: '10 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop' },
          { id: '4', title: 'Intermediate English', level: 'intermediate', category: 'level', description: 'Communicate effectively in everyday situations.', instructor: 'Mai Eltahir', students: 110, duration: '10 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop' },
          { id: '5', title: 'Upper-intermediate English', level: 'upper-intermediate', category: 'level', description: 'Refine fluency and handle complex conversations.', instructor: 'Ahmed Ali', students: 70, duration: '12 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop' },
          { id: '6', title: 'Advanced English', level: 'advanced', category: 'level', description: 'Achieve near-native proficiency for academic or professional use.', instructor: 'Sara Hassan', students: 50, duration: '12 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=300&fit=crop' },
          { id: '7', title: 'IELTS Academic Preparation', level: 'ielts', category: 'training', description: 'Intensive preparation for IELTS Academic module. Includes mock tests and feedback.', instructor: 'John Smith', students: 80, duration: '8 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop' },
          { id: '8', title: 'IELTS General Training', level: 'ielts', category: 'training', description: 'Focus on General Training module for immigration and work.', instructor: 'Mai Eltahir', students: 60, duration: '8 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop' },
          { id: '9', title: 'TEFL Certification', level: 'tefl', category: 'training', description: 'Become a certified English teacher. Includes teaching practice.', instructor: 'Ahmed Ali', students: 40, duration: '12 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop' },
          { id: '10', title: 'Legal English', level: 'legal', category: 'training', description: 'Master legal terminology and drafting for lawyers and translators.', instructor: 'Dr. Fatima Nour', students: 35, duration: '10 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop' },
          { id: '11', title: 'Medical English', level: 'medical', category: 'training', description: 'Essential English for healthcare professionals.', instructor: 'Dr. Mai Eltahir', students: 55, duration: '8 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop' },
          { id: '12', title: 'English for Aviation', level: 'aviation', category: 'training', description: 'ICAO-compliant training for pilots and air traffic controllers.', instructor: 'Capt. Hassan', students: 25, duration: '10 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop' },
          { id: '13', title: 'Medical Translation', level: 'translation', category: 'training', description: 'Specialised translation for medical documents.', instructor: 'Dr. Mai Eltahir', students: 30, duration: '8 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop' },
          { id: '14', title: 'Legal Translation', level: 'translation', category: 'training', description: 'Translate legal texts with precision.', instructor: 'Mr. Khalid', students: 20, duration: '8 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop' },
          { id: '15', title: 'English for Specific Purposes (ESP)', level: 'esp', category: 'training', description: 'Tailored English for business, engineering, IT – live online.', instructor: 'Prof. Sarah Johnson', students: 45, duration: '10 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop' },
          { id: '16', title: 'English for Tourism & Hospitality', level: 'tourism', category: 'training', description: 'Learn the language of travel, hotels, and customer service – live on Google Meet.', instructor: 'Maria Garcia', students: 38, duration: '8 weeks', thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop' },
          { id: '17', title: 'Live Translation – Conferences', level: 'live', category: 'translation', description: 'Real‑time interpretation for events and meetings – certified interpreters.', instructor: 'Translation Team', students: 50, duration: 'Varies', thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop' },
          { id: '18', title: 'General Translation Services', level: 'translation', category: 'translation', description: 'Professional translation for documents, websites, and marketing materials.', instructor: 'Translation Team', students: 60, duration: 'Varies', thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop' }
        ];
        setCourses(mockCourses);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = filter === 'all' ? courses : courses.filter(c => c.level === filter);

  const levelColors = {
    starter: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    beginner: 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'pre-intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    intermediate: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'upper-intermediate': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    ielts: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    tefl: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    legal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    medical: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    aviation: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    translation: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    esp: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    tourism: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    live: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  };

  const levelBgColors = {
    starter: 'bg-green-200/70 dark:bg-green-800/40',
    beginner: 'bg-green-300/70 dark:bg-green-800/50',
    'pre-intermediate': 'bg-yellow-200/70 dark:bg-yellow-800/40',
    intermediate: 'bg-yellow-300/70 dark:bg-yellow-800/50',
    'upper-intermediate': 'bg-orange-200/70 dark:bg-orange-800/40',
    advanced: 'bg-red-200/70 dark:bg-red-800/40',
    ielts: 'bg-purple-200/70 dark:bg-purple-800/40',
    tefl: 'bg-indigo-200/70 dark:bg-indigo-800/40',
    legal: 'bg-blue-200/70 dark:bg-blue-800/40',
    medical: 'bg-pink-200/70 dark:bg-pink-800/40',
    aviation: 'bg-cyan-200/70 dark:bg-cyan-800/40',
    translation: 'bg-gray-200/70 dark:bg-gray-700/40',
    esp: 'bg-teal-200/70 dark:bg-teal-800/40',
    tourism: 'bg-amber-200/70 dark:bg-amber-800/40',
    live: 'bg-orange-200/70 dark:bg-orange-800/40',
  };

  const levelTitleColors = {
    starter: 'text-green-800 dark:text-green-300',
    beginner: 'text-green-900 dark:text-green-200',
    'pre-intermediate': 'text-yellow-800 dark:text-yellow-300',
    intermediate: 'text-yellow-900 dark:text-yellow-200',
    'upper-intermediate': 'text-orange-800 dark:text-orange-300',
    advanced: 'text-red-800 dark:text-red-300',
    ielts: 'text-purple-800 dark:text-purple-300',
    tefl: 'text-indigo-800 dark:text-indigo-300',
    legal: 'text-blue-800 dark:text-blue-300',
    medical: 'text-pink-800 dark:text-pink-300',
    aviation: 'text-cyan-800 dark:text-cyan-300',
    translation: 'text-gray-800 dark:text-gray-300',
    esp: 'text-teal-800 dark:text-teal-300',
    tourism: 'text-amber-800 dark:text-amber-300',
    live: 'text-orange-800 dark:text-orange-300',
  };

  const filterTabs = [
    { value: 'all', label: 'All Courses' },
    { value: 'starter', label: 'Starter' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'pre-intermediate', label: 'Pre‑intermediate' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'upper-intermediate', label: 'Upper‑intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'ielts', label: 'IELTS' },
    { value: 'tefl', label: 'TEFL' },
    { value: 'legal', label: 'Legal' },
    { value: 'medical', label: 'Medical' },
    { value: 'aviation', label: 'Aviation' },
    { value: 'translation', label: 'Translation' },
    { value: 'esp', label: 'ESP' },
    { value: 'tourism', label: 'Tourism' },
    { value: 'live', label: 'Live Interpretation' },
  ];

  // Function to handle WhatsApp click with course details
  const handleWhatsAppClick = (courseTitle, e) => {
    e.preventDefault(); // Prevent navigation to course detail
    e.stopPropagation(); // Prevent card click from triggering
    const message = `Hello Zolain, I'm interested in the course: ${courseTitle}. Can you provide more information about payment and enrollment?`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-sky-50 dark:bg-sky-900/20 min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Our Course Catalog
        </h1>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-sm md:text-base">
          Choose from a variety of levels and specialisations tailored to your goals.
        </p>

        {/* Filter tabs */}
        <div className="flex flex-nowrap overflow-x-auto pb-4 mb-8 gap-2 px-4 scrollbar-hide">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium capitalize whitespace-nowrap transition ${
                filter === tab.value
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                className={`group ${levelBgColors[course.level] || 'bg-white/80 dark:bg-gray-800/80'} backdrop-blur-sm rounded-2xl border border-blue-100/50 overflow-hidden hover:shadow-xl transition-all hover:scale-105 flex flex-col h-full`}
              >
                <Link to={`/courses/${course.id}`} className="block flex-1">
                  <div className="h-32 sm:h-36 overflow-hidden">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-4 md:p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 md:p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                        <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-medium ${levelColors[course.level] || 'bg-gray-100'}`}>
                        {course.level}
                      </span>
                    </div>
                    <h3 className={`text-sm md:text-base lg:text-lg font-bold ${levelTitleColors[course.level] || 'text-gray-900 dark:text-white'} mb-2 leading-tight break-words`}>
                      {course.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed break-words flex-1">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center"><Users className="h-3 w-3 mr-1" /> {course.students}</span>
                      <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {course.duration}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{course.instructor}</span>
                      <Award className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                    </div>
                  </div>
                </Link>

                {/* WhatsApp Button - positioned at bottom of card, outside the link */}
                <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0">
                  <button
                    onClick={(e) => handleWhatsAppClick(course.title, e)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 shadow-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Inquire on WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;