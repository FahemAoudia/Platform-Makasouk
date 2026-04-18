/**
 * Lists tailor profiles with no category links (run: npx tsx prisma/debug-tailors.ts)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.tailorProfile.findMany({
    include: {
      categories: true,
      user: { select: { email: true, fullName: true } },
    },
  });

  const empty = profiles.filter((p) => p.categories.length === 0);
  console.log("Tailor profiles total:", profiles.length);
  console.log("With ZERO categories:", empty.length);
  for (const p of empty) {
    console.log("  —", p.id, p.user.email, p.user.fullName);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
