import { Request, Response } from "express";

import NewsletterSubscriber from "../../models/NewsletterSubscriber.js";

export const getNewsletterSubscribers = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const { search, status } = req.query;

  const filter: Record<string, unknown> = {};

  if (status === "active") {
    filter.isActive = true;
  }

  if (status === "inactive") {
    filter.isActive = false;
  }

  if (search) {
    filter.email = {
      $regex: String(search),
      $options: "i",
    };
  }

  const [items, total] = await Promise.all([
    NewsletterSubscriber.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    NewsletterSubscriber.countDocuments(filter),
  ]);

  res.json({
    items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

export const unsubscribeNewsletterSubscriber = async (
  req: Request,
  res: Response
) => {
  const subscriber = await NewsletterSubscriber.findById(req.params.id);

  if (!subscriber) {
    return res.status(404).json({
      message: "Newsletter prijava nije pronađena.",
    });
  }

  subscriber.isActive = false;
  subscriber.unsubscribedAt = new Date();

  await subscriber.save();

  res.json({
    message: "Email adresa je deaktivirana za newsletter.",
    subscriber,
  });
};

export const deleteNewsletterSubscriber = async (
  req: Request,
  res: Response
) => {
  const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);

  if (!subscriber) {
    return res.status(404).json({
      message: "Newsletter prijava nije pronađena.",
    });
  }

  res.json({
    message: "Newsletter prijava je obrisana.",
    deletedSubscriber: {
      id: subscriber._id,
      email: subscriber.email,
    },
  });
};