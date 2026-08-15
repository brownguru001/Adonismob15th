import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const IMG = {
  hero1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80",
  hero2: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80",
  hoodie1: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80",
  hoodie2: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80",
  tee1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80",
  tee2: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80",
  cap1: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1200&q=80",
  jacket1: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80",
  members1: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
  collectionCover1: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&q=80",
  collectionCover2: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
  collectionCover3: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=1200&q=80",
};

async function main() {
  console.log("Seeding ADONISMOB15TH demo data...");

  // ---- Admin ----
  const adminPasswordHash = await bcrypt.hash("Adonis15th!Admin", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@adonismob15th.com" },
    update: {},
    create: {
      email: "admin@adonismob15th.com",
      name: "ADONISMOB15TH Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // ---- Demo customers ----
  const customerPasswordHash = await bcrypt.hash("Demo1234!", 12);

  const customer1 = await prisma.user.upsert({
    where: { email: "amara@example.com" },
    update: {},
    create: {
      name: "Amara Okafor",
      email: "amara@example.com",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      phone: "+2348012345001",
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "tunde@example.com" },
    update: {},
    create: {
      name: "Tunde Bakare",
      email: "tunde@example.com",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      phone: "+2348012345002",
    },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: "zainab@example.com" },
    update: {},
    create: {
      name: "Zainab Yusuf",
      email: "zainab@example.com",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      phone: "+2348012345003",
    },
  });

  // ---- Memberships ----
  await prisma.membership.upsert({
    where: { userId: customer1.id },
    update: {},
    create: {
      userId: customer1.id,
      status: "VERIFIED",
      verifiedAt: new Date(),
      verifiedById: admin.id,
      note: "Early supporter, referred by founder.",
    },
  });

  await prisma.membership.upsert({
    where: { userId: customer2.id },
    update: {},
    create: {
      userId: customer2.id,
      status: "PENDING",
      note: "Applied via website, active on socials.",
    },
  });

  // ---- Collections ----
  const heritageDrop = await prisma.collection.upsert({
    where: { slug: "heritage-drop" },
    update: {},
    create: {
      name: "Heritage Drop",
      slug: "heritage-drop",
      description: "Our founding collection — bold graphics rooted in African identity.",
      coverImage: IMG.collectionCover1,
      visibility: "PUBLIC",
      featured: true,
    },
  });

  const everyday = await prisma.collection.upsert({
    where: { slug: "everyday-essentials" },
    update: {},
    create: {
      name: "Everyday Essentials",
      slug: "everyday-essentials",
      description: "Clean, wearable staples for daily rotation.",
      coverImage: IMG.collectionCover3,
      visibility: "PUBLIC",
      featured: false,
    },
  });

  const foundersCircle = await prisma.collection.upsert({
    where: { slug: "founders-circle" },
    update: {},
    create: {
      name: "Founders Circle",
      slug: "founders-circle",
      description: "Reserved for verified members — designs that never reach the public shop.",
      coverImage: IMG.collectionCover2,
      visibility: "MEMBERS_ONLY",
      featured: true,
    },
  });

  // ---- Designs ----
  const design1 = await prisma.design.create({
    data: {
      title: "Adinkra Grid",
      description: "A modern grid layout referencing traditional Adinkra symbols.",
      imageUrl: IMG.hoodie1,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      collectionId: heritageDrop.id,
    },
  });

  const design2 = await prisma.design.create({
    data: {
      title: "Lagos Skyline Print",
      description: "Minimal skyline linework across the chest.",
      imageUrl: IMG.tee2,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      collectionId: everyday.id,
    },
  });

  const design3 = await prisma.design.create({
    data: {
      title: "Founders Emblem",
      description: "The members-only emblem, embroidered.",
      imageUrl: IMG.members1,
      status: "PUBLISHED",
      visibility: "MEMBERS_ONLY",
      collectionId: foundersCircle.id,
    },
  });

  // ---- Products ----
  async function upsertProduct(data: {
    slug: string;
    name: string;
    description: string;
    category: string;
    price: number;
    cost: number;
    images: string[];
    careInfo: string;
    visibility: "PUBLIC" | "MEMBERS_ONLY";
    featured: boolean;
    collectionId: string;
    designId: string;
    variants: { size: string; color: string; stock: number }[];
  }) {
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        cost: data.cost,
        images: data.images,
        careInfo: data.careInfo,
        visibility: data.visibility,
        featured: data.featured,
        collectionId: data.collectionId,
        designId: data.designId,
        variants: {
          create: data.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: `${data.slug}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, "-"),
          })),
        },
      },
      include: { variants: true },
    });
    return product;
  }

  const hoodie = await upsertProduct({
    slug: "adinkra-grid-hoodie",
    name: "Adinkra Grid Hoodie",
    description:
      "Heavyweight fleece hoodie featuring the Adinkra Grid print across the back. Boxy fit, ribbed cuffs.",
    category: "hoodie",
    price: 32000,
    cost: 14000,
    images: [IMG.hoodie1, IMG.hoodie2],
    careInfo: "Machine wash cold, inside out. Do not tumble dry.",
    visibility: "PUBLIC",
    featured: true,
    collectionId: heritageDrop.id,
    designId: design1.id,
    variants: [
      { size: "M", color: "Black", stock: 12 },
      { size: "L", color: "Black", stock: 9 },
      { size: "XL", color: "Black", stock: 5 },
      { size: "M", color: "Sand", stock: 8 },
    ],
  });

  const tee = await upsertProduct({
    slug: "lagos-skyline-tee",
    name: "Lagos Skyline Tee",
    description: "100% cotton tee with minimal skyline linework across the chest.",
    category: "tshirt",
    price: 14000,
    cost: 5200,
    images: [IMG.tee1, IMG.tee2],
    careInfo: "Machine wash cold. Hang dry recommended.",
    visibility: "PUBLIC",
    featured: true,
    collectionId: everyday.id,
    designId: design2.id,
    variants: [
      { size: "S", color: "White", stock: 15 },
      { size: "M", color: "White", stock: 20 },
      { size: "L", color: "White", stock: 14 },
      { size: "M", color: "Black", stock: 3 },
    ],
  });

  const cap = await upsertProduct({
    slug: "heritage-cap",
    name: "Heritage Cap",
    description: "Structured 6-panel cap with embroidered wordmark.",
    category: "cap",
    price: 9500,
    cost: 3200,
    images: [IMG.cap1],
    careInfo: "Spot clean only.",
    visibility: "PUBLIC",
    featured: false,
    collectionId: heritageDrop.id,
    designId: design1.id,
    variants: [{ size: "One Size", color: "Black", stock: 25 }],
  });

  await upsertProduct({
    slug: "everyday-utility-jacket",
    name: "Everyday Utility Jacket",
    description: "Lightweight cotton utility jacket built for layering.",
    category: "jacket",
    price: 42000,
    cost: 19000,
    images: [IMG.jacket1],
    careInfo: "Machine wash cold. Do not bleach.",
    visibility: "PUBLIC",
    featured: false,
    collectionId: everyday.id,
    designId: design2.id,
    variants: [
      { size: "M", color: "Olive", stock: 2 },
      { size: "L", color: "Olive", stock: 4 },
    ],
  });

  await upsertProduct({
    slug: "founders-emblem-hoodie",
    name: "Founders Emblem Hoodie",
    description:
      "Members-only hoodie with the embroidered Founders emblem. Never sold in the public shop.",
    category: "hoodie",
    price: 45000,
    cost: 18000,
    images: [IMG.members1, IMG.hoodie2],
    careInfo: "Machine wash cold, inside out.",
    visibility: "MEMBERS_ONLY",
    featured: true,
    collectionId: foundersCircle.id,
    designId: design3.id,
    variants: [
      { size: "M", color: "Black", stock: 6 },
      { size: "L", color: "Black", stock: 6 },
    ],
  });

  // ---- Supplier ----
  const supplier = await prisma.supplier.upsert({
    where: { id: "seed-supplier-1" },
    update: {},
    create: {
      id: "seed-supplier-1",
      name: "Lagos Print Collective",
      contactName: "Chidi Eze",
      contactEmail: "orders@lagosprintcollective.com",
      contactPhone: "+2348099998888",
      location: "Ikeja, Lagos",
      services: "Screen printing, DTF printing, embroidery",
      pricingNotes: "Bulk rate below ₦8,000/unit at 50+ quantity.",
      capabilities: "Up to 500 units / week turnaround",
      status: "ACTIVE",
      internalNotes: "Reliable 5-7 day turnaround. Primary partner while we scale toward in-house production.",
    },
  });

  // ---- Demo orders ----
  const order1Address = await prisma.address.create({
    data: {
      userId: customer1.id,
      fullName: customer1.name,
      phone: "+2348012345001",
      line1: "12 Admiralty Way",
      city: "Lekki",
      state: "Lagos",
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: "AM15-DEMO-0001",
      userId: customer1.id,
      addressId: order1Address.id,
      status: "DELIVERED",
      subtotal: 32000,
      shippingFee: 2500,
      total: 34500,
      customerEmail: customer1.email,
      customerPhone: customer1.phone ?? "+2348012345001",
      items: {
        create: [
          {
            productId: hoodie.id,
            variantId: hoodie.variants[0].id,
            quantity: 1,
            unitPrice: 32000,
            lineTotal: 32000,
          },
        ],
      },
      statusEvents: {
        create: [
          { status: "PENDING_PAYMENT", note: "Order created, awaiting payment." },
          { status: "PAID", note: "Payment verified via Flutterwave." },
          { status: "PRODUCTION", note: "Sent to Lagos Print Collective." },
          { status: "SHIPPED", note: "Handed to courier." },
          { status: "DELIVERED", note: "Delivered to customer." },
        ],
      },
      payments: {
        create: [
          {
            txRef: "AM15-TX-DEMO-0001",
            amount: 34500,
            status: "SUCCESSFUL",
            providerRef: "demo-flw-ref-0001",
            verifiedAt: new Date(),
          },
        ],
      },
      productionOrder: {
        create: { supplierId: supplier.id, stage: "DELIVERED" },
      },
    },
  });

  const order2Address = await prisma.address.create({
    data: {
      userId: customer3.id,
      fullName: customer3.name,
      phone: "+2348012345003",
      line1: "5 Awolowo Road",
      city: "Ikoyi",
      state: "Lagos",
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: "AM15-DEMO-0002",
      userId: customer3.id,
      addressId: order2Address.id,
      status: "PRODUCTION",
      subtotal: 14000,
      shippingFee: 2500,
      total: 16500,
      customerEmail: customer3.email,
      customerPhone: customer3.phone ?? "+2348012345003",
      items: {
        create: [
          {
            productId: tee.id,
            variantId: tee.variants[1].id,
            quantity: 1,
            unitPrice: 14000,
            lineTotal: 14000,
          },
        ],
      },
      statusEvents: {
        create: [
          { status: "PENDING_PAYMENT", note: "Order created, awaiting payment." },
          { status: "PAID", note: "Payment verified via Flutterwave." },
          { status: "PRODUCTION", note: "In production." },
        ],
      },
      payments: {
        create: [
          {
            txRef: "AM15-TX-DEMO-0002",
            amount: 16500,
            status: "SUCCESSFUL",
            providerRef: "demo-flw-ref-0002",
            verifiedAt: new Date(),
          },
        ],
      },
      productionOrder: {
        create: { supplierId: supplier.id, stage: "PRINTING" },
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: "AM15-DEMO-0003",
      userId: customer1.id,
      status: "PENDING_PAYMENT",
      subtotal: 9500,
      shippingFee: 2500,
      total: 12000,
      customerEmail: customer1.email,
      customerPhone: customer1.phone ?? "+2348012345001",
      items: {
        create: [
          {
            productId: cap.id,
            variantId: cap.variants[0].id,
            quantity: 1,
            unitPrice: 9500,
            lineTotal: 9500,
          },
        ],
      },
      statusEvents: {
        create: [{ status: "PENDING_PAYMENT", note: "Order created, awaiting payment." }],
      },
      payments: {
        create: [{ txRef: "AM15-TX-DEMO-0003", amount: 12000, status: "PENDING" }],
      },
    },
  });

  // ---- Custom orders ----
  await prisma.customOrder.create({
    data: {
      userId: customer2.id,
      productType: "Hoodie",
      quantity: 20,
      sizes: "5x S, 10x M, 5x L",
      designNotes: "Team hoodie for our run club — logo on chest, club name on back in gold.",
      colorPreference: "Black with gold print",
      status: "QUOTE_SENT",
      quotedPrice: 520000,
      adminNotes: "Bulk order, confirmed capacity with Lagos Print Collective.",
      statusEvents: {
        create: [
          { status: "SUBMITTED", note: "Request submitted by customer." },
          { status: "REVIEWING", note: "Reviewed design and quantity." },
          { status: "QUOTE_SENT", note: "Quoted at 520000" },
        ],
      },
    },
  });

  await prisma.customOrder.create({
    data: {
      userId: customer3.id,
      productType: "T-shirt",
      quantity: 3,
      sizes: "3x M",
      designNotes: "Custom text on back: 'ZARA'S 30TH'. Front: small logo.",
      status: "SUBMITTED",
      statusEvents: { create: [{ status: "SUBMITTED", note: "Request submitted by customer." }] },
    },
  });

  // ---- Contact messages ----
  await prisma.contactMessage.createMany({
    data: [
      {
        name: "Chinedu Obi",
        email: "chinedu.obi@example.com",
        subject: "Wholesale inquiry",
        message: "Do you offer wholesale pricing for boutiques? Interested in stocking the Heritage Drop.",
      },
      {
        name: "Fatima Bello",
        email: "fatima.bello@example.com",
        subject: "Sizing question",
        message: "Does the Adinkra Grid Hoodie run true to size or oversized?",
        isRead: true,
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@adonismob15th.com / Adonis15th!Admin");
  console.log("Customer login (verified member): amara@example.com / Demo1234!");
  console.log("Customer login (pending member): tunde@example.com / Demo1234!");
  console.log("Customer login (no membership): zainab@example.com / Demo1234!");
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
