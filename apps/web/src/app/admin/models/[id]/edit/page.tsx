"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { FashionModel } from "@/types";

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string" && x.length > 0);
  }
  if (typeof raw === "string" && raw.length > 0) {
    return [raw];
  }
  return [];
}

export default function AdminEditModelImagesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const [model, setModel] = useState<FashionModel | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [appendToExisting, setAppendToExisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const id = params.id;

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const m = await api<FashionModel>(`/catalog/models/${id}`);
      setModel(m);
    } catch {
      setError("Modèle introuvable.");
      setModel(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length) {
      setFiles([]);
      return;
    }
    setFiles(Array.from(list));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || user?.role !== "ADMIN") return;
    if (files.length === 0) {
      setError("Sélectionnez au moins une image.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      for (const file of files) {
        fd.append("images", file);
      }
      fd.append("imageMode", appendToExisting ? "append" : "replace");
      await api(`/admin/models/${id}`, {
        method: "PATCH",
        token,
        body: fd,
      });
      router.push("/admin?section=models");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l’enregistrement");
    } finally {
      setSaving(false);
    }
  }

  const savedImages = model ? parseImages(model.images) : [];

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="px-6 py-24 text-center text-sm text-bark/55">
        Accès réservé aux administrateurs.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-bark/50">
        Chargement…
      </div>
    );
  }

  if (!model) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-red-700">{error ?? "Introuvable"}</p>
        <Link href="/admin?section=models" className="mt-4 inline-block text-gold-dim">
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/admin?section=models"
        className="text-xs uppercase tracking-[0.25em] text-bark/45 hover:text-bark"
      >
        ← Modèles
      </Link>
      <h1 className="mt-6 font-display text-3xl text-bark">Images du modèle</h1>
      <p className="mt-2 text-sm text-bark/55">{model.name}</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-bark/45">
            Images enregistrées
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            {savedImages.map((src) => (
              <div
                key={src}
                className="relative h-40 w-32 overflow-hidden rounded-xl border border-gold/20 bg-sand/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
            {savedImages.length === 0 && (
              <p className="text-sm text-bark/45">Aucune image enregistrée</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-bark/45">
            Fichiers depuis votre ordinateur
          </p>
          <label className="mt-4 flex cursor-pointer flex-col gap-2 rounded-xl border border-black/10 bg-white/90 px-4 py-4 text-sm text-bark ring-gold/25 transition hover:border-gold/30 focus-within:ring-2">
            <span className="text-bark/70">
              Glisser-déposer ou cliquer pour choisir — plusieurs images possibles
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFilesChange}
              className="text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-forest/90 file:px-3 file:py-2 file:text-[10px] file:uppercase file:tracking-[0.15em] file:text-cream"
            />
          </label>
          {savedImages.length > 0 && (
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-bark/70">
              <input
                type="checkbox"
                checked={appendToExisting}
                onChange={(e) => setAppendToExisting(e.target.checked)}
                className="h-4 w-4 rounded border-bark/25 text-forest focus:ring-gold/40"
              />
              Ajouter aux images existantes (sinon remplacer)
            </label>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-bark/45">
            Aperçu avant enregistrement
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            {previewUrls.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative h-40 w-32 overflow-hidden rounded-xl border border-forest/25 bg-cream"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="128px"
                  unoptimized
                />
              </div>
            ))}
            {previewUrls.length === 0 && (
              <p className="text-sm text-bark/45">Aucun fichier sélectionné</p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-forest px-8 py-3 text-xs uppercase tracking-[0.3em] text-cream disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <Link
            href="/admin?section=models"
            className="rounded-full border border-bark/15 px-8 py-3 text-xs uppercase tracking-[0.3em] text-bark"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
