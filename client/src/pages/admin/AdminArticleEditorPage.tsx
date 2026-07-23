import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import {
  createAdminArticle,
  getAdminArticleById,
  updateAdminArticle,
  uploadAdminArticleFile,
} from '../../api/admin';
import ArticleImage from '../../components/ArticleImage';
import AdminNotice from '../../components/admin/AdminNotice';
import LoadingState from '../../components/LoadingState';
import { getArticleCopy } from '../../data/articleCopy';
import type { AdminArticle, ArticlePayload, ArticleStatus, ArticleType } from '../../types/article';
import type { AdminMessage } from '../../types/admin';
import type { SupportedLanguage } from '../../types/property';

interface AdminArticleEditorPageProps {
  articleId?: string;
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

type ArticleForm = Omit<ArticlePayload, 'publishedAt'> & { publishedAt: string };

const defaultForm: ArticleForm = {
  type: 'blog',
  titleSr: '',
  titleEn: '',
  slug: '',
  excerptSr: '',
  excerptEn: '',
  contentSr: '',
  contentEn: '',
  coverImage: '',
  galleryImages: [],
  category: '',
  author: 'Zepter Real Estate',
  publishedAt: '',
  status: 'draft',
  featured: false,
  videoUrl: '',
  metaTitle: '',
  metaDescription: '',
};

const slugify = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/đ/g, 'dj')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const toDateTimeLocal = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const formFromArticle = (article: AdminArticle): ArticleForm => ({
  type: article.type,
  titleSr: article.titleSr || '',
  titleEn: article.titleEn || '',
  slug: article.slug || '',
  excerptSr: article.excerptSr || '',
  excerptEn: article.excerptEn || '',
  contentSr: article.contentSr || '',
  contentEn: article.contentEn || '',
  coverImage: article.coverImage || '',
  galleryImages: article.galleryImages || [],
  category: article.category || '',
  author: article.author || '',
  publishedAt: toDateTimeLocal(article.publishedAt),
  status: article.status,
  featured: Boolean(article.featured),
  videoUrl: article.videoUrl || '',
  metaTitle: article.metaTitle || '',
  metaDescription: article.metaDescription || '',
});

const AdminArticleEditorPage = ({ articleId, navigate, language }: AdminArticleEditorPageProps) => {
  const copy = getArticleCopy(language).admin;
  const [form, setForm] = useState<ArticleForm>(defaultForm);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<AdminMessage | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(articleId));

  useEffect(() => {
    if (!articleId) return;

    getAdminArticleById(articleId)
      .then((article) => setForm(formFromArticle(article)))
      .catch((error) => setMessage({ type: 'error', text: error instanceof Error ? error.message : copy.editorLoadFailed }))
      .finally(() => setLoading(false));
  }, [articleId, copy.editorLoadFailed]);

  const setField = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateTitleSr = (value: string) => {
    setForm((current) => ({ ...current, titleSr: value, slug: slugEdited ? current.slug : slugify(value) }));
  };

  const uploadCover = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const response = await uploadAdminArticleFile(file, form.type);
      setField('coverImage', response.file.url);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : copy.saveFailed });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const uploadGallery = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setMessage(null);
    try {
      const responses = await Promise.all(files.map((file) => uploadAdminArticleFile(file, form.type)));
      setForm((current) => ({
        ...current,
        galleryImages: [...current.galleryImages, ...responses.map((response) => response.file.url)],
      }));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : copy.saveFailed });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload: ArticlePayload = {
      ...form,
      slug: form.slug || slugify(form.titleSr),
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
    };

    try {
      if (articleId) {
        await updateAdminArticle(articleId, payload);
        setMessage({ type: 'success', text: copy.updated });
      } else {
        const article = await createAdminArticle(payload);
        navigate(`/admin/articles/${article._id}/edit`);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : copy.saveFailed });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="admin-page"><LoadingState text={copy.editorLoadFailed.replace('nije učitani', 'se učitavaju')} /></main>;

  return (
    <div className="admin-page admin-article-editor-page">
      <section className="admin-page-heading">
        <div>
          <span className="admin-kicker">{copy.editorKicker}</span>
          <h2>{articleId ? copy.editTitle : copy.createTitle}</h2>
          <p>{copy.editorDescription}</p>
        </div>
        <button className="admin-heading-secondary" onClick={() => navigate('/admin/articles')}>{copy.backToList}</button>
      </section>

      <AdminNotice message={message} />

      <form className="admin-editor-grid" onSubmit={submit}>
        <div className="admin-editor-main">
          <section className="admin-form-card">
            <span className="admin-kicker">{copy.basics}</span>
            <div className="admin-form-grid admin-form-grid--two">
              <label className="admin-field">
                {copy.type}
                <select value={form.type} onChange={(event) => setField('type', event.target.value as ArticleType)}>
                  <option value="blog">Blog</option>
                  <option value="news">{language === 'sr' ? 'Vesti' : 'News'}</option>
                </select>
              </label>
              <label className="admin-field">
                {copy.slug}
                <input
                  required
                  value={form.slug}
                  onChange={(event) => { setSlugEdited(true); setField('slug', slugify(event.target.value)); }}
                  placeholder="novi-poslovni-prostor"
                />
                <small>{copy.slugHint}</small>
              </label>
              <label className="admin-field">
                {copy.category}
                <input value={form.category} onChange={(event) => setField('category', event.target.value)} />
              </label>
              <label className="admin-field">
                {copy.author}
                <input value={form.author} onChange={(event) => setField('author', event.target.value)} />
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{copy.serbian}</span>
            <div className="admin-form-grid">
              <label className="admin-field">
                {copy.titleSr}
                <input required value={form.titleSr} onChange={(event) => updateTitleSr(event.target.value)} />
              </label>
              <label className="admin-field">
                {copy.excerptSr}
                <textarea rows={4} value={form.excerptSr} onChange={(event) => setField('excerptSr', event.target.value)} />
              </label>
              <label className="admin-field">
                {copy.contentSr}
                <textarea required className="admin-article-content-input" rows={18} value={form.contentSr} onChange={(event) => setField('contentSr', event.target.value)} />
                <small>{copy.contentHint}</small>
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{copy.english}</span>
            <div className="admin-form-grid">
              <label className="admin-field">
                {copy.titleEn}
                <input value={form.titleEn} onChange={(event) => setField('titleEn', event.target.value)} />
              </label>
              <label className="admin-field">
                {copy.excerptEn}
                <textarea rows={4} value={form.excerptEn} onChange={(event) => setField('excerptEn', event.target.value)} />
              </label>
              <label className="admin-field">
                {copy.contentEn}
                <textarea className="admin-article-content-input" rows={18} value={form.contentEn} onChange={(event) => setField('contentEn', event.target.value)} />
                <small>{copy.contentHint}</small>
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{copy.seo}</span>
            <div className="admin-form-grid admin-form-grid--two">
              <label className="admin-field">
                {copy.metaTitle}
                <input value={form.metaTitle} onChange={(event) => setField('metaTitle', event.target.value)} />
              </label>
              <label className="admin-field">
                {copy.videoUrl}
                <input type="url" value={form.videoUrl} onChange={(event) => setField('videoUrl', event.target.value)} />
              </label>
              <label className="admin-field admin-field--wide">
                {copy.metaDescription}
                <textarea rows={3} value={form.metaDescription} onChange={(event) => setField('metaDescription', event.target.value)} />
              </label>
            </div>
          </section>
        </div>

        <aside className="admin-editor-side">
          <section className="admin-form-card admin-form-card--sticky-action">
            <span className="admin-kicker">{copy.publishing}</span>
            <label className="admin-field">
              {copy.status}
              <select value={form.status} onChange={(event) => setField('status', event.target.value as ArticleStatus)}>
                <option value="draft">{copy.draft}</option>
                <option value="published">{copy.publishedStatus}</option>
                <option value="archived">{copy.archived}</option>
              </select>
            </label>
            <label className="admin-field">
              {copy.publishedAt}
              <input type="datetime-local" value={form.publishedAt} onChange={(event) => setField('publishedAt', event.target.value)} />
            </label>
            <label className="admin-article-featured-toggle">
              <input type="checkbox" checked={form.featured} onChange={(event) => setField('featured', event.target.checked)} />
              <span>{copy.featured}</span>
            </label>
            <button className="admin-submit-button" disabled={saving || uploading} type="submit">
              {saving ? copy.saving : copy.save}
            </button>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{copy.coverImage}</span>
            {form.coverImage && (
              <div className="admin-article-cover-preview">
                <ArticleImage
                  source={form.coverImage}
                  alt=""
                  unavailableText={copy.imageUnavailable}
                  unavailableClassName="admin-article-cover-preview__unavailable"
                />
                <button type="button" onClick={() => setField('coverImage', '')}>{copy.remove}</button>
              </div>
            )}
            <label className="admin-upload-zone">
              <input type="file" accept="image/*" onChange={uploadCover} />
              <strong>{uploading ? copy.uploading : copy.uploadCover}</strong>
              <small>{copy.imageHint}</small>
            </label>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{copy.gallery}</span>
            <label className="admin-upload-zone">
              <input type="file" accept="image/*" multiple onChange={uploadGallery} />
              <strong>{uploading ? copy.uploading : copy.uploadGallery}</strong>
              <small>{copy.imageHint}</small>
            </label>
            <div className="admin-article-gallery-list">
              {form.galleryImages.map((image, index) => (
                <div key={`${image}-${index}`}>
                  <ArticleImage
                    source={image}
                    alt=""
                    unavailableText={copy.imageUnavailable}
                    unavailableClassName="admin-article-gallery-list__unavailable"
                    loading="lazy"
                  />
                  <button type="button" onClick={() => setField('galleryImages', form.galleryImages.filter((_, itemIndex) => itemIndex !== index))}>{copy.remove}</button>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
};

export default AdminArticleEditorPage;
