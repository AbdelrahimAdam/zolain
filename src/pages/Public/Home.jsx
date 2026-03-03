import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, Users, Award, ChevronRight, HeartHandshake } from 'lucide-react';
import Button from '../../components/UI/Button';

const Home = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Structured English Levels',
      description: 'From Beginner to Advanced – learn at your own pace with guided lessons.'
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

  const levels = [
    { name: 'Beginner', description: 'Start from basics – alphabet, greetings, and simple conversations.' },
    { name: 'Intermediate', description: 'Build confidence in speaking, writing, and understanding.' },
    { name: 'Advanced', description: 'Master fluency, business English, and academic writing.' },
    { name: 'Medical Translation', description: 'Specialised terminology and practice for medical contexts.' }
  ];

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Banner – full width, elastic height, no gaps */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <img
          src="/homepagebanner.jpeg"
          alt="Zolain students learning"
          className="w-full h-auto"
        />
      </div>

      {/* Features Grid */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-6 hover:shadow-xl transition group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Learning Levels */}
      <section className="container mx-auto px-4">
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl border border-blue-100/50 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Learning Levels</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {levels.map((level, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{idx + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{level.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Ready to begin your journey?</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Join Zolain today and unlock your potential.</p>
        <Link to="/register">
          <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8">
            Register Now <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Home;