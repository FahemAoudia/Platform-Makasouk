import {
  PrismaClient,
  Role,
  OrderStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash("AtelierDemo!1", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@atelier.demo" },
    update: {},
    create: {
      email: "admin@atelier.demo",
      passwordHash: pass,
      fullName: "Maison Admin",
      role: Role.ADMIN,
    },
  });

  const cats = await Promise.all(
    [
      {
        slug: "traditional",
        name: "Traditionnel",
        description:
          "Silhouettes d’héritage et savoir-faire de cérémonie.",
      },
      {
        slug: "haute-couture-evening",
        name: "Haute couture / Soirée",
        description:
          "Tenues de soirée sculpturales, présence tapis rouge et matières nobles.",
      },
      {
        slug: "classic",
        name: "Classique",
        description:
          "Coupe intemporelle, lignes sobres et raffinement discret.",
      },
      {
        slug: "modern",
        name: "Moderne",
        description:
          "Lignes architecturées et aisance contemporaine.",
      },
      {
        slug: "casual",
        name: "Décontracté",
        description:
          "Pièces du quotidien sublimées par un tombé sur-mesure.",
      },
    ].map((c, i) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {
          name: c.name,
          description: c.description,
        },
        create: {
          ...c,
          sortOrder: i,
          heroImage:
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
        },
      })
    )
  );

  const fields = [
    {
      key: "chest",
      label: "Poitrine",
      sortOrder: 1,
      guideImageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    },
    {
      key: "waist",
      label: "Taille",
      sortOrder: 2,
      guideImageUrl:
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    },
    {
      key: "shoulders",
      label: "Épaules",
      sortOrder: 3,
      guideImageUrl:
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    },
    {
      key: "sleeve",
      label: "Longueur de manche",
      sortOrder: 4,
      guideImageUrl:
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
    },
    {
      key: "inseam",
      label: "Entrejambe",
      sortOrder: 5,
      guideImageUrl:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    },
    {
      key: "neck",
      label: "Tour de cou",
      sortOrder: 6,
      guideImageUrl:
        "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80",
    },
  ];

  for (const f of fields) {
    await prisma.measurementField.upsert({
      where: { key: f.key },
      update: {
        label: f.label,
        sortOrder: f.sortOrder,
        guideImageUrl: f.guideImageUrl,
      },
      create: f,
    });
  }

  const img = (id: string) =>
    `https://images.unsplash.com/photo-${id}?w=1200&q=85`;

  const modelCount = await prisma.fashionModel.count();
  if (modelCount === 0) {
    for (const cat of cats) {
      await prisma.fashionModel.createMany({
        data: [
          {
            categoryId: cat.id,
            name: `${cat.name} — Signature I`,
            subtitle: "Limited atelier drop",
            description:
              "Hand-finished structure with silk lining and floating canvas.",
            images: [
              img("1539008835657-9e8b0f4de73c"),
              img("1515886657613-9f3515b0c78f"),
            ] as unknown as object,
            basePrice: cat.slug.includes("haute") ? 4200 : 1800,
            tags: ["structured", "evening", "silk"],
          },
          {
            categoryId: cat.id,
            name: `${cat.name} — Signature II`,
            subtitle: "Soft drape",
            description:
              "Bias-cut panels for movement; tonal topstitching throughout.",
            images: [
              img("1469334031218-e382a71b716b"),
              img("1525507118955-7fb6377e5183"),
            ] as unknown as object,
            basePrice: cat.slug.includes("haute") ? 3800 : 1400,
            tags: ["fluid", "minimal"],
          },
        ],
      });
    }
  }

  const tailorUser = await prisma.user.upsert({
    where: { email: "tailor@atelier.demo" },
    update: {},
    create: {
      email: "tailor@atelier.demo",
      passwordHash: pass,
      fullName: "Master Tailor",
      role: Role.TAILOR,
    },
  });

  const tailorProfile = await prisma.tailorProfile.upsert({
    where: { userId: tailorUser.id },
    update: {
      bio: "Specialist in traditional tailoring.",
      active: true,
    },
    create: {
      userId: tailorUser.id,
      bio: "Specialist in traditional tailoring.",
      active: true,
    },
  });

  const linkCount = await prisma.tailorCategory.count({
    where: { tailorProfileId: tailorProfile.id },
  });
  if (linkCount === 0) {
    await prisma.tailorCategory.createMany({
      data: [
        { tailorProfileId: tailorProfile.id, categoryId: cats[0].id },
        { tailorProfileId: tailorProfile.id, categoryId: cats[1].id },
      ],
    });
  }

  const client = await prisma.user.upsert({
    where: { email: "client@atelier.demo" },
    update: {},
    create: {
      email: "client@atelier.demo",
      passwordHash: pass,
      fullName: "Élodie Laurent",
      role: Role.CLIENT,
    },
  });

  await prisma.userPreference.upsert({
    where: { userId: client.id },
    update: {},
    create: {
      userId: client.id,
      categoryWeights: { traditional: 0.6, modern: 0.4 },
      tagAffinity: ["structured", "minimal"],
    },
  });

  const model = await prisma.fashionModel.findFirst({
    where: { categoryId: cats[0].id },
  });

  const orderCount = await prisma.order.count();
  if (model && orderCount === 0) {
    await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: cats[0].id,
        status: OrderStatus.IN_PROGRESS,
        tailorId: tailorProfile.id,
        subtotal: model.basePrice,
        items: {
          create: [
            {
              modelId: model.id,
              measurements: { chest: 98, waist: 82, shoulders: 46 },
              unitPrice: model.basePrice,
              quantity: 1,
            },
          ],
        },
      },
    });
  }

  console.log("Seed OK — demo users:");
  console.log("  admin@atelier.demo / AtelierDemo!1");
  console.log("  tailor@atelier.demo / AtelierDemo!1");
  console.log("  client@atelier.demo / AtelierDemo!1");
  console.log("Admin id:", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
