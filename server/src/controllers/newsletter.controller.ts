import { Request, Response } from "express";

import NewsletterSubscriber from "../models/NewsletterSubscriber.js";

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const subscribeToNewsletter = async (req: Request, res: Response) => {
  const { email, source } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      message: "Email adresa je obavezna.",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({
      message: "Email adresa nije validna.",
    });
  }

  const existingSubscriber = await NewsletterSubscriber.findOne({
    email: normalizedEmail,
  });

  if (existingSubscriber) {
    if (existingSubscriber.isActive) {
      return res.status(400).json({
        message: "Ova email adresa je već prijavljena na newsletter.",
      });
    }

    existingSubscriber.isActive = true;
    existingSubscriber.subscribedAt = new Date();
    existingSubscriber.unsubscribedAt = undefined;
    existingSubscriber.source = source || "website";

    await existingSubscriber.save();

    return res.json({
      message: "Uspešno ste ponovo prijavljeni na newsletter.",
      subscriber: {
        id: existingSubscriber._id,
        email: existingSubscriber.email,
        isActive: existingSubscriber.isActive,
      },
    });
  }

  const subscriber = await NewsletterSubscriber.create({
    email: normalizedEmail,
    source: source || "website",
  });

  res.status(201).json({
    message: "Uspešno ste se prijavili na newsletter.",
    subscriber: {
      id: subscriber._id,
      email: subscriber.email,
      isActive: subscriber.isActive,
    },
  });
};