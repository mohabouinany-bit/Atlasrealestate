import React, { useState } from 'react';
import { Home, Building2, HelpCircle, Mail, UserCheck, Menu, X } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';
import { languages } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function Header({ currentTab, setCurrentTab, isAdmin, onLogout }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  const menuItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'properties', label: t('properties'), icon: Building2 },
    { id: 'about', label: t('about'), icon: HelpCircle },
    { id: 'contact', label: t('contact'), icon: Mail },
  ];

  const handleNav = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Brand Name */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex flex-col cursor-pointer select-none group"
            id="header-brand-logo"
          >
            <span className="font-serif text-2xl tracking-[0.15em] font-light text-stone-900 group-hover:text-amber-800 transition-colors duration-300">
              ATLAS
            </span>
            <span className="font-sans text-[0.65rem] tracking-[0.25em] text-stone-500 font-medium uppercase text-center md:text-left">
              REAL ESTATE • ACQUI TERME
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" id="desktop-nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 text-sm tracking-wider uppercase font-medium transition-all duration-300 relative py-2 ${
                    isActive 
                      ? 'text-stone-950 font-semibold' 
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  {item.label}
                  {isActive && (
                    <motion.span 
                      layoutId="activeTabIndicator"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-700 rounded-full" 
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Language Selector & Auth Section */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Elegant Language Buttons */}
            <div className="flex items-center gap-1 bg-stone-150 p-1 rounded-xl border border-stone-200" id="desktop-language-switcher">
              {languages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    title={lang.name}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-stone-900 shadow-sm border border-stone-200/85'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-white/40'
                    }`}
                  >
                    <span className="text-sm leading-none select-none">{lang.flag}</span>
                    <span className="text-[10px] tracking-wide font-sans">{lang.shortName}</span>
                  </button>
                );
              })}
            </div>

            {/* Admin / Portal Access */}
            <div className="flex items-center">
              {isAdmin ? (
                <div className="flex items-center gap-4">
                  <span className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200/50 font-medium font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    ADMIN
                  </span>
                  <button
                    onClick={() => handleNav('admin')}
                    className={`text-sm tracking-wider uppercase font-medium px-4 py-2 rounded-md transition-all duration-300 ${
                      currentTab === 'admin'
                        ? 'bg-stone-950 text-white shadow-md'
                        : 'border border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {t('adminPanel')}
                  </button>
                  <button
                    onClick={onLogout}
                    className="text-xs text-stone-500 hover:text-red-600 underline underline-offset-4 transition-colors"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNav('admin')}
                  className="text-xs tracking-wider uppercase font-medium text-stone-500 hover:text-amber-800 border-b border-transparent hover:border-amber-800 transition-all duration-300 py-1 flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {t('adminArea')}
                </button>
              )}
            </div>

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {isAdmin && (
              <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-1 rounded-full border border-amber-200 font-mono">
                ADMIN
              </span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-700 hover:text-stone-900 focus:outline-none p-1.5 rounded-md hover:bg-stone-100 transition-colors"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-3 shadow-lg overflow-hidden"
          >
            
            {/* Mobile Language Grid */}
            <div className="border-b border-stone-100 pb-3 mb-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">Seleziona Lingua / Language</span>
              <div className="grid grid-cols-5 gap-1.5" id="mobile-language-switcher">
                {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-lg mb-0.5 select-none">{lang.flag}</span>
                      <span className="text-[9px] tracking-wide font-bold">{lang.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm tracking-wider uppercase font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-amber-50/50 text-amber-900 font-semibold border-l-4 border-amber-700' 
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-stone-500" />
                  {item.label}
                </button>
              );
            })}
            
            <div className="border-t border-stone-100 pt-3 mt-2">
              {isAdmin ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleNav('admin')}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm tracking-wider uppercase font-medium rounded-lg transition-colors ${
                      currentTab === 'admin' 
                        ? 'bg-stone-950 text-white font-semibold' 
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    {t('adminPanel')}
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-center text-xs text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNav('admin')}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm tracking-wider uppercase font-medium text-stone-600 hover:text-amber-800 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-stone-400" />
                  {t('adminArea')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
