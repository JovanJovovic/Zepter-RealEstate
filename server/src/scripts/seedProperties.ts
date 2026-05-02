import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Property from "../models/Property.js";
import { slugifyText } from "../utils/slugifyText.js";

dotenv.config();

const imageUrl = (fileName: string) => {
    return encodeURI(`/uploads/property_images/${fileName}`);
};

const pdfUrl = (fileName: string) => {
    return encodeURI(`/uploads/property_pdfs/${fileName}`);
};

const palataDescription =
    'The architectural symbol of the nineties in Belgrade. The building was completed in 1997 and represents a work of architects Vasilije Milunovic, Branislav Mitrovic and Dusan Tesic (interior). Monumental double facade of the building is specifically designed to fit the surrounding buildings that were built in different periods and have numerous ornaments and decorative plastics. The structure of the facade is a combination of marble, glass and metal. Using elements of polished steel has a double meaning: on one hand, it corresponds to the nature of products of "Zepter" company, whereas on the other hand, by using modern materials it entirely corresponds with modern technological trends. From the courtyard side of the building there is a spacious atrium that has a function of the summer garden of the ground floor restaurant. The restaurant has a capacity of eighty seats and is suitable for special events, it also provides catering services. Also, there is a bank branch office located in the basement. The buiding has permanent video surveillance and security.';

const palataDescriptionSr =
    'Arhitektonski simbol devedesetih godina u Beogradu. Zgrada je završena 1997. godine i delo je arhitekata Vasilija Milunovića, Branislava Mitrovića i Dušana Tesića. Monumentalna dvostruka fasada projektovana je tako da se uklopi u okolne objekte građene u različitim periodima, sa brojnim ornamentima i dekorativnom plastikom. Struktura fasade kombinuje mermer, staklo i metal. Elementi poliranog čelika odgovaraju prirodi proizvoda kompanije Zepter i savremenim tehnološkim trendovima. Sa dvorišne strane nalazi se prostrani atrijum koji funkcioniše kao letnja bašta restorana u prizemlju. Restoran ima kapacitet od osamdeset mesta, pogodan je za posebne događaje i pruža ketering usluge. U suterenu se nalazi i ekspozitura banke. Objekat ima stalni video-nadzor i obezbeđenje.';

const officeAbout =
    "The construction of the building started in 1941. and was partially completed in 1943. (arc part of the building). Its design was influenced by the modernism. At the beginnins of the fifties work resumed, and by the 1954. parts of the building stretching trough the Knez Mihailova and Sremska street were completed, along with additional floors. During the 2006. and 2007. the seventh floor was added which also included the construction of the glass dome. Today, this building represents one of the dominant landmarks of the Belgrade downtown. Bottom and ground levels fetaure retail space, while upper floors are intended for office space. Building has three entrances – two from Knez Mihailova street, and one from Sremska street which also has a car entrance. Each floor has area of about 1000 m², and can be roughly divided in two to three parts depending on the needs of the future tenants. Offices on the second, third, fourth and fifth floor have classic layout – they stretch through the sides of the single corridor, while sixth and seventh floor fetaure open space configuration which offers wide possibilities on terms of work space organisation by the tennants.";

const shipyardAbout =
    "Approximately 4 km from the centre of Belgrade and 9 km from the belgrade Airport The land lot is positioned in New Belgrade on the Sava riverside, in direct vicinty of the new bridge over the Sava River on Ada Ciganlija. It has well-organized road infrastructure and direct access to main boulevards. Within the complex, there are several thousand square meters of warehouse space (in range from 800 sqm to 1800 sqm) and various categories of office units. Possibility of open storage space rent.";

const officeAboutSr =
    "Izgradnja objekta počela je 1941. godine, a delimično je završena 1943. godine. Na projekat je uticao modernizam. Početkom pedesetih radovi su nastavljeni, a do 1954. završeni su delovi zgrade koji se pružaju ka Knez Mihailovoj i Sremskoj ulici, zajedno sa dodatnim spratovima. Tokom 2006. i 2007. dograđen je sedmi sprat, uključujući i staklenu kupolu. Danas ovaj objekat predstavlja jedno od dominantnih obeležja centra Beograda. Donji nivo i prizemlje namenjeni su maloprodaji, dok su spratovi predviđeni za kancelarijski prostor. Zgrada ima tri ulaza, dva iz Knez Mihailove ulice i jedan iz Sremske ulice, gde postoji i kolski ulaz. Svaki sprat ima oko 1.000 m² i može se podeliti na dve do tri celine u skladu sa potrebama zakupaca. Kancelarije na drugom, trećem, četvrtom i petom spratu imaju klasičan raspored duž hodnika, dok šesti i sedmi sprat nude open-space konfiguraciju.";

const shipyardAboutSr =
    "Na približno 4 km od centra Beograda i 9 km od beogradskog aerodroma, kompleks se nalazi na Novom Beogradu, uz obalu Save, u neposrednoj blizini novog mosta preko Save na Adi Ciganliji. Lokacija ima dobro organizovanu putnu infrastrukturu i direktan pristup glavnim bulevarima. U okviru kompleksa nalazi se više hiljada kvadratnih metara magacinskog prostora, u rasponu od 800 m² do 1.800 m², kao i različite kategorije kancelarijskih jedinica. Postoji mogućnost zakupa otvorenog skladišnog prostora.";

const properties = [
    {
        title: "Palata Zepter - KRALJA PETRA, BEOGRAD",
        publicId: "ZRE-000001",
        category: "commercial",
        types: ["offices", "retails"],
        location: {
            city: "Beograd",
            municipality: "Stari Grad",
            fullLocation: "Beograd Stari Grad",
            address: "Kralja Petra 32",
            latitude: 44.8212773,
            longitude: 20.456994,
        },
        sizeSqm: 3706,
        sizeLabel: "3,706 m2",
        condition: "available",
        rooms: ">4",
        floorLabel: "basement - sixth Floor",
        floors: ["6", "5", "4", "3", "2", "1", "Pr"],
        shortDescription: "The architectural symbol of the nineties in Belgrade.",
        fullDescription: palataDescription,
        aboutProperty: palataDescription,
        translations: [
            {
                language: "sr",
                title: "Palata Zepter - KRALJA PETRA, BEOGRAD",
                location: {
                    city: "Beograd",
                    municipality: "Stari Grad",
                    fullLocation: "Beograd Stari Grad",
                    address: "Kralja Petra 32",
                },
                sizeLabel: "3.706 m²",
                floorLabel: "suteren - šesti sprat",
                floors: ["6", "5", "4", "3", "2", "1", "Pr"],
                shortDescription: "Arhitektonski simbol devedesetih godina u Beogradu.",
                fullDescription: palataDescriptionSr,
                aboutProperty: palataDescriptionSr,
            },
        ],
        specialRequirements: [
            "water",
            "internet",
            "phone",
            "video-surveillance",
            "security",
            "electricity",
        ],
        images: [
            "Palata Zepter - Kralja Petra 1.jpg",
            "Palata Zepter - Kralja Petra 2.jpg",
            "Palata Zepter - Kralja Petra 3.jpg",
            "Palata Zepter - Kralja Petra 4.jpg",
            "Palata Zepter - Kralja Petra 5.jpg",
            "Palata Zepter - Kralja Petra 6.jpg",
        ].map((fileName, index) => ({
            url: imageUrl(fileName),
            alt: `Palata Zepter - Kralja Petra ${index + 1}`,
            isMain: index === 0,
            order: index + 1,
        })),
        floorPlans: [],
        videoUrl: "http://www.youtube.com/embed/Y9s1IspE-Vo",
        isFeatured: true,
        status: "published",
    },
    {
        title: "Zepter Office Building - Knez Mihailova, Beograd",
        publicId: "ZRE-000002",
        category: "commercial",
        types: ["offices", "retails"],
        location: {
            city: "Beograd",
            municipality: "Stari Grad",
            fullLocation: "Beograd Stari Grad",
            address: "Knez Mihailova 1 - 3",
        },
        sizeSqm: 7200,
        sizeLabel: "7,200 m2",
        condition: "available",
        rooms: ">4",
        floorLabel: "ground floor - seventh Floor",
        floors: ["7", "6", "5", "4", "3", "2", "1", "Pr"],
        shortDescription:
            "Open space configuration which offers wide possibilities on terms of work space organisation by the tennants.",
        fullDescription:
            "Open space configuration which offers wide possibilities on terms of work space organisation by the tennants.",
        aboutProperty: officeAbout,
        translations: [
            {
                language: "sr",
                title: "Zepter poslovna zgrada - Knez Mihailova, Beograd",
                location: {
                    city: "Beograd",
                    municipality: "Stari Grad",
                    fullLocation: "Beograd Stari Grad",
                    address: "Knez Mihailova 1 - 3",
                },
                sizeLabel: "7.200 m²",
                floorLabel: "prizemlje - sedmi sprat",
                floors: ["7", "6", "5", "4", "3", "2", "1", "Pr"],
                shortDescription:
                    "Open-space konfiguracija pruža široke mogućnosti organizacije radnog prostora za zakupce.",
                fullDescription:
                    "Open-space konfiguracija pruža široke mogućnosti organizacije radnog prostora za zakupce.",
                aboutProperty: officeAboutSr,
            },
        ],
        specialRequirements: ["internet", "phone", "security", "electricity", "water"],
        images: [
            "Zepter Office Building - Knez Mihailova 1.jpg",
            "Zepter Office Building - Knez Mihailova 2.jpg",
            "Zepter Office Building - Knez Mihailova 3.jpg",
            "Zepter Office Building - Knez Mihailova 4.jpg",
            "Zepter Office Building - Knez Mihailova 5.jpg",
        ].map((fileName, index) => ({
            url: imageUrl(fileName),
            alt: `Zepter Office Building - Knez Mihailova ${index + 1}`,
            isMain: index === 0,
            order: index + 1,
        })),
        floorPlans: [
            // Dodaj kada ubaciš PDF u uploads/property_pdfs:
            {
                title: "NACRT SLOBODNOG DELA 3. SPRAT",
                fileUrl: pdfUrl("NACRT_SLOBODNOG_DELA_3.SPRAT.pdf"),
                order: 1,
            },
        ],
        isFeatured: true,
        status: "published",
    },
    {
        title: "Zepter Shipyard Immo",
        publicId: "ZRE-000003",
        category: "commercial",
        types: ["warehouses", "industrial"],
        location: {
            city: "Beograd",
            municipality: "Novi Beograd",
            fullLocation: "Beograd Novi Beograd",
            address: "Savski nasip 7",
        },
        sizeSqm: 65000,
        sizeLabel: "65,000 m2",
        condition: "available",
        rooms: ">4",
        floorLabel: "ground floor - attic",
        floors: ["2", "1", "Pr"],
        shortDescription:
            "Within the complex, there are several thousand square meters of warehouse space in range from 380 sqm to 4600 sqm. Possibility of open storage space rent.",
        fullDescription:
            "Within the complex, there are several thousand square meters of warehouse space in range from 380 sqm to 4600 sqm. Possibility of open storage space rent.",
        aboutProperty: shipyardAbout,
        translations: [
            {
                language: "sr",
                title: "Zepter Shipyard Immo",
                location: {
                    city: "Beograd",
                    municipality: "Novi Beograd",
                    fullLocation: "Beograd Novi Beograd",
                    address: "Savski nasip 7",
                },
                sizeLabel: "65.000 m²",
                floorLabel: "prizemlje - potkrovlje",
                floors: ["2", "1", "Pr"],
                shortDescription:
                    "U okviru kompleksa nalazi se više hiljada kvadratnih metara magacinskog prostora od 380 m² do 4.600 m². Moguć je zakup otvorenog skladišnog prostora.",
                fullDescription:
                    "U okviru kompleksa nalazi se više hiljada kvadratnih metara magacinskog prostora od 380 m² do 4.600 m². Moguć je zakup otvorenog skladišnog prostora.",
                aboutProperty: shipyardAboutSr,
            },
        ],
        specialRequirements: ["parking", "electricity", "water", "security"],
        images: [
            "Zepter Shipyard Immo 1.jpg",
            "Zepter Shipyard Immo 2.jpg",
            "Zepter Shipyard Immo 3.jpg",
            "Zepter Shipyard Immo 4.jpg",
            "Zepter Shipyard Immo 5.jpg",
        ].map((fileName, index) => ({
            url: imageUrl(fileName),
            alt: `Zepter Shipyard Immo ${index + 1}`,
            isMain: index === 0,
            order: index + 1,
        })),
        floorPlans: [
            {
                title: "KOPIJA PLANA BRODOGRADILIŠTE",
                fileUrl: pdfUrl("Zepter Shipyard Immo pdf.pdf"),
                order: 1,
            },
        ],
        isFeatured: true,
        status: "published",
    },
];

const seedProperties = async () => {
    await connectDB();

    for (const propertyData of properties) {
        const slug = slugifyText(propertyData.title);

        await Property.findOneAndUpdate(
            { publicId: propertyData.publicId },
            {
                ...propertyData,
                slug,
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true,
            }
        );

        console.log(`Seeded property: ${propertyData.title}`);
    }

    await mongoose.disconnect();

    console.log("Properties seed completed.");
};

seedProperties().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
});
