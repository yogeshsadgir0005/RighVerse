import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/axios'; // 👇 Updated to use your custom axios setup

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Frontend: Form submission triggered.");

    if (!formData.name || !formData.email || !formData.message) {
      return toast.error("Please fill in all required fields.");
    }

    setIsSubmitting(true);
    try {
      console.log("Frontend: Sending POST request to backend...");
      
      // 👇 Updated to use the api instance instead of hardcoded localhost
      const response = await api.post('/contact', formData);
      
      console.log("Frontend: Server response received successfully:", response.data);
      toast.success('Message sent successfully! We will get back to you soon.');
      
      // Reset form
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      
    } catch (error) {
      console.error("Frontend Error: Failed to send message.", error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12 px-4 font-sans text-[#785F3F] relative overflow-hidden"> 
      
      <style>{`
        .watermark-bg::before {
          content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; background-position: center; background-size: cover; opacity: 0.05;
          pointer-events: none; z-index: 0;
        }
        .contact-card {
          transition: all 0.3s ease-out;
        }
        .contact-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(184,154,106,0.15);
          border-color: #B89A6A;
        }
        .icon-wrapper {
          transition: all 0.3s ease;
        }
        .contact-card:hover .icon-wrapper {
          background-color: #E9E3D9;
          color: #B89A6A;
          transform: scale(1.1);
        }
        .form-input {
          transition: all 0.3s ease;
        }
        .form-input:focus {
          border-color: #B89A6A;
          box-shadow: 0 0 15px rgba(184,154,106,0.1);
          background-color: #F5F1E8;
        }
      `}</style>

      {/* --- HERO SECTION --- */}
      <div className="container mx-auto text-center mb-16 max-w-3xl relative z-10 watermark-bg">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#B89A6A] mb-6 tracking-wide">
          Get in Touch
        </h1>
        <p className="text-[#785F3F] text-lg leading-relaxed font-medium">
          We are here to help. Whether you have a legal query, need platform support, or want to partner with us, reach out through the channels below.
        </p>
      </div>

      {/* --- SECTION 1: CONTACT CARDS --- */}
      <div className="container mx-auto max-w-6xl mb-20 relative z-10 watermark-bg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="contact-card bg-[#E9E3D9] p-10 rounded-[24px] border border-[#D2C4AE] flex flex-col items-center text-center cursor-pointer">
            <div className="icon-wrapper w-16 h-16 bg-[#F5F1E8] rounded-full border border-[#D2C4AE] flex items-center justify-center text-[#B89AAA] mb-6">
              <Mail size={28} />
            </div>
            <h3 className="font-serif font-bold text-2xl mb-2 text-[#785F3F]">Email Us</h3>
            <p className="text-[#D2C4AE] text-sm mb-5 font-bold uppercase tracking-widest">For general inquiries & support</p>
            <a href="mailto:amatul27safura@gmail.com" className="text-[#B89A6A] font-bold hover:text-[#785F3F] transition-colors text-lg">
           amatul27safura@gmail.com
            </a>
          </div>

          <div className="contact-card bg-[#E9E3D9] p-10 rounded-[24px] border border-[#D2C4AE] flex flex-col items-center text-center cursor-pointer">
            <div className="icon-wrapper w-16 h-16 bg-[#F5F1E8] rounded-full border border-[#D2C4AE] flex items-center justify-center text-[#B89AAA] mb-6">
              <Phone size={28} />
            </div>
            <h3 className="font-serif font-bold text-2xl mb-2 text-[#785F3F]">Call Us</h3>
            <p className="text-[#D2C4AE] text-sm mb-5 font-bold uppercase tracking-widest">Mon-Fri, 9am - 6pm</p>
            <a href="tel:+919371192765" className="text-[#B89A6A] font-bold hover:text-[#785F3F] transition-colors text-lg">
            +91 9371192765
            </a>
          </div>

        

        </div>
      </div>

      {/* --- SECTION 2: CENTERED FORM --- */}
      <div className="container mx-auto max-w-4xl relative z-10 watermark-bg">
        <div className="bg-[#E9E3D9] rounded-[24px] border border-[#D2C4AE] shadow-[0_15px_40px_rgba(184,154,106,0.15)] overflow-hidden">
          
          {/* Header Bar inside Form */}
          <div className="bg-[#333333] border-b-2 border-[#B89A6A] text-[#F5F1E8] p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/india-map-watermark.png')] bg-no-repeat bg-center bg-cover opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-serif font-bold mb-3 text-[#B89A6A]">Send us a Message</h2>
              <p className="text-[#D2C4AE] text-base">Fill out the form below and our legal team will get back to you.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-8 bg-[#E9E3D9]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-[#B89A6A] tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe" 
                    className="form-input w-full p-4 rounded-[16px] border border-[#D2C4AE] focus:outline-none bg-[#F5F1E8] text-[#785F3F] placeholder-[#D2C4AE]" 
                    required
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-[#B89A6A] tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com" 
                    className="form-input w-full p-4 rounded-[16px] border border-[#D2C4AE] focus:outline-none bg-[#F5F1E8] text-[#785F3F] placeholder-[#D2C4AE]" 
                    required
                  />
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-xs font-bold uppercase text-[#B89A6A] tracking-widest">Subject</label>
               <select 
                 name="subject"
                 value={formData.subject}
                 onChange={handleChange}
                 className="form-input w-full p-4 rounded-[16px] border border-[#D2C4AE] focus:outline-none bg-[#F5F1E8] text-[#785F3F] appearance-none"
               >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Legal Template Support">Legal Template Support</option>
                  <option value="Report a Bug">Report a Bug</option>
                  <option value="Partnership Proposal">Partnership Proposal</option>
               </select>
            </div>

            <div className="space-y-3">
               <label className="text-xs font-bold uppercase text-[#B89A6A] tracking-widest">Message</label>
               <textarea 
                 name="message"
                 value={formData.message}
                 onChange={handleChange}
                 rows={6} 
                 placeholder="How can we help you today?" 
                 className="form-input w-full p-5 rounded-[16px] border border-[#D2C4AE] focus:outline-none resize-none bg-[#F5F1E8] text-[#785F3F] placeholder-[#D2C4AE]"
                 required
               ></textarea>
            </div>

            <div className="flex flex-col items-center gap-5 pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto px-12 bg-[#333333] text-white py-4 rounded-full font-bold uppercase tracking-wider hover:bg-[#785F3F] hover:shadow-[0_10px_20px_rgba(184,154,170,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
              >
                 <Send size={20} /> {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              <p className="text-xs font-bold text-[#D2C4AE] tracking-wide uppercase">
                 We respect your privacy. Your information is safe with us.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}