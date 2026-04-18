# Makasouk — Atelier (sur-mesure)

Plateforme **mobile-first** de couture sur-mesure : parcourir les lignes, **mesures guidées**, panier, commandes diffusées aux tailleurs par catégorie, suivi en temps réel (WebSockets).

**Auteur :** Aoudia Fahem  
**Licence :** voir [`LICENSE`](./LICENSE) (MIT).

En arabe, le nom affiché côté interface est **« منصة مقاسك »** (votre mesure / votre coupe) — et non « مكاسوك », qui prête à confusion avec une translittération de *Makasouk*. Le logo latin **MAKASOUK** reste la marque courte en caractères latins.

---

## Fonctionnalités (évolutions récentes)

- **Marque & UI** — identité **MAKASOUK** / « منصة مقاسك », hero et sections (lookbook, collections, footer type « musée »), palette forêt / or / crème.
- **Internationalisation** — **français** et **arabe** (`I18nProvider`, `messages.ts`), bascule dans la barre d’outils, `dir` / `lang` sur `<html>`.
- **Mode sombre** — `next-themes`, styles `dark:` sur les parcours principaux (accueil, mesure, panier, commandes, auth, admin, tailleur, etc.).
- **Mesures guidées** — page `/measure/[modelId]` : libellés de points de mesure via **clés stables** + traduction (`measurementKeyLabel`), pas seulement le libellé API.
- **Catalogue / seed** — libellés de mesures et catégories en **français** dans `prisma/seed.ts` (relancer `npm run db:seed` pour mettre à jour une base existante).
- **Administration** — interface **entièrement traduite** (FR/AR) : vue d’ensemble, utilisateurs, commandes, création d’admin.
- **Modèles (FashionModel)** — dans **Admin → Modèles** :
  - **création** avec formulaire (ligne, nom, signature/sous-titre, description, prix) ;
  - **photos** depuis l’appareil ou la galerie (**multipart**), comme sur la page d’édition des images ;
  - **modification** du nom et de la signature sur place ;
  - suppression ; lien vers l’édition des images.
- **API** — `POST /api/admin/models` accepte le **JSON** (URLs d’images) ou le **`multipart/form-data`** (champs texte + fichiers `images`), aligné sur le flux d’upload existant.

---

## Structure du monorepo

| Chemin | Rôle |
|--------|------|
| `apps/web` | Next.js 15 (App Router), Tailwind, Framer Motion, `next-themes` |
| `apps/api` | Express, Socket.io, JWT, Prisma, upload `multipart` (multer) |
| `prisma/schema.prisma` | Schéma **SQLite** (démo) — adapter `DATABASE_URL` pour la prod |

---

## Démarrage rapide

1. Copier `.env.example` vers `.env` et renseigner `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL` (URL du front vers l’API).
2. Installer et initialiser la base :

```bash
npm install
npm run db:push
npm run db:seed
```

3. Lancer le web et l’API :

```bash
npm run dev
```

- Front : [http://localhost:3000](http://localhost:3000)  
- API : [http://localhost:4000/api](http://localhost:4000/api) — santé : `GET /health`

### Comptes de démo (seed)

| Rôle | E-mail | Mot de passe |
|------|--------|----------------|
| Admin | admin@atelier.demo | AtelierDemo!1 |
| Tailleur | tailor@atelier.demo | AtelierDemo!1 |
| Client | client@atelier.demo | AtelierDemo!1 |

---

## Schéma de données (résumé)

- **User** — `CLIENT` \| `TAILOR` \| `ADMIN` ; `disabled` optionnel  
- **TailorProfile** — liaison **many-to-many** avec **Category**  
- **Category** — lignes de collection (`slug`, nom, description, `heroImage`)  
- **FashionModel** — rattaché à une catégorie ; `images` JSON ; `subtitle` (ex. ligne « Signature »)  
- **MeasurementField** — guides globaux (images / vidéos optionnelles)  
- **Cart / CartItem**, **Order / OrderItem** — mesures en JSON  
- **Favorite**, **TailorReview**, **UserPreference**, **AdminAuditLog**

---

## API REST (aperçu)

Base : `/api` — authentification **Bearer JWT** selon les routes.

Principaux domaines : `/auth/*`, `/catalog/*`, `/cart/*`, `/orders/*`, `/tailor/*`, `/admin/*`, `/favorites/*`, `/recommendations/*`.

**Admin — modèles**

| Méthode | Chemin | Notes |
|---------|--------|--------|
| POST | `/admin/models` | JSON **ou** `multipart/form-data` (`images` = fichiers) |
| PATCH | `/admin/models/:id` | JSON **ou** `multipart` pour remplacer / ajouter des images |
| DELETE | `/admin/models/:id` | Suppression du modèle |

Détail des autres routes : voir les fichiers dans `apps/api/src/routes/`.

---

## WebSocket (Socket.io)

Événements typiques : `tailor:join` / `tailor:leave`, `order:new`, `order:taken`, `order:status`, `client:subscribe-order`, etc. — authentification par token JWT.

---

## Notes UI

- Typo : Cormorant Garamond (titres) + Inter (UI) ; option **Noto Sans Arabic** pour l’arabe.  
- Thème clair / sombre cohérent avec la charte forêt / or / crème.

---

## Production (rappels)

- `JWT_SECRET` fort, HTTPS, politique de cookies si vous sortez le JWT du `localStorage`.  
- Adapter Socket.io (ex. Redis) pour la montée en charge.  
- Stockage objet (S3, etc.) pour les fichiers uploadés en production.  
- Paiement : brancher un provider réel si vous activez la facturation.

---

## Licence & crédits

Ce projet est publié sous **licence MIT** — voir [`LICENSE`](./LICENSE).

**© Aoudia Fahem** — Makasouk (plateforme de démonstration). En arabe : **منصة مقاسك**.
