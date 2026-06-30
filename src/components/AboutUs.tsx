import React from 'react';
import { Award, Compass, HeartHandshake, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';

export default function AboutUs() {
  const { t } = useTranslation();

  const values = [
    {
      icon: ShieldCheck,
      title: t('val1Title'),
      description: t('val1Desc')
    },
    {
      icon: Compass,
      title: t('val2Title'),
      description: t('val2Desc')
    },
    {
      icon: HeartHandshake,
      title: t('val3Title'),
      description: t('val3Desc')
    },
    {
      icon: Award,
      title: t('val4Title'),
      description: t('val4Desc')
    }
  ];

  return (
    <div className="space-y-16 py-8" id="about-section">
      
      {/* Intro block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-800">{t('aboutTitle')}</span>
          
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950 tracking-tight font-medium leading-tight">
            {t('aboutSubtitle')}
          </h2>
          
          <p className="text-stone-600 text-sm leading-relaxed">
            {t('aboutP1')}
          </p>
          
          <p className="text-stone-600 text-sm leading-relaxed">
            {t('aboutP2')}
          </p>

          <p className="text-stone-600 text-sm leading-relaxed">
            {t('aboutP3')}
          </p>
        </div>

        {/* Brand visual showcase */}
        <div className="relative">
          <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-lg border border-stone-200">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200"
              alt="Masserie salentine di pregio"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Accent decoration box */}
          <div className="absolute -bottom-6 -left-6 bg-stone-900 text-white p-6 rounded-xl shadow-xl max-w-xs hidden sm:block border border-stone-850">
            <h4 className="font-serif text-3xl text-amber-500 font-bold mb-1">20+</h4>
            <p className="text-stone-300 text-xs font-medium tracking-wide uppercase">{t('experienceYears')}</p>
          </div>
        </div>
      </div>

      {/* Services and values grid */}
      <div className="bg-stone-50 rounded-3xl p-8 sm:p-12 border border-stone-200">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-800">{t('ourValues')}</span>
          <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">{t('whyChooseUs')}</h3>
          <p className="text-stone-500 text-xs sm:text-sm">
            {t('ourCommitment')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-150 shadow-xs flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-serif text-sm font-semibold text-stone-900">{v.title}</h4>
                  <p className="text-stone-500 text-xs leading-relaxed">{v.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
