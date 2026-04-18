"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Category, FashionModel } from "@/types";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { adminRoleLabel, orderStatusLabel } from "@/lib/i18n/messages";
import { formatDateTime, formatPriceWithSymbol } from "@/lib/utils";

type Analytics = {
  ordersByStatus: { status: string; _count: { id: number } }[];
  revenueTotal: unknown;
  userCount: number;
  tailorCount: number;
};

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  disabled: boolean;
  tailorProfile?: {
    id: string;
    active: boolean;
    categories: {
      categoryId: string;
      category: { name: string; slug: string };
    }[];
  } | null;
};

type AdminOrderRow = {
  id: string;
  status: string;
  subtotal: number | string;
  createdAt: string;
  category?: { name: string };
  client?: { fullName: string; email: string };
};

function AdminPageContent() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [models, setModels] = useState<FashionModel[]>([]);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [section, setSection] = useState<
    "overview" | "users" | "models" | "orders" | "admins"
  >("overview");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modelEdits, setModelEdits] = useState<
    Record<string, { name: string; subtitle: string }>
  >({});
  const [savingModelId, setSavingModelId] = useState<string | null>(null);
  const [creatingModel, setCreatingModel] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newName, setNewName] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBasePrice, setNewBasePrice] = useState("1400");
  const [createImageFiles, setCreateImageFiles] = useState<File[]>([]);
  const [createPreviewUrls, setCreatePreviewUrls] = useState<string[]>([]);

  const filteredTailors = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users
      .filter((u) => u.role === "TAILOR")
      .filter((u) => {
        if (!q) return true;
        return (
          u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
      });
  }, [users, userSearch]);

  const filteredClients = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users
      .filter((u) => u.role === "CLIENT")
      .filter((u) => {
        if (!q) return true;
        return (
          u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
      });
  }, [users, userSearch]);

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") return;
    const [a, u, m, o, c] = await Promise.all([
      api<Analytics>("/admin/analytics/overview", { token }),
      api<AdminUser[]>("/admin/users", { token }),
      api<FashionModel[]>("/catalog/models", { token }),
      api<AdminOrderRow[]>("/admin/orders", { token }),
      api<Category[]>("/catalog/categories", { token }),
    ]);
    setData(a);
    setUsers(u);
    setModels(m);
    setOrders(o);
    setCategories(c);
  }, [token, user?.role]);

  useEffect(() => {
    const next: Record<string, { name: string; subtitle: string }> = {};
    for (const m of models) {
      next[m.id] = { name: m.name, subtitle: m.subtitle ?? "" };
    }
    setModelEdits(next);
  }, [models]);

  useEffect(() => {
    if (categories.length === 0) return;
    setNewCategoryId((prev) => prev || categories[0]!.id);
  }, [categories]);

  useEffect(() => {
    const urls = createImageFiles.map((f) => URL.createObjectURL(f));
    setCreatePreviewUrls(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [createImageFiles]);

  useEffect(() => {
    load().catch(() => setMsg(t("admin.loadError")));
  }, [load, t]);

  useEffect(() => {
    const s = searchParams.get("section");
    if (
      s === "overview" ||
      s === "users" ||
      s === "models" ||
      s === "orders" ||
      s === "admins"
    ) {
      setSection(s);
    }
  }, [searchParams]);

  async function toggleUserDisabled(u: AdminUser) {
    if (!token) return;
    setMsg(null);
    try {
      await api(`/admin/users/${u.id}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ disabled: !u.disabled }),
      });
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("admin.toggleFailed"));
    }
  }

  async function deleteUser(u: AdminUser) {
    if (
      !token ||
      !confirm(t("admin.confirmDeleteUser").replace("{email}", u.email))
    )
      return;
    setMsg(null);
    try {
      await api(`/admin/users/${u.id}`, { method: "DELETE", token });
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("admin.deleteUserFailed"));
    }
  }

  async function deleteModel(id: string) {
    if (!token || !confirm(t("admin.confirmDeleteModel"))) return;
    setMsg(null);
    try {
      await api(`/admin/models/${id}`, { method: "DELETE", token });
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("admin.deleteModelFailed"));
    }
  }

  async function saveModelMeta(id: string) {
    if (!token) return;
    const e = modelEdits[id];
    if (!e) return;
    const name = e.name.trim();
    if (!name) return;
    setSavingModelId(id);
    setMsg(null);
    try {
      await api(`/admin/models/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          name,
          subtitle: e.subtitle.trim() || null,
        }),
      });
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("admin.modelUpdateFailed"));
    } finally {
      setSavingModelId(null);
    }
  }

  function onCreateImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length) {
      setCreateImageFiles([]);
      return;
    }
    setCreateImageFiles(Array.from(list));
  }

  async function createModel(ev: React.FormEvent) {
    ev.preventDefault();
    if (!token || !newCategoryId) return;
    if (createImageFiles.length === 0) {
      setMsg(t("admin.modelPhotosRequired"));
      return;
    }
    const price = Number(newBasePrice);
    if (!Number.isFinite(price) || price <= 0) return;
    setCreatingModel(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("categoryId", newCategoryId);
      fd.append("name", newName.trim());
      fd.append("subtitle", newSubtitle.trim());
      fd.append("description", newDescription.trim() || "—");
      fd.append("basePrice", String(price));
      for (const file of createImageFiles) {
        fd.append("images", file);
      }
      await api("/admin/models", {
        method: "POST",
        token,
        body: fd,
      });
      setNewName("");
      setNewSubtitle("");
      setNewDescription("");
      setNewBasePrice("1400");
      setCreateImageFiles([]);
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("admin.modelCreateFailed"));
    } finally {
      setCreatingModel(false);
    }
  }

  async function createAdminAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setMsg(null);
    setCreatingAdmin(true);
    try {
      await api("/admin/create-admin", {
        method: "POST",
        token,
        body: JSON.stringify({
          fullName: newAdminName.trim(),
          email: newAdminEmail.trim(),
          password: newAdminPassword,
        }),
      });
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setMsg(t("admin.adminCreated"));
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("admin.failed"));
    } finally {
      setCreatingAdmin(false);
    }
  }

  async function confirmDeleteOrder() {
    if (!token || !deleteOrderId) return;
    setMsg(null);
    try {
      await api(`/admin/orders/${deleteOrderId}`, { method: "DELETE", token });
      setDeleteOrderId(null);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("admin.deleteOrderFailed"));
    }
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="px-6 py-24 text-center text-sm text-bark/55 dark:text-cream/70">
        {t("admin.unauthorized")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-bark dark:text-cream">
        {t("admin.title")}
      </h1>
      <p className="mt-4 text-sm font-medium text-bark/55 dark:text-cream/80">
        {t("admin.subtitle")}
      </p>
      {msg && (
        <p className="mt-4 text-sm text-red-700 dark:text-red-400">{msg}</p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            "overview",
            "users",
            "models",
            "orders",
            "admins",
          ] as const
        ).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSection(s)}
            className={`rounded-full px-5 py-2 text-xs font-medium uppercase tracking-[0.2em] ${
              section === s
                ? "bg-forest text-cream dark:bg-[#1F3A2E]"
                : "border border-bark/15 text-bark/70 dark:border-white/20 dark:text-cream/75"
            }`}
          >
            {s === "overview" && t("admin.tabOverview")}
            {s === "users" && t("admin.tabUsers")}
            {s === "models" && t("admin.tabModels")}
            {s === "orders" && t("admin.tabOrders")}
            {s === "admins" && t("admin.tabAdmins")}
          </button>
        ))}
      </div>

      {section === "admins" && (
        <div className="mt-10 max-w-md">
          <h2 className="font-display text-xl font-semibold text-bark dark:text-cream">
            {t("admin.newAdminTitle")}
          </h2>
          <p className="mt-2 text-sm text-bark/55 dark:text-cream/75">
            {t("admin.newAdminHint")}
          </p>
          <form onSubmit={createAdminAccount} className="mt-6 space-y-4">
            <label className="block text-sm text-bark/70 dark:text-cream/80">
              {t("admin.fullName")}
              <input
                required
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-sm text-bark outline-none ring-gold/25 focus:ring-2 dark:border-white/15 dark:bg-zinc-900 dark:text-cream"
              />
            </label>
            <label className="block text-sm text-bark/70 dark:text-cream/80">
              {t("admin.email")}
              <input
                required
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-sm text-bark outline-none ring-gold/25 focus:ring-2 dark:border-white/15 dark:bg-zinc-900 dark:text-cream"
              />
            </label>
            <label className="block text-sm text-bark/70 dark:text-cream/80">
              {t("admin.passwordMin8")}
              <input
                required
                type="password"
                minLength={8}
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-sm text-bark outline-none ring-gold/25 focus:ring-2 dark:border-white/15 dark:bg-zinc-900 dark:text-cream"
              />
            </label>
            <button
              type="submit"
              disabled={creatingAdmin}
              className="rounded-full bg-forest px-8 py-3 text-xs uppercase tracking-[0.3em] text-cream disabled:opacity-50"
            >
              {creatingAdmin ? t("admin.creating") : t("admin.createAdmin")}
            </button>
          </form>
        </div>
      )}

      {section === "overview" && data && (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-gold/15 bg-cream/90 p-6 shadow-fabric dark:border-white/10 dark:bg-zinc-900/85">
            <p className="text-[10px] uppercase tracking-[0.35em] text-bark/45 dark:text-cream/55">
              {t("admin.membersActive")}
            </p>
            <p className="mt-4 font-display text-4xl text-bark dark:text-cream">
              {data.userCount}
            </p>
          </div>
          <div className="rounded-3xl border border-gold/15 bg-cream/90 p-6 shadow-fabric dark:border-white/10 dark:bg-zinc-900/85">
            <p className="text-[10px] uppercase tracking-[0.35em] text-bark/45 dark:text-cream/55">
              {t("admin.tailorsMetric")}
            </p>
            <p className="mt-4 font-display text-4xl text-bark dark:text-cream">
              {data.tailorCount}
            </p>
          </div>
          <div className="rounded-3xl border border-gold/15 bg-cream/90 p-6 shadow-fabric dark:border-white/10 dark:bg-zinc-900/85">
            <p className="text-[10px] uppercase tracking-[0.35em] text-bark/45 dark:text-cream/55">
              {t("admin.revenue")}
            </p>
            <p className="mt-4 font-display text-4xl text-bark dark:text-cream">
              {formatPriceWithSymbol(Number(data.revenueTotal ?? 0), t("currency.symbol"))}
            </p>
          </div>
          <div className="md:col-span-3 rounded-3xl border border-gold/15 bg-cream/60 p-6 dark:border-white/10 dark:bg-zinc-900/70">
            <p className="text-xs uppercase tracking-[0.35em] text-bark/45 dark:text-cream/55">
              {t("admin.orderStatuses")}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {data.ordersByStatus.map((o) => (
                <li
                  key={o.status}
                  className="flex justify-between text-bark dark:text-cream"
                >
                  <span>{orderStatusLabel(locale, o.status)}</span>
                  <span>{o._count.id}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {section === "users" && (
        <div className="mt-8 space-y-10">
          <div>
            <label className="block text-xs uppercase tracking-[0.25em] text-bark/45 dark:text-cream/60">
              {t("admin.searchLabel")}
            </label>
            <input
              type="search"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder={t("admin.filterPlaceholder")}
              className="mt-3 w-full max-w-md rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-sm text-bark outline-none ring-gold/25 focus:ring-2 dark:border-white/15 dark:bg-zinc-900 dark:text-cream placeholder:dark:text-cream/40"
            />
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-bark dark:text-cream">
              {t("admin.tailorsSection")}
            </h2>
            <div className="mt-4 space-y-4">
              {filteredTailors.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 rounded-2xl border border-gold/15 bg-cream/90 p-5 dark:border-white/10 dark:bg-zinc-900/85 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-bark dark:text-cream">{u.fullName}</p>
                    <p className="text-sm text-bark/55 dark:text-cream/65">{u.email}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-bark/40 dark:text-cream/50">
                      {adminRoleLabel(locale, u.role)}
                      {u.disabled ? t("admin.disabledSuffix") : ""}
                    </p>
                    {u.tailorProfile?.categories?.length ? (
                      <p className="mt-2 text-xs text-bark/60 dark:text-cream/65">
                        {t("admin.linesPrefix")}{" "}
                        {u.tailorProfile.categories
                          .map((c) => c.category.name)
                          .join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleUserDisabled(u)}
                      className="rounded-full border border-bark/15 px-4 py-2 text-[10px] uppercase tracking-[0.2em] dark:border-white/25 dark:text-cream"
                    >
                      {u.disabled ? t("admin.reactivate") : t("admin.deactivate")}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteUser(u)}
                      className="rounded-full border border-red-800/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-red-900"
                    >
                      {t("admin.delete")}
                    </button>
                  </div>
                </div>
              ))}
              {filteredTailors.length === 0 && (
                <p className="text-sm text-bark/45 dark:text-cream/55">
                  {t("admin.noTailors")}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-bark dark:text-cream">
              {t("admin.clientsSection")}
            </h2>
            <div className="mt-4 space-y-4">
              {filteredClients.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 rounded-2xl border border-gold/15 bg-cream/90 p-5 dark:border-white/10 dark:bg-zinc-900/85 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-bark dark:text-cream">{u.fullName}</p>
                    <p className="text-sm text-bark/55 dark:text-cream/65">{u.email}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-bark/40 dark:text-cream/50">
                      {adminRoleLabel(locale, u.role)}
                      {u.disabled ? t("admin.disabledSuffix") : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleUserDisabled(u)}
                      className="rounded-full border border-bark/15 px-4 py-2 text-[10px] uppercase tracking-[0.2em] dark:border-white/25 dark:text-cream"
                    >
                      {u.disabled ? t("admin.reactivate") : t("admin.deactivate")}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteUser(u)}
                      className="rounded-full border border-red-800/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-red-900"
                    >
                      {t("admin.delete")}
                    </button>
                  </div>
                </div>
              ))}
              {filteredClients.length === 0 && (
                <p className="text-sm text-bark/45 dark:text-cream/55">
                  {t("admin.noClients")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {section === "orders" && (
        <div className="mt-8 space-y-4">
          <p className="text-sm font-medium text-bark/55 dark:text-cream/80">
            {t("admin.ordersHint")}
          </p>
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-col gap-3 rounded-2xl border border-gold/15 bg-cream/90 p-5 dark:border-white/10 dark:bg-zinc-900/85 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-mono text-xs text-bark/50 dark:text-cream/55">
                  {o.id}
                </p>
                <p className="mt-1 text-sm text-bark dark:text-cream">
                  {o.client?.fullName ?? "—"}{" "}
                  <span className="text-bark/50 dark:text-cream/55">
                    {o.client?.email ? `· ${o.client.email}` : ""}
                  </span>
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-bark/40 dark:text-cream/50">
                  {orderStatusLabel(locale, o.status)}
                  {o.category?.name ? (
                    <span className="ml-2">· {o.category.name}</span>
                  ) : null}
                </p>
                <p className="mt-2 font-display text-xl text-bark dark:text-cream">
                  {formatPriceWithSymbol(o.subtotal, t("currency.symbol"))}
                </p>
                <p className="mt-1 text-xs text-bark/45 dark:text-cream/60">
                  {formatDateTime(o.createdAt)}
                </p>
              </div>
              {o.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => setDeleteOrderId(o.id)}
                  className="rounded-full border border-red-800/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-red-900"
                >
                  {t("admin.delete")}
                </button>
              )}
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-sm text-bark/50 dark:text-cream/65">
              {t("admin.noOrders")}
            </p>
          )}
        </div>
      )}

      {section === "models" && (
        <div className="mt-8 space-y-8">
          <form
            onSubmit={createModel}
            className="rounded-3xl border border-gold/20 bg-cream/80 p-6 dark:border-white/15 dark:bg-zinc-900/80"
          >
            <h2 className="font-display text-xl font-semibold text-bark dark:text-cream">
              {t("admin.modelAddSection")}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-bark/70 dark:text-cream/80">
                {t("admin.modelCategory")}
                <select
                  required
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-sm text-bark outline-none ring-gold/25 focus:ring-2 dark:border-white/15 dark:bg-zinc-950 dark:text-cream"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-bark/70 dark:text-cream/80">
                {t("admin.modelBasePriceLabel")}
                <input
                  required
                  type="number"
                  min={1}
                  step={1}
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-sm text-bark outline-none ring-gold/25 focus:ring-2 dark:border-white/15 dark:bg-zinc-950 dark:text-cream"
                />
              </label>
              <label className="md:col-span-2 block text-sm text-bark/70 dark:text-cream/80">
                {t("admin.modelNameLabel")}
                <span className="ml-2 text-xs font-normal text-bark/45 dark:text-cream/50">
                  ({t("admin.modelNameHint")})
                </span>
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-sm text-bark outline-none ring-gold/25 focus:ring-2 dark:border-white/15 dark:bg-zinc-950 dark:text-cream"
                />
              </label>
              <label className="md:col-span-2 block text-sm text-bark/70 dark:text-cream/80">
                {t("admin.modelSignatureLabel")}
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-sm text-bark outline-none ring-gold/25 focus:ring-2 dark:border-white/15 dark:bg-zinc-950 dark:text-cream"
                />
              </label>
              <label className="md:col-span-2 block text-sm text-bark/70 dark:text-cream/80">
                {t("admin.modelDescriptionLabel")}
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2.5 text-sm text-bark outline-none ring-gold/25 focus:ring-2 dark:border-white/15 dark:bg-zinc-950 dark:text-cream"
                />
              </label>
              <div className="md:col-span-2">
                <p className="text-sm text-bark/70 dark:text-cream/80">
                  {t("admin.modelPhotosLabel")}
                </p>
                <p className="mt-1 text-xs text-bark/45 dark:text-cream/50">
                  {t("admin.modelPhotosHint")}
                </p>
                <label className="mt-3 flex cursor-pointer flex-col gap-2 rounded-xl border border-black/10 bg-white/90 px-4 py-4 text-sm text-bark ring-gold/25 transition hover:border-gold/30 focus-within:ring-2 dark:border-white/15 dark:bg-zinc-950 dark:text-cream">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onCreateImagesChange}
                    className="text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-forest/90 file:px-3 file:py-2 file:text-[10px] file:uppercase file:tracking-[0.15em] file:text-cream dark:file:bg-[#1F3A2E]"
                  />
                </label>
                {createPreviewUrls.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {createPreviewUrls.map((src, i) => (
                      <div
                        key={`${src}-${i}`}
                        className="relative h-36 w-28 overflow-hidden rounded-xl border border-forest/25 bg-cream dark:border-white/15 dark:bg-zinc-900"
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="112px"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={
                creatingModel ||
                !newName.trim() ||
                categories.length === 0 ||
                !newCategoryId ||
                createImageFiles.length === 0
              }
              className="mt-6 rounded-full bg-forest px-8 py-3 text-xs uppercase tracking-[0.3em] text-cream disabled:opacity-50 dark:bg-[#1F3A2E]"
            >
              {creatingModel ? t("admin.modelCreating") : t("admin.modelCreate")}
            </button>
          </form>

          <div className="space-y-4">
            {models.map((m) => {
              const edit = modelEdits[m.id] ?? {
                name: m.name,
                subtitle: m.subtitle ?? "",
              };
              return (
                <div
                  key={m.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gold/15 bg-cream/90 p-5 dark:border-white/10 dark:bg-zinc-900/85"
                >
                  <p className="text-xs text-bark/50 dark:text-cream/55">
                    {m.category?.name}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-bark/55 dark:text-cream/60">
                      {t("admin.modelNameLabel")}
                      <input
                        type="text"
                        value={edit.name}
                        onChange={(e) =>
                          setModelEdits((prev) => {
                            const cur = prev[m.id] ?? {
                              name: m.name,
                              subtitle: m.subtitle ?? "",
                            };
                            return {
                              ...prev,
                              [m.id]: { ...cur, name: e.target.value },
                            };
                          })
                        }
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm text-bark dark:border-white/15 dark:bg-zinc-950 dark:text-cream"
                      />
                    </label>
                    <label className="block text-xs uppercase tracking-[0.2em] text-bark/55 dark:text-cream/60">
                      {t("admin.modelSignatureLabel")}
                      <input
                        type="text"
                        value={edit.subtitle}
                        onChange={(e) =>
                          setModelEdits((prev) => {
                            const cur = prev[m.id] ?? {
                              name: m.name,
                              subtitle: m.subtitle ?? "",
                            };
                            return {
                              ...prev,
                              [m.id]: { ...cur, subtitle: e.target.value },
                            };
                          })
                        }
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm text-bark dark:border-white/15 dark:bg-zinc-950 dark:text-cream"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void saveModelMeta(m.id)}
                      disabled={savingModelId === m.id || !edit.name.trim()}
                      className="rounded-full border border-forest/40 bg-forest/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-bark transition hover:bg-forest/20 disabled:opacity-50 dark:border-gold/40 dark:bg-gold/10 dark:text-cream dark:hover:bg-gold/20"
                    >
                      {savingModelId === m.id
                        ? t("admin.modelSaving")
                        : t("admin.modelSaveMeta")}
                    </button>
                    <Link
                      href={`/admin/models/${m.id}/edit`}
                      className="rounded-full border border-bark/15 bg-cream px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-bark transition hover:border-gold/40 dark:border-white/20 dark:bg-zinc-800 dark:text-cream dark:hover:border-gold/50"
                    >
                      {t("admin.editImages")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteModel(m.id)}
                      className="rounded-full border border-red-800/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-red-900 dark:text-red-400"
                    >
                      {t("admin.delete")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {deleteOrderId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bark/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-order-confirm-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-gold/20 bg-cream p-6 shadow-fabric dark:border-white/15 dark:bg-zinc-900">
            <h2
              id="delete-order-confirm-title"
              className="font-display text-xl text-bark dark:text-cream"
            >
              {t("admin.deleteOrderTitle")}
            </h2>
            <p className="mt-4 text-sm text-bark/65 dark:text-cream/75">
              {t("admin.deleteOrderBody")}
            </p>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteOrderId(null)}
                className="rounded-full border border-bark/15 px-6 py-2 text-xs uppercase tracking-[0.2em] text-bark dark:border-white/25 dark:text-cream"
              >
                {t("admin.cancel")}
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteOrder()}
                className="rounded-full bg-red-900 px-6 py-2 text-xs uppercase tracking-[0.2em] text-cream"
              >
                {t("admin.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-bark/60 dark:text-cream/60">
          Chargement…
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
