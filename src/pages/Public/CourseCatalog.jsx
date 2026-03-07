import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { courseService } from '../../services';
import { BookOpen, Users, Clock, Award } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const location = useLocation();

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
          { id: '1', title: 'Starter English', level: 'starter', category: 'level', description: 'For absolute beginners. Learn alphabet, greetings, and basic phrases.', instructor: 'Ahmed Ali', students: 150, duration: '6 weeks' },
          { id: '2', title: 'Beginner English', level: 'beginner', category: 'level', description: 'Build foundational vocabulary and simple sentence structures.', instructor: 'Sara Hassan', students: 140, duration: '8 weeks' },
          { id: '3', title: 'Pre-intermediate English', level: 'pre-intermediate', category: 'level', description: 'Expand grammar and start expressing opinions.', instructor: 'John Smith', students: 90, duration: '10 weeks' },
          { id: '4', title: 'Intermediate English', level: 'intermediate', category: 'level', description: 'Communicate effectively in everyday situations.', instructor: 'Mai Eltahir', students: 110, duration: '10 weeks' },
          { id: '5', title: 'Upper-intermediate English', level: 'upper-intermediate', category: 'level', description: 'Refine fluency and handle complex conversations.', instructor: 'Ahmed Ali', students: 70, duration: '12 weeks' },
          { id: '6', title: 'Advanced English', level: 'advanced', category: 'level', description: 'Achieve near-native proficiency for academic or professional use.', instructor: 'Sara Hassan', students: 50, duration: '12 weeks' },
          { id: '7', title: 'IELTS Academic Preparation', level: 'ielts', category: 'training', description: 'Intensive preparation for IELTS Academic module. Includes mock tests and feedback.', instructor: 'John Smith', students: 80, duration: '8 weeks' },
          { id: '8', title: 'IELTS General Training', level: 'ielts', category: 'training', description: 'Focus on General Training module for immigration and work.', instructor: 'Mai Eltahir', students: 60, duration: '8 weeks' },
          { id: '9', title: 'TEFL Certification', level: 'tefl', category: 'training', description: 'Become a certified English teacher. Includes teaching practice.', instructor: 'Ahmed Ali', students: 40, duration: '12 weeks' },
          { id: '10', title: 'Legal English', level: 'legal', category: 'training', description: 'Master legal terminology and drafting for lawyers and translators.', instructor: 'Dr. Fatima Nour', students: 35, duration: '10 weeks' },
          { id: '11', title: 'Medical English', level: 'medical', category: 'training', description: 'Essential English for healthcare professionals.', instructor: 'Dr. Mai Eltahir', students: 55, duration: '8 weeks' },
          { id: '12', title: 'English for Aviation', level: 'aviation', category: 'training', description: 'ICAO-compliant training for pilots and air traffic controllers.', instructor: 'Capt. Hassan', students: 25, duration: '10 weeks' },
          { id: '13', title: 'Medical Translation', level: 'translation', category: 'training', description: 'Specialised translation for medical documents.', instructor: 'Dr. Mai Eltahir', students: 30, duration: '8 weeks' },
          { id: '14', title: 'Legal Translation', level: 'translation', category: 'training', description: 'Translate legal texts with precision.', instructor: 'Mr. Khalid', students: 20, duration: '8 weeks' }
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
    translation: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
    translation: 'bg-gray-200/70 dark:bg-gray-700/40'
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
    translation: 'text-gray-800 dark:text-gray-300'
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
    { value: 'translation', label: 'Translation' }
  ];

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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredCourses.map(course => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className={`group ${levelBgColors[course.level] || 'bg-white/80 dark:bg-gray-800/80'} backdrop-blur-sm rounded-2xl border border-blue-100/50 p-4 md:p-6 hover:shadow-xl transition-all hover:scale-105 flex flex-col h-full`}
              >
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                    <BookOpen className="h-4 w-4 md:h-6 md:w-6 text-white" />
                  </div>
                  <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-medium ${levelColors[course.level] || 'bg-gray-100'}`}>
                    {course.level}
                  </span>
                </div>
                <h3 className={`text-sm md:text-xl font-bold ${levelTitleColors[course.level] || 'text-gray-900 dark:text-white'} mb-2 leading-tight break-words`}>
                  {course.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed break-words flex-1">
                  {course.description}
                </p>
                <div className="flex items-center gap-3 md:gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center"><Users className="h-3 w-3 mr-1" /> {course.students}</span>
                  <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {course.duration}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{course.instructor}</span>
                  <Award className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;