import slugify from "slugify";

export const slugifyText = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "sr",
    trim: true,
  });
};