import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Globe, Users, Award, ChevronRight, HeartHandshake,
  GraduationCap, FileText, Plane, Scale, Microscope, Languages,
  Headphones, Calendar
} from 'lucide-react';
import Button from '../../components/UI/Button';

const Home = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Structured English Levels',
      description: 'From Starter to Advanced – learn at your own pace with guided lessons.'
    },
    {
      icon: Globe,
      title: 'Medical Translation',
      description: 'Specialised courses for healthcare professionals and translators.'
    },
    {
      icon: Users,
      title: 'Expert Instructors',
      description: 'Native and certified teachers with years of experience.'
    },
    {
      icon: HeartHandshake,
      title: 'Dedicated Support',
      description: 'Personal guidance and feedback throughout your journey.'
    }
  ];

  const englishLevels = [
    { name: 'Starter', description: 'No prior knowledge? Start here! Learn the alphabet, basic greetings, and essential vocabulary to build your first sentences.' },
    { name: 'Beginner', description: 'Lay a solid foundation. Understand simple phrases, introduce yourself, and handle everyday situations with confidence.' },
    { name: 'Pre‑intermediate', description: 'Expand your vocabulary and grammar. Start expressing opinions, describing experiences, and understanding longer texts.' },
    { name: 'Intermediate', description: 'Communicate effectively in most situations. Discuss topics of interest, write coherent paragraphs, and understand native speakers better.' },
    { name: 'Upper‑intermediate', description: 'Refine your fluency. Handle complex conversations, understand implicit meanings, and produce clear, detailed writing.' },
    { name: 'Advanced', description: 'Achieve near‑native proficiency. Master nuanced expressions, academic writing, and professional communication.' }
  ];

  const trainingCourses = [
    {
      icon: FileText,
      name: 'IELTS Preparation',
      description: 'Comprehensive training for all IELTS modules (Academic & General). Benefit from mock tests, personalised feedback, and proven strategies – all live on Google Meet.',
      cta: 'Join IELTS',
      type: 'ielts',
      bgColor: 'bg-purple-200/70 dark:bg-purple-800/40',
      titleColor: 'text-purple-800 dark:text-purple-300'
    },
    {
      icon: GraduationCap,
      name: 'TEFL Certification',
      description: 'Become a certified English teacher. Our TEFL course covers lesson planning, classroom management, and teaching practice via interactive Google Meet sessions.',
      cta: 'Get TEFL Certified',
      type: 'tefl',
      bgColor: 'bg-indigo-200/70 dark:bg-indigo-800/40',
      titleColor: 'text-indigo-800 dark:text-indigo-300'
    },
    {
      icon: Scale,
      name: 'Legal English',
      description: 'Master legal terminology and drafting skills. Designed for lawyers, law students, and translators. Real case studies and contract analysis delivered online.',
      cta: 'Study Legal English',
      type: 'legal',
      bgColor: 'bg-blue-200/70 dark:bg-blue-800/40',
      titleColor: 'text-blue-800 dark:text-blue-300'
    },
    {
      icon: Microscope,
      name: 'Medical English',
      description: 'Essential English for healthcare professionals. Communicate with patients, understand medical literature, and prepare for international exams (OET, PLAB).',
      cta: 'Start Medical English',
      type: 'medical',
      bgColor: 'bg-pink-200/70 dark:bg-pink-800/40',
      titleColor: 'text-pink-800 dark:text-pink-300'
    },
    {
      icon: Plane,
      name: 'English for Aviation',
      description: 'ICAO‑compliant training for pilots and air traffic controllers. Focus on radiotelephony, phraseology, and clear communication under pressure – via Google Meet.',
      cta: 'Aviation English',
      type: 'aviation',
      bgColor: 'bg-cyan-200/70 dark:bg-cyan-800/40',
      titleColor: 'text-cyan-800 dark:text-cyan-300'
    },
    {
      icon: Languages,
      name: 'Translations (Medical & Legal)',
      description: 'Specialised translation courses for medical and legal texts. Hands‑on practice with authentic documents, guided by experienced translators – live online.',
      cta: 'Become a Translator',
      type: 'translation',
      bgColor: 'bg-gray-200/70 dark:bg-gray-700/40',
      titleColor: 'text-gray-800 dark:text-gray-300'
    }
  ];

  const levelBgColors = [
    'bg-green-200/70 dark:bg-green-800/40',
    'bg-green-300/70 dark:bg-green-800/50',
    'bg-yellow-200/70 dark:bg-yellow-800/40',
    'bg-yellow-300/70 dark:bg-yellow-800/50',
    'bg-orange-200/70 dark:bg-orange-800/40',
    'bg-red-200/70 dark:bg-red-800/40'
  ];

  const levelTitleColors = [
    'text-green-800 dark:text-green-300',
    'text-green-900 dark:text-green-200',
    'text-yellow-800 dark:text-yellow-300',
    'text-yellow-900 dark:text-yellow-200',
    'text-orange-800 dark:text-orange-300',
    'text-red-800 dark:text-red-300'
  ];

  return (
    <div className="space-y-12 md:space-y-16 bg-sky-50 dark:bg-sky-900/20 font-sans">
      {/* Hero Banner */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <img
          src="/homepagebanner.jpeg"
          alt="Zolain students learning"
          className="w-full h-auto"
        />
      </div>

      {/* English Levels */}
      <section className="container mx-auto px-2 sm:px-4">
        <h2 className="text-lg md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          English Levels for Every Journey
        </h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-sm md:text-base">
          From absolute beginner to fluent speaker – follow a structured path designed for your success.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
          {englishLevels.map((level, idx) => (
            <div
              key={idx}
              className={`${levelBgColors[idx]} backdrop-blur-sm rounded-2xl border border-blue-100/50 p-3 sm:p-4 md:p-6 hover:shadow-xl transition group flex flex-col h-full`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm md:text-base">{idx + 1}</span>
                </div>
                <Award className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-500" />
              </div>
              <h3 className={`text-sm sm:text-base md:text-xl font-bold ${levelTitleColors[idx]} mb-2 leading-tight break-words`}>
                {level.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed break-words flex-1">
                {level.description}
              </p>
              <Link
                to={`/courses?level=${level.name.toLowerCase()}`}
                className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm hover:underline mt-2"
              >
                Explore courses <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Specialised Training Courses */}
      <section className="container mx-auto px-2 sm:px-4">
        <h2 className="text-lg md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Specialised Training Courses
        </h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-sm md:text-base">
          All courses are delivered live via <strong>Google Meet</strong> – available to students across all states of Sudan.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
          {trainingCourses.map((course, idx) => {
            const Icon = course.icon;
            return (
              <div
                key={idx}
                className={`${course.bgColor} backdrop-blur-sm rounded-2xl border border-blue-100/50 p-3 sm:p-4 md:p-6 hover:shadow-xl transition group flex flex-col h-full`}
              >
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition flex-shrink-0">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <h3 className={`text-sm sm:text-base md:text-xl font-bold ${course.titleColor} leading-tight break-words`}>
                    {course.name}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed break-words flex-1">
                  {course.description}
                </p>
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <Headphones className="h-3 w-3 mr-1 flex-shrink-0" /> Live on Google Meet
                  </span>
                  <Link to={`/courses?type=${course.type}`} className="w-full sm:w-auto">
                    <Button size="sm" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs sm:text-sm">
                      {course.cta} <Calendar className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 text-center py-12">
        <h2 className="text-xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Ready to begin your journey?
        </h2>
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-8">
          Join Zolain today and unlock your potential.
        </p>
        <Link to="/register">
          <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 text-sm md:text-base">
            Register Now <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </Link>
      </section>

      {/* Why Choose Us - moved to bottom */}
      <section className="container mx-auto px-2 sm:px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900 dark:text-white">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-blue-200/70 dark:bg-blue-800/40 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-3 sm:p-4 md:p-6 hover:shadow-xl transition group flex flex-col h-full"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-blue-800 dark:text-blue-300 mb-1 md:mb-2 leading-tight break-words">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;