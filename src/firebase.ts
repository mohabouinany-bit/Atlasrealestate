import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { Property } from './types';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Seed data of premium properties in Piemonte/Monferrato
const SEED_PROPERTIES: Property[] = [
  {
    id: 'prop-casale-monferrato',
    title: 'Antico Casale Monferrino con Vigneto',
    description: 'A pochi minuti dal centro di Acqui Terme, immerso nel paesaggio collinare del Monferrato (patrimonio UNESCO), proponiamo in vendita un’incantevole tenuta piemontese in pietra di Langa, risalente alla fine dell’Ottocento, finemente ristrutturata nel rispetto dell’architettura originale. La proprietà è caratterizzata da ampi spazi esterni, soffitti con travi in legno a vista, camini in pietra ed una splendida cantina storica interrata per l’affinamento dei vini. Si compone di un corpo centrale con ampio salone, cucina abitabile, 4 ampie camere da letto ciascuna con bagno privato, e una dependance indipendente. All’esterno, una piscina panoramica circondata da un parco piantumato e un vigneto privato garantisce totale privacy e relax.',
    price: 680000,
    location: 'Acqui Terme, Alessandria',
    type: 'Masseria',
    status: 'Vendita',
    bedrooms: 5,
    bathrooms: 5,
    areaSqM: 320,
    coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Piscina privata', 'Vigneto di proprietà', 'Cantina storica in tufo', 'Camino in pietra', 'Pannelli solari', 'Riscaldamento a pavimento', 'Parco privato'],
    featured: true,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prop-attico-acqui',
    title: 'Attico in Centro Storico con Terrazzo',
    description: 'Esclusivo attico situato all’ultimo piano con ascensore in una delle piazze più prestigiose del centro di Acqui Terme. L’immobile gode di una spettacolare vista panoramica a 360 gradi sulle sorgenti termali, la città e le colline circostanti. L’attico è composto da un luminoso soggiorno open space con ampie vetrate scorrevoli che danno accesso al grande terrazzo perimetrale attrezzato con pergolato in legno e zona solarium, cucina a vista moderna, camera da letto matrimoniale, cameretta e bagno con finiture di pregio. Dotato di ogni comfort, compresa cantina e box auto privato. Soluzione ideale per chi cerca una residenza esclusiva o una casa vacanze di altissimo livello.',
    price: 310000,
    location: 'Acqui Terme, Alessandria',
    type: 'Appartamento',
    status: 'Vendita',
    bedrooms: 2,
    bathrooms: 1,
    areaSqM: 85,
    coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Terrazzo panoramico', 'Box auto', 'Ascensore', 'Finiture di pregio', 'Riscaldamento autonomo', 'Aria condizionata'],
    featured: true,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prop-rustico-ponzone',
    title: 'Rustico di Charme in Pietra con Giardino d’Inverno',
    description: 'Nel cuore dei colli dell’Acquese, immerso in un paesaggio idilliaco e incontaminato, splendido complesso rustico in pietra locale piemontese finemente restaurato da maestri artigiani. La dimora conserva intatta la magia originaria, coniugando il fascino rurale con i comfort moderni. Internamente si compone di un incantevole soggiorno con soffitti in mattoni e travi, cucina in muratura con antico forno a legna, due camere da letto con pareti in pietra a vista e un bagno spazioso. All’esterno sorge una suggestiva veranda in vetro e ferro battuto adibita a giardino d’inverno, una cucina estiva con barbecue e un patio panoramico ideale per cene con vista sui vigneti.',
    price: 245000,
    location: 'Ponzone, Alessandria',
    type: 'Rustico',
    status: 'Vendita',
    bedrooms: 2,
    bathrooms: 1,
    areaSqM: 110,
    coverImage: 'https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Struttura in pietra a vista', 'Giardino privato', 'Cucina esterna con forno', 'Pergolato', 'Riscaldamento a stufa', 'Posizione panoramica'],
    featured: false,
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prop-villa-strevi',
    title: 'Villa Contemporanea vista Colline del Monferrato',
    description: 'Spettacolare villa unifamiliare di nuova costruzione situata sulla collina panoramica di Strevi, in posizione dominante con splendida vista aperta sui vigneti e sul territorio UNESCO del Monferrato. La villa, caratterizzata da linee architettoniche pulite ed un design contemporaneo, si sviluppa su un unico livello. Comprende un salone triplo con pareti vetrate apribili che fondono l’interno con il patio coperto e la splendida piscina ad acqua salata, cucina professionale con isola, tre suite matrimoniali ognuna con bagno privato. Terrazzo calpestabile adibito a solarium panoramico con vista spettacolare sui colli piemontesi.',
    price: 490000,
    location: 'Strevi, Alessandria',
    type: 'Villa',
    status: 'Vendita',
    bedrooms: 3,
    bathrooms: 3,
    areaSqM: 180,
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Piscina ad acqua salata', 'Vista aperta sui vigneti', 'Classe energetica A4', 'Pannelli solari', 'Impianto domotica', 'Videosorveglianza', 'Finiture extralusso'],
    featured: true,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prop-acqui-centro',
    title: 'Appartamento Storico con Soffitti a Volta',
    description: 'Nel cuore del centro storico termale di Acqui Terme, a pochi passi dalla rinomata Piazza della Bollente, proponiamo in vendita questo elegante appartamento situato in un palazzo signorile del Settecento, finemente ristrutturato e arredato. L’immobile, ricco di fascino storico, vanta imponenti soffitti a volta affrescati sabbiati a vista ed elementi in cotto piemontese originale. Si sviluppa in un ampio ingresso-soggiorno con camino monumentale d’arredo, cucina abitabile su misura, camera da letto matrimoniale e doppi servizi rifiniti in marmo. Riscaldamento autonomo, predisposizione climatizzazione. Ottima opportunità come dimora privata di rappresentanza.',
    price: 165000,
    location: 'Acqui Terme, Alessandria',
    type: 'Appartamento',
    status: 'Vendita',
    bedrooms: 1,
    bathrooms: 2,
    areaSqM: 95,
    coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Soffitti affrescati', 'Centro storico', 'Camino monumentale', 'Doppi servizi', 'Riscaldamento autonomo'],
    featured: false,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000
  },
  {
    id: 'prop-villa-affitto-alice',
    title: 'Villa Storica in Affitto tra i Vigneti',
    description: 'Disponibile per locazione turistica settimanale, splendida villa d’epoca indipendente immersa nei rinomati vigneti di Alice Bel Colle, a pochi chilometri da Acqui Terme. La villa è circondata da un parco privato piantumato, attrezzato con barbecue, zona pranzo all’aperto ed una piscina panoramica con vista a perdita d’occhio sulle colline piemontesi. Internamente offre un ampio salone con camino, cucina abitabile completa, una suite matrimoniale, due camere doppie e doppi servizi completi. Dotata di aria condizionata, Wi-Fi gratuito e parcheggio interno privato. Soluzione ideale per vivere l’esperienza del Monferrato.',
    price: 900, // weekly rent
    location: 'Alice Bel Colle, Alessandria',
    type: 'Villa',
    status: 'Affitto',
    bedrooms: 3,
    bathrooms: 2,
    areaSqM: 175,
    coverImage: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Vista panoramica colline', 'Parco privato', 'Piscina panoramica', 'Aria condizionata', 'Wi-Fi gratuito', 'Camino', 'Posto auto'],
    featured: false,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000
  }
];

// Helper to seed database if empty
export async function seedDatabaseIfEmpty() {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    console.log('Offline or unauthenticated visitor: skipping Firestore auto-seeding. Local fallback is ready.');
    return;
  }
  const emailLower = currentUser.email.toLowerCase();
  const isAdminEmail = ['mohabouinany@gmail.com', 'admin@atlaslabs.it', 'admin@passioneimmobiliare.it'].includes(emailLower);
  if (!isAdminEmail) {
    console.log('Authenticated visitor is not an admin: skipping Firestore auto-seeding.');
    return;
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'properties'));
    if (querySnapshot.empty) {
      console.log('No properties found. Seeding default properties...');
      for (const prop of SEED_PROPERTIES) {
        await setDoc(doc(db, 'properties', prop.id), prop);
      }
      console.log('Database seeded successfully!');
    }
  } catch (error) {
    console.log('Firestore is initializing or currently in offline mode. Local storage cache will be utilized as a seamless fallback.');
  }
}
