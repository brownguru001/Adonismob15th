import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Bootstraps a single admin account so a freshly created database (local
 * dev, or a new environment) has a way in. Deliberately creates nothing
 * else — no demo members, products, designs, collections, orders, or
 * messages. This is a real, live platform now; all catalog and order data
 * comes from the admin dashboard, not from seeding.
 */
async function main() {
  console.log("Bootstrapping admin account...");

  const email = process.env.SEED_ADMIN_EMAIL || "admin@adonismob15th.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Done.");
  console.log(`Admin login: ${email} / ${password}`);
  console.log("Change this password immediately via /admin/settings.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
