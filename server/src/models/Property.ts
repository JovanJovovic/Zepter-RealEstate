import mongoose, { Document, Schema } from "mongoose";

export type PropertyCategory = "commercial" | "private" | "project-development";

export type PropertyType =
  | "houses"
  | "retails"
  | "offices"
  | "warehouses"
  | "industrial"
  | "agricultural"
  | "apartments"
  | "land"
  | "other";

export type PropertyCondition =
  | "available"
  | "ongoing-reconstruction"
  | "major-refitting"
  | "minor-refitting"
  | "in-construction"
  | "not-specified";

export type PropertyStatus = "draft" | "published" | "archived";

export type SupportedLanguage = "en" | "sr" | "ru" | "de";

export interface IPropertyImage {
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  isMain?: boolean;
  order?: number;
}

export interface IFloorPlan {
  title?: string;
  fileUrl: string;
  imageUrl?: string;
  order?: number;
}

export interface IPropertyLocation {
  city?: string;
  municipality?: string;
  fullLocation: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface IPropertyTranslation {
  language: SupportedLanguage;
  title?: string;
  location?: Partial<IPropertyLocation>;
  sizeLabel?: string;
  floorLabel?: string;
  floors?: string[];
  shortDescription?: string;
  fullDescription?: string;
  aboutProperty?: string;
}

export interface IProperty extends Document {
  title: string;
  slug: string;

  publicId: string;

  category: PropertyCategory;
  types: PropertyType[];

  location: IPropertyLocation;

  sizeSqm?: number;
  sizeLabel?: string;

  condition: PropertyCondition;
  rooms?: string;

  floorLabel?: string;
  floors?: string[];

  shortDescription?: string;
  fullDescription?: string;
  aboutProperty?: string;

  translations: IPropertyTranslation[];

  specialRequirements: string[];

  images: IPropertyImage[];
  floorPlans: IFloorPlan[];

  videoUrl?: string;

  contactPhone?: string;
  contactEmail?: string;

  isFeatured: boolean;
  status: PropertyStatus;

  createdAt: Date;
  updatedAt: Date;
}

const propertyImageSchema = new Schema<IPropertyImage>(
  {
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    alt: {
      type: String,
    },
    isMain: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const floorPlanSchema = new Schema<IFloorPlan>(
  {
    title: {
      type: String,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const propertyLocationSchema = new Schema<IPropertyLocation>(
  {
    city: {
      type: String,
      trim: true,
    },
    municipality: {
      type: String,
      trim: true,
    },
    fullLocation: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  { _id: false }
);

const propertyTranslationLocationSchema = new Schema<Partial<IPropertyLocation>>(
  {
    city: {
      type: String,
      trim: true,
    },
    municipality: {
      type: String,
      trim: true,
    },
    fullLocation: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  { _id: false }
);

const propertyTranslationSchema = new Schema<IPropertyTranslation>(
  {
    language: {
      type: String,
      enum: ["en", "sr", "ru", "de"],
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    location: {
      type: propertyTranslationLocationSchema,
    },
    sizeLabel: {
      type: String,
      trim: true,
    },
    floorLabel: {
      type: String,
      trim: true,
    },
    floors: {
      type: [String],
      default: undefined,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    fullDescription: {
      type: String,
    },
    aboutProperty: {
      type: String,
    },
  },
  { _id: false }
);

const propertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["commercial", "private", "project-development"],
      default: "commercial",
      index: true,
    },

    types: {
      type: [String],
      enum: [
        "houses",
        "retails",
        "offices",
        "warehouses",
        "industrial",
        "agricultural",
        "apartments",
        "land",
        "other",
      ],
      default: [],
      index: true,
    },

    location: {
      type: propertyLocationSchema,
      required: true,
    },

    sizeSqm: {
      type: Number,
      min: 0,
    },
    sizeLabel: {
      type: String,
      trim: true,
    },

    condition: {
      type: String,
      enum: [
        "available",
        "ongoing-reconstruction",
        "major-refitting",
        "minor-refitting",
        "in-construction",
        "not-specified",
      ],
      default: "not-specified",
      index: true,
    },

    rooms: {
      type: String,
      trim: true,
      index: true,
    },

    floorLabel: {
      type: String,
      trim: true,
    },
    floors: {
      type: [String],
      default: [],
    },

    shortDescription: {
      type: String,
      trim: true,
    },
    fullDescription: {
      type: String,
    },
    aboutProperty: {
      type: String,
    },

    translations: {
      type: [propertyTranslationSchema],
      default: [],
    },

    specialRequirements: {
      type: [String],
      enum: [
        "phone",
        "internet",
        "parking",
        "invalid-access",
        "video-surveillance",
        "security",
        "electricity",
        "water",
      ],
      default: [],
    },

    images: {
      type: [propertyImageSchema],
      default: [],
    },

    floorPlans: {
      type: [floorPlanSchema],
      default: [],
    },

    videoUrl: {
      type: String,
      trim: true,
    },

    contactPhone: {
      type: String,
      default: "+381 11 20 19 170",
    },
    contactEmail: {
      type: String,
      default: "realestate@zepter.rs",
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({
  title: "text",
  shortDescription: "text",
  fullDescription: "text",
  aboutProperty: "text",
  "location.fullLocation": "text",
  "location.address": "text",
  "translations.title": "text",
  "translations.shortDescription": "text",
  "translations.fullDescription": "text",
  "translations.aboutProperty": "text",
  "translations.location.fullLocation": "text",
  "translations.location.address": "text",
});

export default mongoose.model<IProperty>("Property", propertySchema, "properties");
