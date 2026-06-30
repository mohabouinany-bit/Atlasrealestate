export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'Appartamento' | 'Villa' | 'Terreno' | 'Commerciale' | 'Rustico' | 'Masseria' | 'Attico/Mansarda' | 'Villetta a schiera' | 'Garage' | 'Capannone';
  status: 'Vendita' | 'Affitto';
  bedrooms: number;
  bathrooms: number;
  areaSqM: number;
  coverImage: string;
  images: string[];
  features: string[];
  featured: boolean;
  createdAt: number;
}

export interface InquiryMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
  createdAt: number;
  status: 'Nuovo' | 'Letto' | 'Contattato';
}
