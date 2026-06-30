import React from 'react';
import { BedDouble, Bath, Maximize2, MapPin, Tag } from 'lucide-react';
import { Property } from '../types';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const formatPrice = (price: number, status: string) => {
    if (status === 'Affitto') {
      return `${price.toLocaleString('it-IT')} € / sett.`;
    }
    return `${price.toLocaleString('it-IT')} €`;
  };

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 320, damping: 25 }}
      onClick={() => onSelect(property)}
      className="group bg-white rounded-xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-stone-300 flex flex-col h-full cursor-pointer"
      id={`property-card-${property.id}`}
    >
      {/* Image container */}
      <div className="relative overflow-hidden aspect-video bg-stone-100">
        <img
          src={property.coverImage}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Status badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className={`px-2.5 py-1 text-[10px] tracking-wider uppercase font-bold text-white rounded-md shadow-sm ${
            property.status === 'Vendita' ? 'bg-amber-800' : 'bg-stone-900'
          }`}>
            {property.status}
          </span>
          {property.featured && (
            <span className="px-2.5 py-1 text-[10px] tracking-wider uppercase font-bold text-amber-950 bg-amber-100 border border-amber-200 rounded-md shadow-sm">
              Esclusiva
            </span>
          )}
        </div>

        {/* Type indicator */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2 py-1 text-[10px] tracking-wider font-semibold text-stone-900 bg-white/90 backdrop-blur-xs rounded-sm border border-stone-200/50 flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-800" />
            {property.type}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Location */}
        <div className="flex items-center gap-1 text-stone-500 text-xs font-medium mb-2">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelect(property)}
          className="font-serif text-base text-stone-900 hover:text-amber-800 font-medium mb-3 line-clamp-1 cursor-pointer transition-colors leading-snug"
        >
          {property.title}
        </h3>

        {/* Short description block */}
        <p className="text-xs text-stone-500 line-clamp-2 mb-4 leading-relaxed flex-grow">
          {property.description}
        </p>

        {/* Specs footer */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-stone-100 border-b mb-4 text-stone-600">
          <div className="flex items-center gap-1.5 justify-center">
            <BedDouble className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="text-xs font-semibold">{property.bedrooms} <span className="text-[10px] text-stone-400 font-normal">Camere</span></span>
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <Bath className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="text-xs font-semibold">{property.bathrooms} <span className="text-[10px] text-stone-400 font-normal">Bagni</span></span>
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <Maximize2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-xs font-semibold">{property.areaSqM} <span className="text-[10px] text-stone-400 font-normal">Mq</span></span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex justify-between items-center mt-auto">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Valore</span>
            <span className="text-lg font-serif font-semibold text-stone-900">
              {formatPrice(property.price, property.status)}
            </span>
          </div>
          
          <button
            onClick={() => onSelect(property)}
            className="text-xs uppercase tracking-wider font-semibold text-stone-800 hover:text-white bg-transparent hover:bg-stone-900 border border-stone-300 hover:border-stone-900 px-3.5 py-2.5 rounded-lg transition-all duration-300 cursor-pointer"
          >
            Dettagli
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default PropertyCard;
