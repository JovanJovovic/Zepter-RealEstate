import fs from "fs";
import mongoose from "mongoose";

export type ArticleMediaType = "blog" | "news";

type ArticleMediaFile = Pick<
  Express.Multer.File,
  "filename" | "originalname" | "mimetype" | "size" | "path"
>;

const ARTICLE_MEDIA_BUCKET = "articleMedia";

const getBucket = () => {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error("MongoDB connection is not ready for article media storage.");
  }

  return new mongoose.mongo.GridFSBucket(database, {
    bucketName: ARTICLE_MEDIA_BUCKET,
  });
};

export const persistArticleMedia = async (
  file: ArticleMediaFile,
  type: ArticleMediaType
): Promise<void> => {
  const bucket = getBucket();

  await new Promise<void>((resolve, reject) => {
    const source = fs.createReadStream(file.path);
    const destination = bucket.openUploadStream(file.filename, {
      metadata: {
        type,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    source.once("error", reject);
    destination.once("error", reject);
    destination.once("finish", () => resolve());
    source.pipe(destination);
  });
};

export const findArticleMedia = async (
  filename: string,
  type: ArticleMediaType
) => {
  const bucket = getBucket();
  const [file] = await bucket
    .find({
      filename,
      "metadata.type": type,
    })
    .sort({ uploadDate: -1 })
    .limit(1)
    .toArray();

  return file;
};

export const openArticleMediaDownloadStream = (fileId: mongoose.mongo.BSON.ObjectId) => (
  getBucket().openDownloadStream(fileId)
);

