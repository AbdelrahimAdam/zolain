import React, { useState, useEffect } from 'react';
import { userService } from '../../services';
import { Mail, BookOpen, Users, Award } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const InstructorProfiles = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration – replace with actual Firestore call
  useEffect(() => {
    const fetchInstructors = async () => {
      setLoading(true);
      try {
        // In production: const data = await userService.getAllUsers({ role: 'teacher' });
        const mockInstructors = [
          {
            id: '1',
            displayName: 'Dr. Mai Eltahir',
            email: 'mai.eltahir@zolain.com',
            bio: 'PhD in Linguistics with 10+ years teaching medical translation.',
            courses: 3,
            students: 200,
            specialty: 'Medical Translation',
            avatar: null,
          },
          {
            id: '2',
            displayName: 'Ahmed Ali',
            email: 'ahmed.ali@zolain.com',
            bio: 'Certified ESL instructor specialised in beginner to intermediate levels.',
            courses: 5,
            students: 350,
            specialty: 'General English',
            avatar: null,
          },
          {
            id: '3',
            displayName: 'Sara Hassan',
            email: 'sara.hassan@zolain.com',
            bio: 'MA in TEFL, passionate about conversational English and exam prep.',
            courses: 4,
            students: 280,
            specialty: 'Conversational English',
            avatar: null,
          },
          {
            id: '4',
            displayName: 'John Smith',
            email: 'john.smith@zolain.com',
            bio: 'Native speaker with business background, teaching advanced business English.',
            courses: 2,
            students: 90,
            specialty: 'Business English',
            avatar: null,
          },
        ];
        setInstructors(mockInstructors);
      } catch (error) {
        console.error('Error loading instructors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Meet Our Instructors
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
        Experienced educators dedicated to your language journey.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructors.map(instructor => (
          <div key={instructor.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-6 hover:shadow-xl transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {instructor.displayName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{instructor.displayName}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">{instructor.specialty}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{instructor.bio}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center"><BookOpen className="h-3 w-3 mr-1" /> {instructor.courses} courses</span>
              <span className="flex items-center"><Users className="h-3 w-3 mr-1" /> {instructor.students} students</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Contact: {instructor.email}</span>
              <Award className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorProfiles;