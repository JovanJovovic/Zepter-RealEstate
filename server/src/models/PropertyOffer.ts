import mongoose, { Document, Schema } from "mongoose";

export type PropertyOfferStatus = "new" | "reviewed" | "contacted" | "accepted" | "rejected";

export interface IPropertyOfferFile {
  originalName: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface IPropertyOffer extends Document {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  propertyType: string;
  city: string;
  municipality?: string | null;
  address?: string | null;
  fullLocation?: string | null;
  area?: number | null;
  proposedPrice?: number | null;
  currency: string;
  description?: string | null;
  images: IPropertyOfferFile[];
  floorPlans: IPropertyOfferFile[];
  documents: IPropertyOfferFile[];
  status: PropertyOfferStatus;
  internalNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const propertyOfferFileSchema = new Schema<IPropertyOfferFile>(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const propertyOfferSchema = new Schema<IPropertyOffer>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    propertyType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
      index: true,
    },
    municipality: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    fullLocation: {
      type: String,
      trim: true,
      default: null,
    },
    area: {
      type: Number,
      min: 0,
      default: null,
    },
    proposedPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "EUR",
      maxlength: 8,
    },
    description: {
      type: String,
      trim: true,
      default: null,
      maxlength: 5000,
    },
    images: {
      type: [propertyOfferFileSchema],
      default: [],
    },
    floorPlans: {
      type: [propertyOfferFileSchema],
      default: [],
    },
    documents: {
      type: [propertyOfferFileSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "contacted", "accepted", "rejected"],
      default: "new",
      index: true,
    },
    internalNote: {
      type: String,
      trim: true,
      default: null,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  }
);

propertyOfferSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  phone: "text",
  propertyType: "text",
  city: "text",
  municipality: "text",
  address: "text",
  fullLocation: "text",
  description: "text",
});

export default mongoose.model<IPropertyOffer>(
  "PropertyOffer",
  propertyOfferSchema,
  "property_offers"
);
