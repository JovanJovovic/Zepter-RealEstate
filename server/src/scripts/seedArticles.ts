import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Article from "../models/Article.js";

dotenv.config();

const publicImage = (fileName: string) => `/Zepter Real Estate images/${fileName}`;

const articles = [
  {
    type: "blog",
    titleSr: "Kako odabrati pravi poslovni prostor",
    titleEn: "How to Choose the Right Business Space",
    slug: "kako-odabrati-pravi-poslovni-prostor",
    excerptSr: "Praktičan vodič kroz lokaciju, površinu, fleksibilnost i dugoročne potrebe kompanije.",
    excerptEn: "A practical guide to location, area, flexibility and the long-term needs of a company.",
    contentSr: `Izbor poslovnog prostora nije samo pitanje kvadrature. Dobra odluka povezuje lokaciju, način rada tima i planove kompanije za naredne godine.

Prvi korak je realna procena potrebne površine. Pored trenutnog broja zaposlenih, treba uzeti u obzir zajedničke zone, sale za sastanke, tehničke prostorije i mogućnost budućeg rasta.

Lokacija utiče na dostupnost zaposlenima i klijentima, ali i na svakodnevnu logistiku. Blizina javnog prevoza, parkinga i važnih gradskih pravaca često pravi veću razliku od same adrese.

Na kraju, kvalitet prostora treba posmatrati kroz fleksibilnost. Raspored koji se lako prilagođava različitim timovima i načinu rada može dugoročno doneti veću vrednost od kratkoročnog smanjenja troškova.`,
    contentEn: `Choosing a business space is not only about square metres. A strong decision connects location, the way a team works and the company's plans for the coming years.

The first step is a realistic assessment of the required area. In addition to the current number of employees, shared zones, meeting rooms, technical spaces and future growth should all be considered.

Location affects access for employees and clients, as well as daily logistics. Proximity to public transport, parking and major city routes often makes a greater difference than the address itself.

Finally, the quality of a space should be considered through flexibility. A layout that adapts easily to different teams and working styles can provide more long-term value than a short-term reduction in cost.`,
    coverImage: publicImage("office-services.jpg"),
    galleryImages: [publicImage("office-services2.jpg"), publicImage("office-services3.jpg")],
    category: "Poslovni prostori",
    author: "Zepter Real Estate",
    publishedAt: new Date("2026-02-12T09:00:00.000Z"),
    status: "published",
    featured: true,
  },
  {
    type: "blog",
    titleSr: "Značaj lokacije za komercijalne nekretnine",
    titleEn: "Why Location Matters in Commercial Real Estate",
    slug: "znacaj-lokacije-za-komercijalne-nekretnine",
    excerptSr: "Lokacija oblikuje vidljivost, pristupačnost i dugoročnu vrednost komercijalne nekretnine.",
    excerptEn: "Location shapes the visibility, accessibility and long-term value of a commercial property.",
    contentSr: `Kod komercijalnih nekretnina lokacija je deo poslovnog modela. Ona utiče na to koliko je prostor dostupan korisnicima, koliko je vidljiv i kako podržava svakodnevno poslovanje.

Za maloprodajne prostore važni su pešački tokovi i vidljivost. Za kancelarije prednost imaju dobra povezanost, sadržaji u okruženju i prijatno radno okruženje. Industrijski i logistički prostori traže brz pristup glavnim saobraćajnicama i funkcionalnu infrastrukturu.

Vrednost lokacije nije statična. Novi infrastrukturni projekti, razvoj poslovnih zona i promene navika korisnika mogu vremenom promeniti njen potencijal. Zato kvalitetna analiza sagledava i sadašnje uslove i pravac razvoja okruženja.`,
    contentEn: `In commercial real estate, location is part of the business model. It influences how accessible a space is, how visible it becomes and how well it supports daily operations.

Retail spaces depend on pedestrian flow and visibility. Offices benefit from strong connections, nearby amenities and a pleasant working environment. Industrial and logistics spaces require fast access to major roads and functional infrastructure.

The value of a location is not static. New infrastructure, business district development and changing user habits can transform its potential over time. A quality analysis therefore considers both current conditions and the direction in which the area is developing.`,
    coverImage: publicImage("portfolio Zepter Real Estate.jpg"),
    galleryImages: [publicImage("warehouse-services2.jpg"), publicImage("valuation-advirsory-services2.png")],
    category: "Tržište",
    author: "Zepter Real Estate",
    publishedAt: new Date("2026-01-28T10:30:00.000Z"),
    status: "published",
    featured: false,
  },
  {
    type: "blog",
    titleSr: "Fleksibilni kancelarijski prostori i savremeno poslovanje",
    titleEn: "Flexible Office Spaces and Modern Business",
    slug: "fleksibilni-kancelarijski-prostori-i-savremeno-poslovanje",
    excerptSr: "Kako prilagodljiv raspored podržava hibridni rad, saradnju i rast poslovnih timova.",
    excerptEn: "How adaptable layouts support hybrid work, collaboration and growing business teams.",
    contentSr: `Savremena kancelarija mora da odgovori na različite načine rada. Fokusirani zadaci, timska saradnja, sastanci sa klijentima i povremeni dolazak zaposlenih zahtevaju prostor koji se lako prilagođava.

Fleksibilnost se ne postiže samo pokretnim nameštajem. Važni su modularan raspored, kvalitetna akustika, pouzdana tehnička infrastruktura i jasna podela između mirnih i zajedničkih zona.

Dobro osmišljen prostor može da podrži produktivnost i kulturu kompanije, a istovremeno smanji potrebu za čestim i skupim adaptacijama. Zato se kancelarija sve više posmatra kao aktivan poslovni resurs.`,
    contentEn: `A modern office must support different ways of working. Focused tasks, team collaboration, client meetings and occasional employee attendance require a space that adapts easily.

Flexibility is not achieved only through movable furniture. A modular layout, quality acoustics, reliable technical infrastructure and a clear division between quiet and shared zones are equally important.

A well-designed space can support productivity and company culture while reducing the need for frequent and costly alterations. This is why the office is increasingly seen as an active business resource.`,
    coverImage: publicImage("what we do Zepter Real Estate.jpg"),
    galleryImages: [publicImage("office-services4.jpg"), publicImage("office-services5.jpg")],
    category: "Kancelarije",
    author: "Zepter Real Estate",
    publishedAt: new Date("2025-12-18T08:00:00.000Z"),
    status: "published",
    featured: false,
  },
  {
    type: "news",
    titleSr: "Zepter Real Estate portfolio dostupan za pregled",
    titleEn: "Zepter Real Estate Portfolio Available to Explore",
    slug: "zepter-real-estate-portfolio-dostupan-za-pregled",
    excerptSr: "Javna platforma sada objedinjuje pregled lokacija, dostupnih površina i tehničkih informacija.",
    excerptEn: "The public platform now brings locations, available areas and technical information into one clear view.",
    contentSr: `Zepter Real Estate portfolio sada je dostupan kroz unapređenu javnu platformu namenjenu jednostavnom pregledu nekretnina.

Korisnici mogu da istraže poslovne, komercijalne i druge prostore, pregledaju fotografije, dostupne površine, lokacije i relevantnu dokumentaciju. Cilj je da prve informacije o svakoj nekretnini budu jasne, pregledne i dostupne na jednom mestu.`,
    contentEn: `The Zepter Real Estate portfolio is now available through an improved public platform designed for clear property browsing.

Users can explore business, commercial and other spaces, review photographs, available areas, locations and relevant documents. The goal is to make the first information about every property clear and accessible in one place.`,
    coverImage: publicImage("portfolio Zepter Real Estate.jpg"),
    galleryImages: [],
    category: "Portfolio",
    author: "Zepter Real Estate",
    publishedAt: new Date("2026-03-03T11:00:00.000Z"),
    status: "published",
    featured: true,
  },
  {
    type: "news",
    titleSr: "Nova funkcionalnost za ponudu nekretnina",
    titleEn: "New Property Offer Feature",
    slug: "nova-funkcionalnost-za-ponudu-nekretnina",
    excerptSr: "Vlasnici sada mogu jednostavno da pošalju osnovne podatke, fotografije i dokumentaciju o svojoj nekretnini.",
    excerptEn: "Owners can now submit key property details, photographs and documents through a dedicated form.",
    contentSr: `Na javnom sajtu Zepter Real Estate dostupna je nova funkcionalnost za ponudu nekretnina.

Forma omogućava slanje osnovnih kontakt podataka, informacija o lokaciji, površini i očekivanoj ceni, kao i fotografija, planova i prateće dokumentacije. Svaka prijava stiže direktno u administrativni sistem radi daljeg pregleda i komunikacije.`,
    contentEn: `A new property offer feature is now available on the Zepter Real Estate public website.

The form supports contact details, location, area and expected price information, together with photographs, plans and supporting documents. Every submission reaches the administration system directly for review and further communication.`,
    coverImage: publicImage("who we are Zepter-Real Estate.jpg"),
    galleryImages: [],
    category: "Platforma",
    author: "Zepter Real Estate",
    publishedAt: new Date("2026-02-21T09:30:00.000Z"),
    status: "published",
    featured: false,
  },
  {
    type: "news",
    titleSr: "Digitalna prezentacija poslovnih prostora",
    titleEn: "Digital Presentation of Business Spaces",
    slug: "digitalna-prezentacija-poslovnih-prostora",
    excerptSr: "Unapređeni prikazi povezuju galerije, tehničke podatke, mape i direktne upite za konkretnu nekretninu.",
    excerptEn: "Enhanced presentations connect galleries, technical data, maps and direct inquiries for each property.",
    contentSr: `Digitalna prezentacija Zepter poslovnih prostora dodatno je unapređena.

Detaljne stranice sada povezuju fotografije, tehničke informacije, dokumente, planove i lokaciju na mapi. Posetioci mogu direktno sa stranice nekretnine da pošalju upit, pri čemu administrativni tim dobija jasan kontekst objekta za koji je korisnik zainteresovan.`,
    contentEn: `The digital presentation of Zepter business spaces has been further improved.

Property detail pages now connect photographs, technical information, documents, plans and map locations. Visitors can send an inquiry directly from a property page, giving the administration team clear context about the property of interest.`,
    coverImage: publicImage("project-management-services.png"),
    galleryImages: [],
    category: "Digitalno",
    author: "Zepter Real Estate",
    publishedAt: new Date("2026-01-15T12:00:00.000Z"),
    status: "published",
    featured: false,
  },
] as const;

const seedArticles = async () => {
  await connectDB();

  for (const article of articles) {
    await Article.findOneAndUpdate(
      { slug: article.slug },
      { $set: article },
      { upsert: true, returnDocument: "after", runValidators: true }
    );
    console.log(`Seeded ${article.type}: ${article.slug}`);
  }

  const [blogCount, newsCount] = await Promise.all([
    Article.countDocuments({ type: "blog" }),
    Article.countDocuments({ type: "news" }),
  ]);

  console.log(`Articles seed completed. Blog: ${blogCount}, News: ${newsCount}.`);
  await mongoose.disconnect();
};

seedArticles().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
