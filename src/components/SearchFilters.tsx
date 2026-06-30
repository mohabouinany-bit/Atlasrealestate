import React from 'react';
import { Search, MapPin, Euro, ArrowRight, Home, Settings2, SlidersHorizontal } from 'lucide-react';

interface FiltersState {
  search: string;
  status: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
}

interface SearchFiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  onReset: () => void;
  compact?: boolean;
}

export default function SearchFilters({ filters, setFilters, onReset, compact = false }: SearchFiltersProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const propertyTypes = ['Appartamento', 'Attico/Mansarda', 'Villa', 'Villetta a schiera', 'Rustico', 'Masseria', 'Terreno', 'Commerciale', 'Capannone', 'Garage'];

  if (compact) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow-xl border border-stone-200/60 max-w-5xl mx-auto -mt-10 relative z-20" id="compact-search-panel">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* Status (Sale / Rent) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Contratto</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="w-full bg-stone-50 hover:bg-stone-100/80 border border-stone-200 text-stone-800 text-sm font-medium rounded-lg px-3.5 py-2.5 transition-colors focus:ring-2 focus:ring-amber-700/25 focus:border-amber-800 focus:outline-none"
            >
              <option value="Tutti">Vendita e Affitto</option>
              <option value="Vendita">In Vendita</option>
              <option value="Affitto">In Affitto (Turistico)</option>
            </select>
          </div>

          {/* Location / Keyword */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Dove</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4.5 h-4.5 text-stone-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Acqui Terme, Strevi, Ponzone..."
                className="w-full bg-stone-50 hover:bg-stone-100/80 border border-stone-200 text-stone-800 text-sm font-medium rounded-lg pl-10 pr-4 py-2.5 transition-colors focus:ring-2 focus:ring-amber-700/25 focus:border-amber-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Type of Property */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Tipologia</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="w-full bg-stone-50 hover:bg-stone-100/80 border border-stone-200 text-stone-800 text-sm font-medium rounded-lg px-3.5 py-2.5 transition-colors focus:ring-2 focus:ring-amber-700/25 focus:border-amber-800 focus:outline-none"
            >
              <option value="Tutti">Tutte le Tipologie</option>
              {propertyTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Submit Trigger - Actually triggers live state update */}
          <div>
            <button
              onClick={onReset}
              type="button"
              className="w-full bg-stone-900 hover:bg-stone-850 text-white font-medium text-sm tracking-wide rounded-lg py-2.5 border border-transparent shadow-sm flex items-center justify-center gap-2 transition-colors duration-350 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-stone-300" />
              Resetta Filtri
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 shadow-sm" id="full-search-panel">
      <div className="flex justify-between items-center pb-4 mb-5 border-b border-stone-200">
        <h3 className="font-serif text-lg tracking-wide font-medium text-stone-800 flex items-center gap-2">
          <Search className="w-5 h-5 text-amber-800" />
          Affina la Ricerca
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-stone-500 hover:text-amber-800 font-medium transition-colors cursor-pointer"
        >
          Cancella tutto
        </button>
      </div>

      <div className="space-y-5">
        
        {/* Keyword Search */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Parola chiave / Località</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Es. Acqui, Piscina, Vigneto..."
              className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
            />
          </div>
        </div>

        {/* Contract Status */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Contratto</label>
          <div className="grid grid-cols-3 gap-2">
            {['Tutti', 'Vendita', 'Affitto'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, status: opt }))}
                className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  filters.status === opt
                    ? 'bg-stone-900 border-stone-950 text-white shadow-sm'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {opt === 'Tutti' ? 'Tutti' : opt === 'Vendita' ? 'Vendita' : 'Affitto'}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Tipologia Immobile</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
          >
            <option value="Tutti">Tutte le tipologie</option>
            {propertyTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Price Ranges */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Fascia di Prezzo (€)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
                placeholder="Min"
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
              />
            </div>
            <div>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="Max"
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Rooms / Bedrooms */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Camere da Letto</label>
          <div className="grid grid-cols-5 gap-1.5">
            {['Any', '1', '2', '3', '4+'].map((val) => {
              const displayVal = val;
              const actualFilterValue = val === 'Any' ? '' : val.replace('+', '');
              const isSelected = val === 'Any' ? filters.bedrooms === '' : filters.bedrooms === actualFilterValue || (val === '4+' && filters.bedrooms >= '4');
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, bedrooms: actualFilterValue }))}
                  className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                    isSelected
                      ? 'bg-amber-800 border-amber-900 text-white'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {displayVal}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Bagni</label>
          <div className="grid grid-cols-4 gap-1.5">
            {['Any', '1', '2', '3+'].map((val) => {
              const displayVal = val;
              const actualFilterValue = val === 'Any' ? '' : val.replace('+', '');
              const isSelected = val === 'Any' ? filters.bathrooms === '' : filters.bathrooms === actualFilterValue || (val === '3+' && filters.bathrooms >= '3');
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, bathrooms: actualFilterValue }))}
                  className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                    isSelected
                      ? 'bg-amber-800 border-amber-900 text-white'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {displayVal}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
