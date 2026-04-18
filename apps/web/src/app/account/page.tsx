"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth, type User } from "@/lib/auth";

const ROLE_LABEL: Record<string, string> = {
  CLIENT: "Client",
  TAILOR: "Tailleur",
  ADMIN: "Administrateur",
};

export default function AccountPage() {
  const router = useRouter();
  const { user, token, setSession, logout } = useAuth();
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
    }
  }, [user]);

  if (!user || !token) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center text-sm text-bark/55">
        <p>Connectez-vous pour accéder à votre compte.</p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-gold-dim underline"
        >
          Connexion
        </Link>
      </div>
    );
  }

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !token) return;
    setMsg(null);
    setSaving(true);
    try {
      const body: {
        fullName?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {};
      if (fullName.trim() !== user.fullName) {
        body.fullName = fullName.trim();
      }
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      if (Object.keys(body).length === 0) {
        setMsg("Aucune modification.");
        setSaving(false);
        return;
      }
      const res = await api<{ user: User; token: string }>(
        "/auth/profile",
        {
          method: "PATCH",
          token,
          body: JSON.stringify(body),
        }
      );
      setSession(res.token, res.user);
      setCurrentPassword("");
      setNewPassword("");
      setMsg("Enregistré.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Échec");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-4xl text-bark">Compte</h1>
      <p className="mt-2 text-sm text-bark/55">
        Profil et sécurité — l’e-mail ne peut pas être modifié ici.
      </p>

      {msg && (
        <p
          className={`mt-6 text-sm ${msg.startsWith("Enregistré") ? "text-forest" : "text-red-700"}`}
        >
          {msg}
        </p>
      )}

      <form onSubmit={onSaveProfile} className="mt-10 space-y-10">
        <section className="rounded-3xl border border-gold/15 bg-cream/90 p-6 shadow-fabric">
          <h2 className="text-xs uppercase tracking-[0.3em] text-bark/45">
            Profil
          </h2>
          <label className="mt-4 block text-sm text-bark/70">
            Nom
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-bark outline-none ring-gold/25 focus:ring-2"
            />
          </label>
          <label className="mt-4 block text-sm text-bark/70">
            E-mail <span className="text-bark/40">(lecture seule)</span>
            <input
              type="email"
              value={user.email}
              readOnly
              className="mt-2 w-full cursor-not-allowed rounded-xl border border-black/5 bg-sand/40 px-4 py-2.5 text-bark/70"
            />
          </label>
          <p className="mt-4 text-sm text-bark/55">
            Rôle :{" "}
            <span className="font-medium text-bark">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </p>
        </section>

        <section
          id="settings"
          className="rounded-3xl border border-gold/15 bg-cream/90 p-6 shadow-fabric"
        >
          <h2 className="text-xs uppercase tracking-[0.3em] text-bark/45">
            Sécurité
          </h2>
          <p className="mt-2 text-sm text-bark/50">
            Laissez vide pour ne pas changer le mot de passe.
          </p>
          <label className="mt-4 block text-sm text-bark/70">
            Mot de passe actuel
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-bark outline-none ring-gold/25 focus:ring-2"
            />
          </label>
          <label className="mt-4 block text-sm text-bark/70">
            Nouveau mot de passe
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-bark outline-none ring-gold/25 focus:ring-2"
            />
          </label>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-forest px-8 py-3 text-xs uppercase tracking-[0.3em] text-cream disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="rounded-full border border-bark/15 px-8 py-3 text-xs uppercase tracking-[0.3em] text-bark"
          >
            Déconnexion
          </button>
        </div>
      </form>
    </div>
  );
}
