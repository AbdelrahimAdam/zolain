import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services';
import { BookOpen, Users, Clock, Award, Filter } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, beginner, intermediate, advanced, medical

  // Mock data for demonstration – replace with actual Firestore call
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // In production, use courseService.getAllCourses()
        // For now, simulate with mock data
        const mockCourses = [
          { id: '1', title: 'English for Beginners', level: 'beginner', description: 'Start your English journey from scratch.', instructor: 'Ahmed Ali', students: 120, duration: '8 weeks', image: '/courses/beginner.jpg' },
          { id: '2', title: 'Intermediate Conversation', level: 'intermediate', description: 'Improve your speaking and listening skills.', instructor: 'Sara Hassan', students: 85, duration: '10 weeks' },
          { id: '3', title: 'Advanced Business English', level: 'advanced', description: 'Professional communication for workplace.', instructor: 'John Smith', students: 45, duration: '12 weeks' },
          { id: '4', title: 'Medical Terminology', level: 'medical', description: 'Essential terms for healthcare professionals.', instructor: 'Dr. Mai Eltahir', students: 60, duration: '6 weeks' },
          { id: '5', title: 'Medical Translation Practice', level: 'medical', description: 'Hands-on translation exercises.', instructor: 'Dr. Mai Eltahir', students: 30, duration: '8 weeks' },
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
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    medical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Our Course Catalog
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
        Choose from a variety of levels and specialisations tailored to your goals.
      </p>

      {/* Filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['all', 'beginner', 'intermediate', 'advanced', 'medical'].map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
              filter === level
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80'
            }`}
          >
            {level === 'all' ? 'All Courses' : level}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-6 hover:shadow-xl transition-all hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[course.level] || 'bg-gray-100'}`}>
                  {course.level}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{course.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center"><Users className="h-3 w-3 mr-1" /> {course.students}</span>
                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {course.duration}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{course.instructor}</span>
                <Award className="h-4 w-4 text-yellow-500" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;