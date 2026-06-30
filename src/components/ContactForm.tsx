import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Check, ShieldAlert } from 'lucide-react';
import { addMessage } from '../lib/dbService';
import { InquiryMessage } from '../types';
import { useTranslation } from '../lib/LanguageContext';

export default function ContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError(t('errorFields'));
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const messageData: Omit<InquiryMessage, 'id'> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        createdAt: Date.now(),
        status: 'Nuovo'
      };

      await addMessage(messageData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error(err);
      setError(t('errorMsg'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 space-y-12" id="contact-section">
      
      {/* Cards block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col items-center text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-sm font-semibold text-stone-900">{t('officeLocation')}</h4>
          <p className="text-stone-500 text-xs leading-relaxed">
            Corso Italia, 12<br />15011 Acqui Terme (AL)
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col items-center text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800">
            <Phone className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-sm font-semibold text-stone-900">{t('phone')}</h4>
          <div className="text-stone-500 text-xs leading-relaxed flex flex-col">
            <a href="tel:+390144324578" className="hover:text-amber-800 hover:underline transition-colors">
              Ufficio: +39 0144 324578
            </a>
            <a href="tel:+393479876543" className="hover:text-amber-800 hover:underline transition-colors mt-1">
              Mobile: +39 347 9876543
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col items-center text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-sm font-semibold text-stone-900">{t('email')}</h4>
          <div className="text-stone-500 text-xs leading-relaxed flex flex-col">
            <a href="mailto:info@atlaslabs.it" className="hover:text-amber-800 hover:underline transition-colors break-all">
              info@atlaslabs.it
            </a>
            <a href="mailto:servizi@atlaslabs.it" className="hover:text-amber-800 hover:underline transition-colors mt-1 break-all">
              servizi@atlaslabs.it
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col items-center text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-sm font-semibold text-stone-900">{t('officeHours')}</h4>
          <p className="text-stone-500 text-xs leading-relaxed">
            {t('lunSab')}: 09:00 - 13:00<br />{t('pomeriggio')}: 16:00 - 20:00
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Contact Form Left Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-800 block mb-1">{t('contactHeader')}</span>
            <h3 className="font-serif text-2xl font-medium text-stone-900">{t('contactTitle')}</h3>
            <p className="text-stone-500 text-xs mt-1">
              {t('contactDesc')}
            </p>
          </div>

          {submitted ? (
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-8 text-center space-y-4 my-auto animate-in fade-in zoom-in duration-300">
              <div className="w-14 h-14 bg-amber-800 rounded-full flex items-center justify-center text-white mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-stone-900">{t('thanksTitle')}</h4>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                {t('thanksDesc')}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-amber-800 font-semibold underline underline-offset-4 cursor-pointer"
              >
                {t('sendAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">{t('nameLabel')}</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Es. Marco Neri"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">{t('emailLabel')}</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="marco@example.it"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">{t('phoneLabel')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Es. +39 340 000000"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">{t('msgLabel')}</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder={t('msgPlaceholder')}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs tracking-wider uppercase py-3.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors duration-300 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? t('sending') : t('submitBtn')}
              </button>

            </form>
          )}

        </div>

        {/* Visual Map Frame Right Card */}
        <div className="lg:col-span-5 bg-stone-900 text-white rounded-3xl p-8 flex flex-col justify-between border border-stone-850 relative overflow-hidden">
          
          {/* Abstract Mediterranean Background Art Card */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="space-y-6 relative z-10">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500">{t('contactUs')}</span>
            <h3 className="font-serif text-2xl font-light">{t('whereToFindUs')}</h3>
            
            <p className="text-stone-300 text-xs leading-relaxed">
              {t('officeDesc')}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h5 className="font-semibold text-stone-100">{t('officeTitle')}</h5>
                  <p className="text-stone-400">{t('address')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h5 className="font-semibold text-stone-100">{t('officeHourTitle')}</h5>
                  <p className="text-stone-400">{t('officeHourDesc1')}</p>
                  <p className="text-stone-400">{t('officeHourDesc2')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Aesthetic Stylized Map Drawing */}
          <div className="relative border border-stone-800 rounded-xl bg-stone-950 p-4 mt-6 z-10 aspect-video flex flex-col justify-center items-center shadow-inner overflow-hidden">
            <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
            <div className="relative w-3.5 h-3.5 rounded-full bg-amber-600 border border-white flex items-center justify-center shadow-lg"></div>
            <span className="mt-3 font-serif text-xs font-semibold tracking-widest text-amber-500">{t('mapLabel')}</span>
            <span className="text-[10px] text-stone-500">{t('mapDesc')}</span>
            
            {/* Map Grid Elements Mock */}
            <div className="absolute left-6 top-4 w-12 h-1.5 bg-stone-900 rounded-full opacity-60"></div>
            <div className="absolute right-4 bottom-5 w-20 h-1 bg-stone-900 rounded-full opacity-60"></div>
            <div className="absolute right-8 top-8 w-1 h-14 bg-stone-900 rounded-full opacity-60"></div>
          </div>

        </div>

      </div>

    </div>
  );
}
