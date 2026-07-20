import type { SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

export type ServiceSlug =
  | 'office'
  | 'warehouse-industrial'
  | 'project-management'
  | 'residential'
  | 'valuation-advisory';

type ServiceLocale = 'sr' | 'en';

type LocalizedText = Record<ServiceLocale, string>;

export interface ServiceFeature {
  title: LocalizedText;
  description: LocalizedText;
}

export interface ServiceDefinition {
  slug: ServiceSlug;
  mainImage: string;
  galleryImages: string[];
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  features: ServiceFeature[];
}

export interface LocalizedService {
  slug: ServiceSlug;
  path: string;
  mainImage: string;
  galleryImages: string[];
  title: string;
  subtitle: string;
  description: string;
  features: Array<{ title: string; description: string }>;
}

const localeFor = (language: SupportedLanguage): ServiceLocale => (language === 'sr' ? 'sr' : 'en');

export const services: ServiceDefinition[] = [
  {
    slug: 'office',
    mainImage: publicImage('office-services.jpg'),
    galleryImages: [
      publicImage('office-services2.jpg'),
      publicImage('office-services3.jpg'),
      publicImage('office-services4.jpg'),
      publicImage('office-services5.jpg'),
    ],
    title: {
      sr: 'Kancelarijski prostori',
      en: 'Office Spaces',
    },
    subtitle: {
      sr: 'Profesionalna podrška u izboru, prezentaciji i upravljanju kancelarijskim prostorima.',
      en: 'Professional support in selecting, presenting and managing office spaces.',
    },
    description: {
      sr: 'Povezujemo potrebe savremenog poslovanja sa kancelarijskim prostorima koji nude funkcionalnost, prepoznatljivu lokaciju i pouzdane uslove korišćenja.',
      en: 'We connect modern business requirements with office spaces that offer functionality, a recognizable location and dependable terms of use.',
    },
    features: [
      {
        title: { sr: 'Izdavanje kancelarijskog prostora', en: 'Office space leasing' },
        description: {
          sr: 'Podrška klijentima u pronalaženju odgovarajućeg kancelarijskog prostora, uz jasno predstavljanje lokacije, površine i uslova korišćenja.',
          en: 'Support in finding suitable office space, with a clear presentation of its location, area and terms of use.',
        },
      },
      {
        title: { sr: 'Predstavljanje prostora zakupcima', en: 'Presentation to prospective tenants' },
        description: {
          sr: 'Priprema i prezentacija poslovnih prostora potencijalnim zakupcima kroz pregledne informacije, fotografije i relevantnu dokumentaciju.',
          en: 'Preparation and presentation of business spaces through clear information, photography and relevant documentation.',
        },
      },
      {
        title: { sr: 'Optimizacija poslovnog prostora', en: 'Workspace optimization' },
        description: {
          sr: 'Sagledavanje potreba korisnika i mogućnosti prostora radi efikasnijeg korišćenja dostupnih površina.',
          en: 'Assessment of user requirements and spatial possibilities to enable more efficient use of available areas.',
        },
      },
      {
        title: { sr: 'Podrška tokom procesa zakupa', en: 'Support throughout the leasing process' },
        description: {
          sr: 'Koordinacija komunikacije, prikupljanje podataka i podrška tokom dogovora o narednim koracima.',
          en: 'Coordination of communication, information gathering and support while the parties agree on the next steps.',
        },
      },
    ],
  },
  {
    slug: 'warehouse-industrial',
    mainImage: publicImage('warehouse-services.jpg'),
    galleryImages: [
      publicImage('warehouse-services2.jpg'),
      publicImage('warehouse-services3.jpg'),
      publicImage('warehouse-services4.jpg'),
      publicImage('warehouse-services5.jpg'),
    ],
    title: {
      sr: 'Magacinski i industrijski prostori',
      en: 'Warehouse & Industrial Spaces',
    },
    subtitle: {
      sr: 'Rešenja za korisnike kojima su potrebni funkcionalni prostori za logistiku, skladištenje i industrijske aktivnosti.',
      en: 'Solutions for clients who need functional premises for logistics, storage and industrial operations.',
    },
    description: {
      sr: 'Predstavljamo kapacitete prilagođene operativnim zahtevima, od efikasnog skladištenja do složenijih logističkih i proizvodnih procesa.',
      en: 'We present facilities suited to operational requirements, from efficient storage to more complex logistics and production processes.',
    },
    features: [
      {
        title: { sr: 'Prezentacija magacinskih kapaciteta', en: 'Warehouse capacity presentation' },
        description: {
          sr: 'Pregled površina, pristupa, organizacije prostora i ključnih informacija potrebnih za procenu svakodnevnog korišćenja.',
          en: 'An overview of areas, access, spatial organization and the key information needed to assess everyday use.',
        },
      },
      {
        title: { sr: 'Industrijski i logistički prostori', en: 'Industrial and logistics premises' },
        description: {
          sr: 'Podrška pri izboru prostora koji odgovara skladišnim, distributivnim, servisnim ili proizvodnim aktivnostima.',
          en: 'Support in selecting premises suited to storage, distribution, service or production activities.',
        },
      },
      {
        title: { sr: 'Analiza dostupnih površina', en: 'Available area analysis' },
        description: {
          sr: 'Jasan pregled ukupnih i raspoloživih kapaciteta radi realnog planiranja potrebnog obima poslovanja.',
          en: 'A clear review of total and available capacity for realistic planning of the required operating scale.',
        },
      },
      {
        title: { sr: 'Podrška pri izboru lokacije', en: 'Location selection support' },
        description: {
          sr: 'Sagledavanje pristupa, povezanosti i šireg poslovnog okruženja u odnosu na potrebe korisnika.',
          en: 'Assessment of access, connectivity and the wider business environment in relation to client requirements.',
        },
      },
    ],
  },
  {
    slug: 'project-management',
    mainImage: publicImage('project-management-services.png'),
    galleryImages: [
      publicImage('project-management-services2.png'),
      publicImage('project-management-services3.png'),
      publicImage('project-management-services4.png'),
      publicImage('project-management-services5.png'),
    ],
    title: {
      sr: 'Upravljanje projektima',
      en: 'Project Management',
    },
    subtitle: {
      sr: 'Koordinacija projektnih aktivnosti u oblasti nekretnina, od planiranja do realizacije.',
      en: 'Coordination of real estate project activities, from planning through delivery.',
    },
    description: {
      sr: 'Strukturisan pristup povezuje ciljeve projekta, učesnike, rokove i dokumentaciju u pregledan proces sa jasno definisanim narednim koracima.',
      en: 'A structured approach brings project goals, participants, timelines and documentation into one transparent process with clearly defined next steps.',
    },
    features: [
      {
        title: { sr: 'Planiranje projektnih aktivnosti', en: 'Project activity planning' },
        description: {
          sr: 'Definisanje prioriteta, faza i operativnih koraka u skladu sa ciljevima razvoja ili unapređenja nekretnine.',
          en: 'Definition of priorities, phases and operational steps in line with the goals of developing or improving a property.',
        },
      },
      {
        title: { sr: 'Koordinacija učesnika', en: 'Stakeholder coordination' },
        description: {
          sr: 'Usklađivanje komunikacije između vlasnika, korisnika, partnera i stručnih timova uključenih u projekat.',
          en: 'Alignment of communication between owners, users, partners and professional teams involved in the project.',
        },
      },
      {
        title: { sr: 'Praćenje rokova i dokumentacije', en: 'Timeline and documentation tracking' },
        description: {
          sr: 'Sistematičan pregled dogovorenih obaveza, rokova i relevantnih dokumenata tokom realizacije.',
          en: 'Systematic review of agreed responsibilities, timelines and relevant documents throughout delivery.',
        },
      },
      {
        title: { sr: 'Operativna podrška realizaciji', en: 'Operational delivery support' },
        description: {
          sr: 'Pravovremena podrška u rešavanju otvorenih pitanja i održavanju kontinuiteta projektnih aktivnosti.',
          en: 'Timely support in resolving open matters and maintaining continuity across project activities.',
        },
      },
    ],
  },
  {
    slug: 'residential',
    mainImage: publicImage('residential-services.jpg'),
    galleryImages: [
      publicImage('residential-services2.jpg'),
      publicImage('residential-services3.jpg'),
      publicImage('residential-services4.jpg'),
      publicImage('residential-services5.png'),
    ],
    title: {
      sr: 'Stambene nekretnine',
      en: 'Residential Properties',
    },
    subtitle: {
      sr: 'Profesionalan pristup prezentaciji i razvoju stambenih nekretnina u okviru portfolija.',
      en: 'A professional approach to the presentation and development of residential properties within the portfolio.',
    },
    description: {
      sr: 'Stambene nekretnine predstavljamo kroz pouzdane podatke, kvalitetan vizuelni materijal i jasan pregled karakteristika važnih za buduće korisnike.',
      en: 'We present residential properties through dependable information, quality visuals and a clear overview of the characteristics that matter to future users.',
    },
    features: [
      {
        title: { sr: 'Prezentacija stambenih jedinica', en: 'Residential unit presentation' },
        description: {
          sr: 'Pregledno predstavljanje raspoloživih jedinica, površina, fotografija i pratećih informacija.',
          en: 'Clear presentation of available units, areas, photography and supporting information.',
        },
      },
      {
        title: { sr: 'Pregled lokacije i karakteristika', en: 'Location and property overview' },
        description: {
          sr: 'Isticanje lokacijskih prednosti, funkcionalnih detalja i elemenata koji utiču na kvalitet svakodnevnog korišćenja.',
          en: 'Highlighting location advantages, functional details and the elements that shape everyday quality of use.',
        },
      },
      {
        title: { sr: 'Komunikacija sa zainteresovanim korisnicima', en: 'Communication with prospective users' },
        description: {
          sr: 'Pravovremeni odgovori, organizovanje informacija i podrška zainteresovanim klijentima tokom razmatranja nekretnine.',
          en: 'Timely responses, organized information and support for prospective clients while they consider a property.',
        },
      },
      {
        title: { sr: 'Podrška tokom procesa razmatranja', en: 'Support during the consideration process' },
        description: {
          sr: 'Pomoć pri razumevanju dostupnih podataka i koordinacija narednih koraka u procesu odlučivanja.',
          en: 'Help with understanding available information and coordinating the next steps in the decision process.',
        },
      },
    ],
  },
  {
    slug: 'valuation-advisory',
    mainImage: publicImage('valuation-advirsory-services.png'),
    galleryImages: [
      publicImage('valuation-advirsory-services2.png'),
      publicImage('valuation-advirsory-services3.png'),
      publicImage('valuation-advirsory-services4.png'),
      publicImage('valuation-advirsory-services5.png'),
    ],
    title: {
      sr: 'Procene i savetovanje',
      en: 'Valuation & Advisory',
    },
    subtitle: {
      sr: 'Analitička i savetodavna podrška u vezi sa nekretninama, lokacijama i potencijalom prostora.',
      en: 'Analytical and advisory support regarding properties, locations and spatial potential.',
    },
    description: {
      sr: 'Objedinjujemo relevantne podatke i praktično iskustvo kako bismo omogućili jasnije sagledavanje vrednosti, mogućnosti i narednih koraka.',
      en: 'We combine relevant information and practical experience to provide a clearer view of value, opportunities and the next steps.',
    },
    features: [
      {
        title: { sr: 'Procena potencijala nekretnine', en: 'Property potential assessment' },
        description: {
          sr: 'Sagledavanje postojećeg stanja, namene, raspoloživih kapaciteta i mogućnosti budućeg korišćenja.',
          en: 'Review of the current condition, purpose, available capacity and possibilities for future use.',
        },
      },
      {
        title: { sr: 'Analiza lokacije', en: 'Location analysis' },
        description: {
          sr: 'Pregled pozicije, pristupačnosti, okruženja i drugih lokacijskih faktora relevantnih za nekretninu.',
          en: 'Review of position, accessibility, surroundings and other location factors relevant to the property.',
        },
      },
      {
        title: { sr: 'Savetodavna podrška', en: 'Advisory support' },
        description: {
          sr: 'Stručno sagledavanje dostupnih opcija radi donošenja utemeljenih odluka o upravljanju, zakupu, prodaji ili razvoju.',
          en: 'Professional review of available options to support informed decisions on management, leasing, sale or development.',
        },
      },
      {
        title: { sr: 'Priprema pregleda i preporuka', en: 'Reviews and recommendations' },
        description: {
          sr: 'Organizovanje ključnih nalaza u jasan pregled sa praktičnim preporukama za dalje postupanje.',
          en: 'Organization of key findings into a clear overview with practical recommendations for further action.',
        },
      },
    ],
  },
];

export const getLocalizedService = (service: ServiceDefinition, language: SupportedLanguage): LocalizedService => {
  const locale = localeFor(language);

  return {
    slug: service.slug,
    path: `/services/${service.slug}`,
    mainImage: service.mainImage,
    galleryImages: service.galleryImages,
    title: service.title[locale],
    subtitle: service.subtitle[locale],
    description: service.description[locale],
    features: service.features.map((feature) => ({
      title: feature.title[locale],
      description: feature.description[locale],
    })),
  };
};

export const getLocalizedServices = (language: SupportedLanguage) => (
  services.map((service) => getLocalizedService(service, language))
);

export const getServiceBySlug = (slug: string) => services.find((service) => service.slug === slug);

const servicesPageCopy = {
  sr: {
    eyebrow: 'Ekspertiza Zepter Real Estate',
    title: 'Usluge za vredne nekretnine',
    heroText: 'Povezujemo kvalitetne prostore, pouzdane informacije i profesionalnu podršku u svakoj fazi rada sa nekretninama.',
    introEyebrow: 'Naše usluge',
    introTitle: 'Jasan pristup svakom prostoru i poslovnom cilju.',
    introText: 'Od predstavljanja kancelarijskih i industrijskih kapaciteta do upravljanja projektima i savetovanja, naš tim pruža strukturisanu podršku prilagođenu konkretnim potrebama klijenata.',
    readMore: 'Saznajte više',
    detailEyebrow: 'Zepter Real Estate usluga',
    activitiesEyebrow: 'Kako podržavamo klijente',
    activitiesTitle: 'Stručna podrška, jasno definisan proces.',
    galleryEyebrow: 'Prostori i perspektive',
    galleryTitle: 'U fokusu',
    moreServices: 'Ostale usluge',
    ctaTitle: 'Želite više informacija o ovoj usluzi?',
    ctaText: 'Naš tim je dostupan za dodatna pitanja i razgovor o potrebama vaše nekretnine ili portfolija.',
    contact: 'Kontaktirajte nas',
    notFoundTitle: 'Usluga nije pronađena',
    notFoundText: 'Tražena usluga trenutno nije dostupna. Pogledajte kompletan pregled naših usluga.',
    backToServices: 'Sve usluge',
  },
  en: {
    eyebrow: 'Zepter Real Estate expertise',
    title: 'Services for valuable real estate',
    heroText: 'We connect quality spaces, dependable information and professional support at every stage of working with real estate.',
    introEyebrow: 'Our services',
    introTitle: 'A clear approach to every space and business objective.',
    introText: 'From presenting office and industrial capacity to project management and advisory, our team provides structured support tailored to each client’s specific requirements.',
    readMore: 'Read more',
    detailEyebrow: 'Zepter Real Estate service',
    activitiesEyebrow: 'How we support clients',
    activitiesTitle: 'Professional support, a clearly defined process.',
    galleryEyebrow: 'Spaces and perspectives',
    galleryTitle: 'In focus',
    moreServices: 'More services',
    ctaTitle: 'Would you like more information about this service?',
    ctaText: 'Our team is available for additional questions and a conversation about the needs of your property or portfolio.',
    contact: 'Contact us',
    notFoundTitle: 'Service not found',
    notFoundText: 'The requested service is currently unavailable. Explore the complete overview of our services.',
    backToServices: 'All services',
  },
};

export const getServicesPageCopy = (language: SupportedLanguage) => servicesPageCopy[localeFor(language)];
