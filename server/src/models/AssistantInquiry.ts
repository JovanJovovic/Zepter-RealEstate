import mongoose, { Document, Schema } from "mongoose";

export type AssistantInquiryStatus = "new" | "in-progress" | "answered" | "archived";
export type AssistantInquiryType = "assistant-widget" | "property-contact-form";

export interface IAssistantInquiry extends Document {
  question: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  inquiryType: AssistantInquiryType;
  sourcePage?: string | null;
  pageTitle?: string | null;
  propertyId?: string | null;
  propertyPublicId?: string | null;
  propertySlug?: string | null;
  propertyName?: string | null;
  status: AssistantInquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const assistantInquirySchema = new Schema<IAssistantInquiry>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 160,
      default: null,
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
    inquiryType: {
      type: String,
      enum: ["assistant-widget", "property-contact-form"],
      default: "assistant-widget",
      index: true,
    },
    sourcePage: {
      type: String,
      trim: true,
      default: null,
    },
    pageTitle: {
      type: String,
      trim: true,
      default: null,
    },
    propertyId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    propertyPublicId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    propertySlug: {
      type: String,
      trim: true,
      default: null,
    },
    propertyName: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "answered", "archived"],
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

assistantInquirySchema.index({
  question: "text",
  email: "text",
  phone: "text",
  sourcePage: "text",
  pageTitle: "text",
  propertyId: "text",
  propertyName: "text",
});

export default mongoose.model<IAssistantInquiry>(
  "AssistantInquiry",
  assistantInquirySchema,
  "assistant_inquiries"
);
