import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import Button from '../../components/UI/Button';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, send to backend or EmailJS
    console.log('Contact form:', form);
    setSubmitted(true);
    // Reset after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Contact Zolain
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
        Have questions? We're here to help.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-8 space-y-6">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <div className="flex items-start space-x-4">
            <MapPin className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-gray-600 dark:text-gray-400">Al Amarat, Khartoum, Sudan</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Phone className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-gray-600 dark:text-gray-400">+249 123 456 789</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Mail className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-gray-600 dark:text-gray-400">info@zolain.com</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Clock className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Working Hours</p>
              <p className="text-gray-600 dark:text-gray-400">Sat-Thu: 9:00 AM - 6:00 PM</p>
              <p className="text-gray-600 dark:text-gray-400">Friday: Closed</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-8">
          {submitted ? (
            <div className="text-center py-12">
              <Send className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
              <p className="text-gray-600 dark:text-gray-400">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  rows="4"
                  required
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
                  placeholder="How can we help you?"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;