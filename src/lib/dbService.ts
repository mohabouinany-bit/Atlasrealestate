import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  getDocFromServer
} from 'firebase/firestore';
import { db, seedDatabaseIfEmpty, auth } from '../firebase';
import { Property, InquiryMessage } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  const isPermissionError = errMessage.toLowerCase().includes('permission') || 
                            errMessage.toLowerCase().includes('denied') ||
                            errMessage.toLowerCase().includes('insufficient');

  if (isPermissionError) {
    const serialized = JSON.stringify(errInfo);
    console.error('Firestore Hardened Error Context:', serialized);
    throw new Error(serialized);
  }
  throw error;
}

// Validate connection on startup as mandated by connection validation constraints
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client appears to be offline.");
    }
  }
}
testConnection();

// Helper to determine if the currently authenticated user in Firebase is an admin
export function isCurrentUserFirebaseAdmin(): boolean {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    return false;
  }
  const emailLower = currentUser.email.toLowerCase();
  return ['mohabouinany@gmail.com', 'admin@atlaslabs.it', 'admin@passioneimmobiliare.it'].includes(emailLower);
}

// Fallback storage key if firebase throws permissions or network errors
const LOCAL_PROPERTIES_KEY = 'passione_properties_backup';
const LOCAL_MESSAGES_KEY = 'passione_messages_backup';

// Initial backup seed data to ensure immediate UI presentation
const BACKUP_PROPERTIES: Property[] = [
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
  }
];

const BACKUP_MESSAGES: InquiryMessage[] = [
  {
    id: 'msg-1',
    name: 'Giovanni Rossi',
    email: 'giovanni.rossi@example.com',
    phone: '+39 345 6789012',
    message: 'Salve, sarei interessato a visitare l’Antico Casale Monferrino ad Acqui Terme. Quali sono le disponibilità per la prossima settimana?',
    propertyId: 'prop-casale-monferrato',
    propertyTitle: 'Antico Casale Monferrino con Vigneto',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    status: 'Nuovo'
  },
  {
    id: 'msg-2',
    name: 'Elena Schmidt',
    email: 'elena.schmidt@example.de',
    phone: '+49 172 1234567',
    message: 'Hello, I am interested in "Villa Contemporanea" in Strevi. Can you send me some floor plans and more details about the energy system? Thank you.',
    propertyId: 'prop-villa-strevi',
    propertyTitle: 'Villa Contemporanea vista Colline del Monferrato',
    createdAt: Date.now() - 12 * 60 * 60 * 1000,
    status: 'Nuovo'
  }
];

// Initialize localStorage if empty
if (!localStorage.getItem(LOCAL_PROPERTIES_KEY)) {
  localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(BACKUP_PROPERTIES));
}
if (!localStorage.getItem(LOCAL_MESSAGES_KEY)) {
  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(BACKUP_MESSAGES));
}

// Check Firestore health & Seed
export async function initDb() {
  try {
    await seedDatabaseIfEmpty();
  } catch (error) {
    console.warn("Could not seed firestore automatically. Running local fallback capability if needed.", error);
  }
}

// ---------------- PROPERTIES SERVICE ----------------
export async function getProperties(): Promise<Property[]> {
  let props: Property[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, 'properties'));
    if (!querySnapshot.empty) {
      querySnapshot.forEach((docSnap) => {
        props.push({ id: docSnap.id, ...docSnap.data() } as Property);
      });
    }
  } catch (err) {
    console.warn("Firestore error, reading local backup storage:", err);
    try {
      handleFirestoreError(err, OperationType.LIST, 'properties');
    } catch (e) {
      console.error("Gracefully caught Firestore error for properties:", e);
    }
  }
  
  // Merge with any locally added properties to prevent overwriting local-only listings
  const local = localStorage.getItem(LOCAL_PROPERTIES_KEY);
  if (local) {
    try {
      const localProps: Property[] = JSON.parse(local);
      const dbIds = new Set(props.map(p => p.id));
      localProps.forEach(lp => {
        if (!dbIds.has(lp.id)) {
          props.push(lp);
        }
      });
    } catch (e) {
      console.error("Error parsing/merging local properties:", e);
    }
  } else if (props.length === 0) {
    props = [...BACKUP_PROPERTIES];
  }

  // Deduplicate and save back
  const uniqueProps: Property[] = [];
  const seenIds = new Set<string>();
  props.forEach(p => {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      uniqueProps.push(p);
    }
  });

  localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(uniqueProps));
  return uniqueProps;
}

export async function addProperty(property: Omit<Property, 'id'>): Promise<Property> {
  const newId = 'prop-' + Math.random().toString(36).substr(2, 9);
  const fullProp: Property = { ...property, id: newId };
  
  // If the active user is not signed in to Firebase as an admin, save locally only
  if (!isCurrentUserFirebaseAdmin()) {
    console.warn("Visitor is not signed in to Firebase as an admin. Saving property locally only.");
    const local = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    const list: Property[] = local ? JSON.parse(local) : [];
    if (!list.some(p => p.id === fullProp.id)) {
      list.push(fullProp);
    }
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(list));
    return fullProp;
  }
  
  try {
    await setDoc(doc(db, 'properties', newId), property);
    // update local storage
    const local = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    const list: Property[] = local ? JSON.parse(local) : [];
    if (!list.some(p => p.id === fullProp.id)) {
      list.push(fullProp);
    }
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(list));
    return fullProp;
  } catch (err) {
    console.warn("Firestore write failed, writing locally only:", err);
    try {
      handleFirestoreError(err, OperationType.CREATE, `properties/${newId}`);
    } catch (e) {
      console.error("Gracefully handled properties creation write failure:", e);
    }
    
    const local = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    const list: Property[] = local ? JSON.parse(local) : [];
    if (!list.some(p => p.id === fullProp.id)) {
      list.push(fullProp);
    }
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(list));
    return fullProp;
  }
}

export async function updateProperty(id: string, property: Partial<Property>): Promise<void> {
  if (!isCurrentUserFirebaseAdmin()) {
    console.warn("Visitor is not signed in to Firebase as an admin. Updating property locally only.");
    const local = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    if (local) {
      const list: Property[] = JSON.parse(local);
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...property };
        localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(list));
      }
    }
    return;
  }

  try {
    const docRef = doc(db, 'properties', id);
    await updateDoc(docRef, property as any);
  } catch (err) {
    console.warn("Firestore update failed, updating locally only:", err);
    try {
      handleFirestoreError(err, OperationType.UPDATE, `properties/${id}`);
    } catch (e) {
      console.error("Gracefully handled properties update write failure:", e);
    }
  }
  
  // Always update locally
  const local = localStorage.getItem(LOCAL_PROPERTIES_KEY);
  if (local) {
    const list: Property[] = JSON.parse(local);
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...property };
      localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(list));
    }
  }
}

export async function deleteProperty(id: string): Promise<void> {
  if (!isCurrentUserFirebaseAdmin()) {
    console.warn("Visitor is not signed in to Firebase as an admin. Deleting property locally only.");
    const local = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    if (local) {
      const list: Property[] = JSON.parse(local);
      const filtered = list.filter(p => p.id !== id);
      localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(filtered));
    }
    return;
  }

  try {
    const docRef = doc(db, 'properties', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete failed, deleting locally only:", err);
    try {
      handleFirestoreError(err, OperationType.DELETE, `properties/${id}`);
    } catch (e) {
      console.error("Gracefully handled properties delete failure:", e);
    }
  }

  // Always delete locally
  const local = localStorage.getItem(LOCAL_PROPERTIES_KEY);
  if (local) {
    const list: Property[] = JSON.parse(local);
    const filtered = list.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(filtered));
  }
}

// ---------------- MESSAGES SERVICE ----------------
export async function getMessages(): Promise<InquiryMessage[]> {
  if (!isCurrentUserFirebaseAdmin()) {
    console.warn("Visitor is not signed in to Firebase as an admin. Reading local backup storage.");
    const local = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (local) {
      const list: InquiryMessage[] = JSON.parse(local);
      list.sort((a, b) => b.createdAt - a.createdAt);
      return list;
    }
    return BACKUP_MESSAGES;
  }

  let msgs: InquiryMessage[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, 'messages'));
    if (!querySnapshot.empty) {
      querySnapshot.forEach((docSnap) => {
        msgs.push({ id: docSnap.id, ...docSnap.data() } as InquiryMessage);
      });
    }
  } catch (err) {
    console.warn("Firestore messages query failed, reading local backup:", err);
    try {
      handleFirestoreError(err, OperationType.LIST, 'messages');
    } catch (e) {
      console.error("Gracefully caught Firestore error for messages:", e);
    }
  }

  // Merge with any locally added messages to prevent overwriting
  const local = localStorage.getItem(LOCAL_MESSAGES_KEY);
  if (local) {
    try {
      const localMsgs: InquiryMessage[] = JSON.parse(local);
      const dbIds = new Set(msgs.map(m => m.id));
      localMsgs.forEach(lm => {
        if (!dbIds.has(lm.id)) {
          msgs.push(lm);
        }
      });
    } catch (e) {
      console.error("Error parsing/merging local messages:", e);
    }
  } else if (msgs.length === 0) {
    msgs = [...BACKUP_MESSAGES];
  }

  // Deduplicate, sort descending by date, and save back
  const uniqueMsgs: InquiryMessage[] = [];
  const seenIds = new Set<string>();
  msgs.forEach(m => {
    if (!seenIds.has(m.id)) {
      seenIds.add(m.id);
      uniqueMsgs.push(m);
    }
  });

  uniqueMsgs.sort((a, b) => b.createdAt - a.createdAt);
  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(uniqueMsgs));
  return uniqueMsgs;
}

export async function addMessage(message: Omit<InquiryMessage, 'id'>): Promise<InquiryMessage> {
  const newId = 'msg-' + Math.random().toString(36).substr(2, 9);
  const fullMsg: InquiryMessage = { ...message, id: newId };

  try {
    await setDoc(doc(db, 'messages', newId), message);
    const local = localStorage.getItem(LOCAL_MESSAGES_KEY);
    const list: InquiryMessage[] = local ? JSON.parse(local) : [];
    if (!list.some(m => m.id === fullMsg.id)) {
      list.unshift(fullMsg);
    }
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(list));
    return fullMsg;
  } catch (err) {
    console.warn("Firestore message save failed, writing locally only:", err);
    try {
      handleFirestoreError(err, OperationType.CREATE, `messages/${newId}`);
    } catch (e) {
      console.error("Gracefully handled message creation failure:", e);
    }
    
    const local = localStorage.getItem(LOCAL_MESSAGES_KEY);
    const list: InquiryMessage[] = local ? JSON.parse(local) : [];
    if (!list.some(m => m.id === fullMsg.id)) {
      list.unshift(fullMsg);
    }
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(list));
    return fullMsg;
  }
}

export async function updateMessageStatus(id: string, status: InquiryMessage['status']): Promise<void> {
  if (!isCurrentUserFirebaseAdmin()) {
    console.warn("Visitor is not signed in to Firebase as an admin. Updating message status locally only.");
    const local = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (local) {
      const list: InquiryMessage[] = JSON.parse(local);
      const idx = list.findIndex(m => m.id === id);
      if (idx !== -1) {
        list[idx].status = status;
        localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(list));
      }
    }
    return;
  }

  try {
    const docRef = doc(db, 'messages', id);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.warn("Firestore message update failed, updating locally only:", err);
    try {
      handleFirestoreError(err, OperationType.UPDATE, `messages/${id}`);
    } catch (e) {
      console.error("Gracefully handled message update failure:", e);
    }
  }

  // Local sync
  const local = localStorage.getItem(LOCAL_MESSAGES_KEY);
  if (local) {
    const list: InquiryMessage[] = JSON.parse(local);
    const idx = list.findIndex(m => m.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(list));
    }
  }
}

export async function deleteMessage(id: string): Promise<void> {
  if (!isCurrentUserFirebaseAdmin()) {
    console.warn("Visitor is not signed in to Firebase as an admin. Deleting message locally only.");
    const local = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (local) {
      const list: InquiryMessage[] = JSON.parse(local);
      const filtered = list.filter(m => m.id !== id);
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(filtered));
    }
    return;
  }

  try {
    const docRef = doc(db, 'messages', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore message delete failed, deleting locally only:", err);
    try {
      handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
    } catch (e) {
      console.error("Gracefully handled message delete failure:", e);
    }
  }

  // Local sync
  const local = localStorage.getItem(LOCAL_MESSAGES_KEY);
  if (local) {
    const list: InquiryMessage[] = JSON.parse(local);
    const filtered = list.filter(m => m.id !== id);
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(filtered));
  }
}
