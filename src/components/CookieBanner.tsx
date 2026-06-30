import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-stone-900 text-stone-100 p-6 rounded-2xl shadow-2xl z-50 border border-stone-800"
        >
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-amber-500 shrink-0" />
            <div className="space-y-3">
              <h4 className="font-semibold text-sm font-serif">Informativa Privacy & Cookies</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Utilizziamo cookie tecnici e di analisi conformi al GDPR e all'AI Act per migliorare la tua esperienza e garantire la trasparenza nelle nostre interazioni.
              </p>
              <button
                onClick={acceptCookies}
                className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Accetta e Continua
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
