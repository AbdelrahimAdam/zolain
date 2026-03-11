import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Globe, Users, Award, ChevronRight, HeartHandshake,
  GraduationCap, FileText, Plane, Scale, Microscope, Languages,
  Headphones, Calendar, Facebook, MessageCircle, Mail,
  Scale as ScaleIcon, Mic, FileText as FileTextIcon, MessageSquare,
  Briefcase, MapPin, Search, PenTool, Book
} from 'lucide-react';
import Button from '../../components/UI/Button';

const Home = () => {
  // Features (Why Choose Us)
  const features = [
    {
      icon: BookOpen,
      title: 'Structured English Levels',
      description: 'From Starter to Advanced – learn at your own pace with guided lessons.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop'
    },
    {
      icon: Globe,
      title: 'Medical Translation',
      description: 'Specialised courses for healthcare professionals and translators.',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop' // Updated medical image
    },
    {
      icon: Users,
      title: 'Expert Instructors',
      description: 'Native and certified teachers with years of experience.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'
    },
    {
      icon: HeartHandshake,
      title: 'Dedicated Support',
      description: 'Personal guidance and feedback throughout your journey.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop'
    }
  ];

  // English Levels
  const englishLevels = [
    { name: 'Starter', description: 'No prior knowledge? Start here! Learn the alphabet, basic greetings, and essential vocabulary to build your first sentences.', image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=400&h=300&fit=crop' },
    { name: 'Beginner', description: 'Lay a solid foundation. Understand simple phrases, introduce yourself, and handle everyday situations with confidence.', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop' },
    { name: 'Pre‑intermediate', description: 'Expand your vocabulary and grammar. Start expressing opinions, describing experiences, and understanding longer texts.', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop' },
    { name: 'Intermediate', description: 'Communicate effectively in most situations. Discuss topics of interest, write coherent paragraphs, and understand native speakers better.', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop' },
    { name: 'Upper‑intermediate', description: 'Refine your fluency. Handle complex conversations, understand implicit meanings, and produce clear, detailed writing.', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop' },
    { name: 'Advanced', description: 'Achieve near‑native proficiency. Master nuanced expressions, academic writing, and professional communication.', image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=300&fit=crop' }
  ];

  // Translation Services
  const translationServices = [
    {
      icon: FileTextIcon,
      name: 'Medical Translation',
      description: 'Specialised translation for medical documents, clinical trials, and healthcare records – live online.',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop',
      type: 'translation',
      cta: 'Explore Medical Translation'
    },
    {
      icon: ScaleIcon,
      name: 'Legal Translation',
      description: 'Certified translation of contracts, court documents, and patents – accurate and confidential.',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
      type: 'translation',
      cta: 'Explore Legal Translation'
    },
    {
      icon: Mic,
      name: 'Live Translation',
      description: 'Real‑time interpretation for conferences, meetings, and events – bridging language barriers instantly.',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop',
      type: 'live',
      cta: 'Request Live Translation'
    },
    {
      icon: Languages,
      name: 'General Translation',
      description: 'Professional translation for documents, websites, and marketing materials – any language pair.',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
      type: 'translation',
      cta: 'Get a Quote'
    }
  ];

  // Live Google Meet Training Courses
  const trainingCourses = [
    {
      icon: FileText,
      name: 'IELTS Preparation',
      description: 'Comprehensive training for all IELTS modules (Academic & General). Live mock tests and feedback.',
      cta: 'Join IELTS',
      type: 'ielts',
      bgColor: 'bg-purple-200/70 dark:bg-purple-800/40',
      titleColor: 'text-purple-800 dark:text-purple-300',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop'
    },
    {
      icon: GraduationCap,
      name: 'TEFL Certification',
      description: 'Become a certified English teacher. Lesson planning and teaching practice via Google Meet.',
      cta: 'Get TEFL Certified',
      type: 'tefl',
      bgColor: 'bg-indigo-200/70 dark:bg-indigo-800/40',
      titleColor: 'text-indigo-800 dark:text-indigo-300',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'
    },
    {
      icon: Scale,
      name: 'Legal English',
      description: 'Master legal terminology and drafting. Real case studies – live online.',
      cta: 'Study Legal English',
      type: 'legal',
      bgColor: 'bg-blue-200/70 dark:bg-blue-800/40',
      titleColor: 'text-blue-800 dark:text-blue-300',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop'
    },
    {
      icon: Microscope,
      name: 'Medical English',
      description: 'Essential English for healthcare professionals. Communicate with patients and colleagues.',
      cta: 'Start Medical English',
      type: 'medical',
      bgColor: 'bg-pink-200/70 dark:bg-pink-800/40',
      titleColor: 'text-pink-800 dark:text-pink-300',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop'
    },
    {
      icon: Plane,
      name: 'English for Aviation',
      description: 'ICAO‑compliant training for pilots and air traffic controllers – live on Google Meet.',
      cta: 'Aviation English',
      type: 'aviation',
      bgColor: 'bg-cyan-200/70 dark:bg-cyan-800/40',
      titleColor: 'text-cyan-800 dark:text-cyan-300',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop'
    },
    {
      icon: Languages,
      name: 'Translations (Medical & Legal)',
      description: 'Hands‑on translation practice with authentic documents – live online.',
      cta: 'Become a Translator',
      type: 'translation',
      bgColor: 'bg-gray-200/70 dark:bg-gray-700/40',
      titleColor: 'text-gray-800 dark:text-gray-300',
      image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop'
    },
    {
      icon: Briefcase,
      name: 'English for Specific Purposes',
      description: 'Tailored English for business, engineering, IT – live online sessions.',
      cta: 'Join ESP',
      type: 'esp',
      bgColor: 'bg-teal-200/70 dark:bg-teal-800/40',
      titleColor: 'text-teal-800 dark:text-teal-300',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop'
    },
    {
      icon: MapPin,
      name: 'English for Tourism & Hospitality',
      description: 'Learn the language of travel, hotels, and customer service – live on Google Meet.',
      cta: 'Explore Tourism',
      type: 'tourism',
      bgColor: 'bg-amber-200/70 dark:bg-amber-800/40',
      titleColor: 'text-amber-800 dark:text-amber-300',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop' // Updated tourism image
    }
  ];

  // Research & Academic Consultation
  const researchServices = [
    {
      icon: Search,
      name: 'Research Consultation',
      description: 'Expert guidance for academic research in humanities, linguistics, and literature – from proposal to publication.',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop',
      link: '/contact'
    },
    {
      icon: FileText,
      name: 'Thesis & Dissertation Support',
      description: 'Comprehensive assistance with thesis writing, editing, and formatting – tailored to university guidelines.',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
      link: '/contact'
    },
    {
      icon: PenTool,
      name: 'Academic Editing',
      description: 'Professional editing for papers, articles, and books – ensuring clarity, coherence, and correct language.',
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&h=300&fit=crop',
      link: '/contact'
    },
    {
      icon: Book,
      name: 'Literature Analysis',
      description: 'In‑depth analysis of English literary texts, critical essays, and interpretation for students and researchers.',
      image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop',
      link: '/contact'
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
          loading="lazy"
          decoding="async"
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {englishLevels.map((level, idx) => (
            <div
              key={idx}
              className={`${levelBgColors[idx]} backdrop-blur-sm rounded-2xl border border-blue-100/50 overflow-hidden hover:shadow-xl transition group flex flex-col h-full`}
            >
              <div className="h-32 sm:h-40 overflow-hidden">
                <img
                  src={level.image}
                  alt={level.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base">{idx + 1}</span>
                  </div>
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                </div>
                <h3 className={`text-base sm:text-lg md:text-xl font-bold ${levelTitleColors[idx]} mb-2 leading-tight break-words`}>
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
            </div>
          ))}
        </div>
      </section>

      {/* Translation Services */}
      <section className="container mx-auto px-2 sm:px-4">
        <h2 className="text-lg md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Professional Translation Services
        </h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-sm md:text-base">
          We offer accurate, certified translation for all your needs – medical, legal, live interpretation, and more.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {translationServices.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-blue-100/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full"
              >
                <div className="h-32 sm:h-36 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed flex-1">
                    {service.description}
                  </p>
                  <Link
                    to={`/courses?type=${service.type}`}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline mt-2"
                  >
                    {service.cta} <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Google Meet Training Courses */}
      <section className="container mx-auto px-2 sm:px-4">
        <h2 className="text-lg md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Live Google Meet Training Courses
        </h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-sm md:text-base">
          All courses are delivered live via <strong>Google Meet</strong> – available to students across all states of Sudan.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {trainingCourses.map((course, idx) => {
            const Icon = course.icon;
            return (
              <div
                key={idx}
                className={`${course.bgColor} backdrop-blur-sm rounded-2xl border border-blue-100/50 overflow-hidden hover:shadow-xl transition group flex flex-col h-full`}
              >
                <div className="h-32 sm:h-36 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition flex-shrink-0">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <h3 className={`text-sm sm:text-base font-bold ${course.titleColor} leading-tight break-words`}>
                      {course.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed break-words flex-1">
                    {course.description}
                  </p>
                  <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <Headphones className="h-3 w-3 mr-1 flex-shrink-0" /> Live on Google Meet
                    </span>
                    <Link to={`/courses?type=${course.type}`} className="w-full sm:w-auto">
                      <Button size="xs" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs sm:text-sm">
                        {course.cta} <Calendar className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Research & Academic Consultation */}
      <section className="container mx-auto px-2 sm:px-4">
        <h2 className="text-lg md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Research & Academic Consultation in Humanities, English Language & Literature
        </h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-sm md:text-base">
          Expert academic support for humanities, English language, and literature research.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {researchServices.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-blue-100/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full"
              >
                <div className="h-32 sm:h-36 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed flex-1">
                    {service.description}
                  </p>
                  <Link
                    to={service.link}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline mt-2"
                  >
                    Learn more <ChevronRight className="h-3 w-3 ml-1" />
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

      {/* Why Choose Us */}
      <section className="container mx-auto px-2 sm:px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900 dark:text-white">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-blue-200/70 dark:bg-blue-800/40 backdrop-blur-sm rounded-2xl border border-blue-200/50 overflow-hidden hover:shadow-xl transition group flex flex-col h-full"
              >
                <div className="h-28 sm:h-32 overflow-hidden">
                  <img
                    src={feat.image}
                    alt={feat.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-800 dark:text-blue-300 mb-1 leading-tight break-words">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;