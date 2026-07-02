import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchFilters from './components/SearchFilters';
import PropertyCard from './components/PropertyCard';
import PropertyDetail from './components/PropertyDetail';
import AboutUs from './components/AboutUs';
import ContactForm from './components/ContactForm';
import AdminDashboard from './components/AdminDashboard';
import CookieBanner from './components/CookieBanner';
import { Property } from './types';
import { getProperties, initDb } from './lib/dbService';
import { useTranslation } from './lib/LanguageContext';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Building2, ArrowRight, Sparkle, Loader2, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';

function PropertyDetailWrapper({ properties }: { properties: Property[] }) {
  const { id } = useParams<{ id: string }>();
  const property = properties.find(p => p.id === id);

  if (!property) return <div className="text-center py-20">Immobile non trovato.</div>;

  return <PropertyDetail property={property} />;
}

export default function App() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const userEmail = user.email.toLowerCase();
        if (userEmail === 'mohabouinany@gmail.com' || userEmail === 'admin@atlaslabs.it' || userEmail === 'admin@passioneimmobiliare.it') {
          setIsAdmin(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Filters State
  const initialFilters = {
    search: '',
    status: 'Tutti',
    type: 'Tutti',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  };
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        // Initialize DB schema & seed backup
        await initDb();
        // Load properties
        const list = await getProperties();
        setProperties(list);
      } catch (err) {
        console.error("Error bootstraping data:", err);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []); // Removed [currentTab] dependency

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Error signing out:", e);
    }
    setIsAdmin(false);
    navigate('/');
  };

  // Filter application logic
  const filteredProperties = properties.filter((prop) => {
    // 1. Text Search (title, location, description)
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const matchTitle = prop.title?.toLowerCase().includes(q);
      const matchLoc = prop.location?.toLowerCase().includes(q);
      const matchDesc = prop.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchDesc) return false;
    }

    // 2. Status (Sale vs Rent)
    if (filters.status !== 'Tutti' && prop.status !== filters.status) {
      return false;
    }

    // 3. Property Type
    if (filters.type !== 'Tutti' && prop.type !== filters.type) {
      return false;
    }

    // 4. Min Price
    if (filters.minPrice && prop.price < parseFloat(filters.minPrice)) {
      return false;
    }

    // 5. Max Price
    if (filters.maxPrice && prop.price > parseFloat(filters.maxPrice)) {
      return false;
    }

    // 6. Bedrooms count
    if (filters.bedrooms && prop.bedrooms < parseInt(filters.bedrooms)) {
      return false;
    }

    // 7. Bathrooms count
    if (filters.bathrooms && prop.bathrooms < parseInt(filters.bathrooms)) {
      return false;
    }

    return true;
  });

  // Split featured listings for the Home view
  const featuredListings = filteredProperties.filter(p => p.featured);

  // Helper check if filters are currently active
  const isFilteringActive = 
    filters.search !== '' || 
    filters.status !== 'Tutti' || 
    filters.type !== 'Tutti' || 
    filters.minPrice !== '' || 
    filters.maxPrice !== '' || 
    filters.bedrooms !== '' || 
    filters.bathrooms !== '';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans" id="main-applet-root">
      
      {/* HEADER SECTION */}
      <Header 
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {/* VIEW SWITCHER ROUTING */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes>
            
            {/* VIEW A: HOME / LANDING PAGE */}
            <Route path="/" element={
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-16"
              >
              
              {/* HERO BANNER SECTION */}
              <section className="relative rounded-3xl overflow-hidden bg-stone-950 border border-stone-850 shadow-xl" id="home-hero-banner">
                {/* Immersive Piemonte Landscape Cover */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&q=80&w=1600"
                    alt="Monferrato Piedmont Hills Background"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-35 filter brightness-90 saturate-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
                </div>

                {/* Text content inside Hero */}
                <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-24 max-w-3xl space-y-6 text-white text-left">
                  <span className="text-amber-500 text-xs sm:text-sm font-bold uppercase tracking-[0.25em] flex items-center gap-1.5">
                    <Sparkle className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {t('luxuryRealEstate')}
                  </span>
                  
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1]">
                    {t('heroTitlePart1')} <br />
                    <span className="font-semibold text-amber-500">{t('heroTitlePart2')}</span>
                  </h1>
                  
                  <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
                    {t('heroSubtitle')}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link
                      to="/properties"
                      className="bg-amber-800 hover:bg-amber-900 text-white px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      {t('browseProps')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/contact"
                      className="bg-transparent hover:bg-white/10 text-stone-100 border border-stone-500 hover:border-stone-100 px-5 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {t('reqConsultation')}
                    </Link>
                  </div>
                </div>
              </section>

              {/* INTEGRATED COMPACT FILTERS */}
              <section className="relative z-20">
                <SearchFilters
                  filters={filters}
                  setFilters={setFilters}
                  onReset={handleResetFilters}
                  compact={true}
                />
              </section>

              {/* LIVE RESULTS / FEATURED GRID */}
              <section className="space-y-8">
                
                {isFilteringActive ? (
                  // 1. FILTERED ACTIVE RESULTS VIEW
                  <div className="space-y-6">
                    <div className="flex justify-between items-baseline border-b border-stone-200 pb-3">
                      <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-900">
                        {t('searchResults')} ({filteredProperties.length})
                      </h3>
                      <button
                        onClick={handleResetFilters}
                        className="text-xs text-amber-800 font-semibold hover:underline cursor-pointer"
                      >
                        {t('resetFilters')}
                      </button>
                    </div>

                    {loading ? (
                      <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto mb-2" />
                        <p className="text-stone-500 text-xs">Ricerca in corso...</p>
                      </div>
                    ) : filteredProperties.length === 0 ? (
                      <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
                        <p className="text-stone-500 text-sm font-semibold">Nessun immobile corrisponde ai filtri selezionati.</p>
                        <button
                          onClick={handleResetFilters}
                          className="mt-3 bg-stone-900 hover:bg-stone-850 text-white font-medium text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Mostra tutti gli immobili
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {filteredProperties.map((prop) => (
                          <PropertyCard 
                            key={prop.id} 
                            property={prop} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // 2. STANDARD DEFAULT FEATURED IMMOBILI VIEW
                  <div className="space-y-12">
                    
                    {/* Featured grid */}
                    <div className="space-y-6">
                      <div className="text-center sm:text-left space-y-1">
                        <span className="text-xs uppercase tracking-widest font-bold text-amber-800">Selezione Premium</span>
                        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">{t('featuredListings')}</h3>
                      </div>

                      {loading ? (
                        <div className="text-center py-12">
                          <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                          {featuredListings.map((prop) => (
                            <PropertyCard 
                              key={prop.id} 
                              property={prop} 
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rest of the catalog shortcut */}
                    <div className="text-center py-4">
                      <Link
                        to="/properties"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 hover:text-amber-800 hover:gap-3 transition-all duration-350"
                      >
                        Vedi l'intero catalogo immobiliare ({properties.length} immobili)
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </Link>
                    </div>

                  </div>
                )}

              </section>

              {/* SERVICES MASONRY SECTION */}
              <section className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 border border-stone-850 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:12px_12px]"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                  <div className="lg:col-span-5 space-y-4 text-left">
                    <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">Servizi Immobiliari d'Eccellenza</span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-light leading-tight">Valorizziamo la tua proprietà a livello internazionale</h3>
                    <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                      Siamo specializzati nella promozione di casali d'epoca, rustici storici e ville di prestigio nel Monferrato. Offriamo assistenza contrattuale e legale completa, servizio fotografico dedicato ed esposizione sui principali portali europei.
                    </p>
                    <div className="pt-2">
                      <Link
                        to="/contact"
                        className="bg-amber-800 hover:bg-amber-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Richiedi Valutazione Gratuita
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800/80 space-y-2 text-left">
                      <div className="w-9 h-9 bg-amber-950 text-amber-500 rounded-full flex items-center justify-center font-bold">1</div>
                      <h5 className="text-sm font-semibold font-serif text-stone-100">Stima di Mercato Reale</h5>
                      <p className="text-stone-400 text-xs leading-relaxed">Valutazioni precise basate sullo storico delle transazioni locali e andamento macroeconomico.</p>
                    </div>

                    <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800/80 space-y-2 text-left">
                      <div className="w-9 h-9 bg-amber-950 text-amber-500 rounded-full flex items-center justify-center font-bold">2</div>
                      <h5 className="text-sm font-semibold font-serif text-stone-100">Visual Marketing d'Impatto</h5>
                      <p className="text-stone-400 text-xs leading-relaxed">Servizi fotografici con drone, virtual tour 3D ed inserzioni curate in 4 lingue.</p>
                    </div>

                    <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800/80 space-y-2 text-left">
                      <div className="w-9 h-9 bg-amber-950 text-amber-500 rounded-full flex items-center justify-center font-bold">3</div>
                      <h5 className="text-sm font-semibold font-serif text-stone-100">Assistenza Legale e Fiscale</h5>
                      <p className="text-stone-400 text-xs leading-relaxed">Verifica catastale preventiva, conformità urbanistica e supporto per agevolazioni fiscali estere.</p>
                    </div>

                    <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800/80 space-y-2 text-left">
                      <div className="w-9 h-9 bg-amber-950 text-amber-500 rounded-full flex items-center justify-center font-bold">4</div>
                      <h5 className="text-sm font-semibold font-serif text-stone-100">Burocrazia Semplificata</h5>
                      <p className="text-stone-400 text-xs leading-relaxed">Gestione pratiche di compravendita e locazione turistica per farti risparmiare tempo prezioso.</p>
                    </div>
                  </div>
                </div>
              </section>

              </motion.div>
            }/>
            
            {/* PROPERTY DETAIL ROUTE */}
            <Route path="/properties/:id" element={<PropertyDetailWrapper properties={properties} />} />

            {/* VIEW B: PROPERTY SEARCH DIRECTORY */}
            <Route path="/properties" element={
              <motion.div
                key="properties"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-800 block">Catalogo Immobili</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-950">{t('findYourCorner')}</h2>
                <p className="text-stone-500 text-xs sm:text-sm">{t('filterSubtitle')}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                
                {/* Left sidebar filters */}
                <div className="lg:col-span-1">
                  <SearchFilters
                    filters={filters}
                    setFilters={setFilters}
                    onReset={handleResetFilters}
                    compact={false}
                  />
                </div>

                {/* Right main listings gallery */}
                <div className="lg:col-span-3 space-y-6">
                  
                  <div className="flex justify-between items-center text-xs text-stone-500 border-b pb-3 border-stone-200">
                    <span>Trovati <strong>{filteredProperties.length}</strong> immobili corrispondenti</span>
                    {isFilteringActive && (
                      <button onClick={handleResetFilters} className="font-semibold text-amber-800 hover:underline cursor-pointer">
                        Azzera filtri
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex flex-col justify-center items-center py-20 gap-3">
                      <Loader2 className="w-8 h-8 text-amber-800 animate-spin" />
                      <span className="text-xs text-stone-400 font-medium">Caricamento catalogo...</span>
                    </div>
                  ) : filteredProperties.length === 0 ? (
                    <div className="text-center py-24 bg-white border rounded-2xl p-6">
                      <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <h4 className="font-serif text-base font-semibold text-stone-700">Nessun immobile trovato</h4>
                      <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">Nessun annuncio soddisfa i criteri di ricerca. Prova a rimuovere qualche filtro o allargare il budget di prezzo.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 bg-stone-900 hover:bg-stone-850 text-white font-medium text-xs px-4 py-2.5 rounded-lg cursor-pointer"
                      >
                        Ripristina Filtri
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredProperties.map((prop) => (
                        <PropertyCard 
                          key={prop.id} 
                          property={prop} 
                        />
                      ))}
                    </div>
                  )}

                </div>

              </div>
            </motion.div>
            }/>

            {/* VIEW C: ABOUT US SECTION */}
            <Route path="/about" element={
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <AboutUs />
              </motion.div>
            }/>

            {/* VIEW D: CONTACT US COMPONENT */}
            <Route path="/contact" element={
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <ContactForm />
              </motion.div>
            }/>

            {/* VIEW E: ADMIN BACKEND PORTAL */}
            <Route path="/admin" element={
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <AdminDashboard 
                  isAdmin={isAdmin} 
                  setIsAdmin={setIsAdmin} 
                />
              </motion.div>
            }/>

            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </AnimatePresence>
      </main>

      {/* Cookie Compliance */}
      <CookieBanner />

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-stone-800">
            
            {/* Logo box */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-[0.15em] font-light text-white">PASSIONE</span>
                <span className="font-sans text-[0.6rem] tracking-[0.25em] text-stone-400 font-medium uppercase">IMMOBILIARE</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Dal 2010, professionisti qualificati nell’intermediazione immobiliare turistica e residenziale di pregio ad Acqui Terme e nel Monferrato.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h5 className="text-white text-xs font-bold uppercase tracking-widest">Navigazione</h5>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/" className="hover:text-white transition-colors cursor-pointer">{t('home')}</Link></li>
                <li><Link to="/properties" className="hover:text-white transition-colors cursor-pointer">{t('properties')}</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors cursor-pointer">{t('about')}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors cursor-pointer">{t('contact')}</Link></li>
              </ul>
            </div>

            {/* Core types */}
            <div className="space-y-3">
              <h5 className="text-white text-xs font-bold uppercase tracking-widest">{t('categories')}</h5>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/properties" onClick={() => setFilters(prev => ({ ...prev, type: 'Masseria' }))} className="hover:text-white transition-colors cursor-pointer">{t('casali')}</Link></li>
                <li><Link to="/properties" onClick={() => setFilters(prev => ({ ...prev, type: 'Villa' }))} className="hover:text-white transition-colors cursor-pointer">{t('ville')}</Link></li>
                <li><Link to="/properties" onClick={() => setFilters(prev => ({ ...prev, type: 'Appartamento' }))} className="hover:text-white transition-colors cursor-pointer">{t('appHist')}</Link></li>
                <li><Link to="/properties" onClick={() => setFilters(prev => ({ ...prev, type: 'Rustico' }))} className="hover:text-white transition-colors cursor-pointer">{t('rustici')}</Link></li>
              </ul>
            </div>

            {/* Contact quick info */}
            <div className="space-y-3">
              <h5 className="text-white text-xs font-bold uppercase tracking-widest">Contatti Ufficio</h5>
              <div className="space-y-1.5 text-xs text-stone-400">
                <p className="leading-tight">Corso Italia, 12 - Acqui Terme (AL)</p>
                <p>
                  Tel: <a href="tel:+390144324578" className="hover:text-white transition-colors underline decoration-stone-600 underline-offset-2">+39 0144 324578</a>
                </p>
                <p>
                  Email: <a href="mailto:info@atlaslabs.it" className="hover:text-white transition-colors underline decoration-stone-600 underline-offset-2">info@atlaslabs.it</a>
                </p>
              </div>
            </div>

          </div>

          {/* Copyright, GDPR and Admin Bypass link */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-[11px] text-stone-500 gap-4">
            <p>© {new Date().getFullYear()} AtlasLabs.it. Tutti i diritti riservati. P.IVA 09876543211.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Cookie Policy</a>
              <Link 
                to="/admin"
                className="hover:text-amber-500 font-mono transition-colors text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 shrink-0" />
                Accesso Interno Amministratori
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
