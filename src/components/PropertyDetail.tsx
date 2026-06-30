import React, { useState } from 'react';
import { X, BedDouble, Bath, Maximize2, MapPin, Euro, ChevronLeft, ChevronRight, Phone, Mail, Check, MessageSquareCode } from 'lucide-react';
import { Property, InquiryMessage } from '../types';
import { addMessage } from '../lib/dbService';
import { motion } from 'motion/react';

interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
}

export default function PropertyDetail({ property, onClose }: PropertyDetailProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Salve, desidero maggiori informazioni in merito all'immobile "${property.title}" (Rif. ${property.id}). Grazie.`
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imagesList = property.images && property.images.length > 0 ? property.images : [property.coverImage];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Si prega di compilare tutti i campi obbligatori (Nome, Email, Messaggio)');
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
        propertyId: property.id,
        propertyTitle: property.title,
        createdAt: Date.now(),
        status: 'Nuovo'
      };

      await addMessage(messageData);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError('Si è verificato un errore durante l’invio del messaggio. Riprova più tardi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/75 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 25, scale: 0.98 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col"
        id="property-detail-modal"
      >
        
        {/* Header bar of modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-md ${
              property.status === 'Vendita' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-800'
            }`}>
              {property.status}
            </span>
            <span className="text-xs font-mono text-stone-400">Rif. {property.id}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content scrolling section */}
        <div className="overflow-y-auto p-6 flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Gallery, Title, Specs, Description, Features */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Image Carousel */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm group">
                <img
                  src={imagesList[activeImageIndex]}
                  alt={`${property.title} - ${activeImageIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Dots indicator */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                      {imagesList.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === activeImageIndex ? 'bg-amber-800 w-4' : 'bg-white/60 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Title & Price Header */}
              <div className="border-b border-stone-100 pb-5">
                <div className="flex items-center gap-1 text-stone-500 text-xs font-medium mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{property.location}</span>
                </div>
                
                <h2 className="font-serif text-2xl text-stone-900 font-medium leading-snug mb-2">
                  {property.title}
                </h2>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-serif font-bold text-amber-900">
                    {property.price.toLocaleString('it-IT')} €
                  </span>
                  {property.status === 'Affitto' && (
                    <span className="text-xs text-stone-400 font-sans">al mese / a settimana</span>
                  )}
                </div>
              </div>

              {/* Primary Grid Specifications */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-150 text-stone-700">
                <div className="flex flex-col items-center justify-center py-2 border-r border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Locali / Camere</span>
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4.5 h-4.5 text-amber-800" />
                    <span className="font-serif text-base font-semibold">{property.bedrooms}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-2 border-r border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Bagni</span>
                  <div className="flex items-center gap-2">
                    <Bath className="w-4.5 h-4.5 text-amber-800" />
                    <span className="font-serif text-base font-semibold">{property.bathrooms}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Superficie</span>
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-amber-800" />
                    <span className="font-serif text-base font-semibold">{property.areaSqM} <span className="text-xs font-sans font-medium">mq</span></span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-serif text-base font-medium text-stone-900 mb-2.5">Descrizione</h4>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Amenities / Features List */}
              {property.features && property.features.length > 0 && (
                <div>
                  <h4 className="font-serif text-base font-medium text-stone-900 mb-3">Caratteristiche e Servizi</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {property.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 py-1 px-3 bg-stone-50 border border-stone-100 rounded-lg text-xs text-stone-700">
                        <Check className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Contact Agent Widget */}
            <div className="lg:col-span-5 lg:sticky lg:top-0 space-y-6">
              
              {/* Agency Card info */}
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 shadow-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center text-white font-serif text-lg font-light">
                    AR
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-semibold text-stone-900">Atlas Real Estate</h5>
                    <p className="text-xs text-stone-500">Corso Italia, Acqui Terme (AL)</p>
                  </div>
                </div>
                
                <div className="space-y-2.5 text-xs text-stone-600 mb-5 border-t border-stone-200/60 pt-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-stone-400" />
                    <a href="tel:+390144324578" className="hover:text-amber-800 hover:underline transition-colors">
                      +39 0144 324578
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <a href="mailto:info@atlaslabs.it" className="hover:text-amber-800 hover:underline transition-colors break-all">
                      info@atlaslabs.it
                    </a>
                  </div>
                </div>

                {/* Form starts */}
                {submitted ? (
                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-6 text-center space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center text-white mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h5 className="font-serif text-base font-semibold text-stone-900">Messaggio Inviato!</h5>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      La tua richiesta è stata trasmessa ai nostri operatori. Verrai ricontattato al più presto all'indirizzo email o telefono fornito.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-xs text-amber-800 font-semibold hover:underline mt-2 cursor-pointer"
                    >
                      Invia un altro messaggio
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h5 className="font-serif text-sm font-semibold text-stone-800 mb-2">Richiedi Informazioni</h5>
                    
                    {error && (
                      <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Es. Mario Rossi"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Email *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="mario@email.com"
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Telefono</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="+39 345..."
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Messaggio *</label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleFormChange}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-amber-800 hover:bg-amber-900 text-white font-medium text-xs tracking-wider uppercase rounded-lg py-3 shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Invio in corso...' : 'Invia Richiesta'}
                    </button>

                    <p className="text-[10px] text-stone-400 leading-tight text-center">
                      Inviando questo modulo acconsenti al trattamento dei dati personali secondo le normative sulla privacy (GDPR).
                    </p>
                  </form>
                )}

              </div>

            </div>

          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
