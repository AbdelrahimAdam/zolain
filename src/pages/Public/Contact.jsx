import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
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

  // WhatsApp link – replace with your actual number (include country code, no plus)
  const whatsappNumber = '249903806123'; 
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Contact Zolain
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
        Have questions? We're here to help – reach out anytime!
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-8 space-y-6">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>

          {/* WhatsApp – new */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start space-x-4 p-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition group"
          >
            <MessageCircle className="h-6 w-6 text-green-500 flex-shrink-0 group-hover:scale-110 transition" />
            <div>
              <p className="font-medium">WhatsApp</p>
              <p className="text-gray-600 dark:text-gray-400">Chat with us directly</p>
              <span className="text-sm text-green-600 dark:text-green-400">Click to open WhatsApp</span>
            </div>
          </a>

          <div className="flex items-start space-x-4">
            <MapPin className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-gray-600 dark:text-gray-400"> Khartoum, Sudan</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Phone className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-gray-600 dark:text-gray-400">+249 903806123</p>
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

      {/* Additional WhatsApp CTA for mobile users */}
      <div className="mt-8 text-center md:hidden">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:bg-green-600 transition"
        >
          <MessageCircle className="h-5 w-5" />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
};

export default Contact;