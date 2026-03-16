const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('Start seeding full dataset...');

  // Define categories (up to 20 for the shop grid)
  const categories = [
    'Vitamins',
    'First Aid',
    'Skincare',
    'Diabetes',
    'Pain Relief',
    'Maternal',
    'Cold & Flu',
    'Digestive',
    'Allergy',
    'Oral Care',
    'Children',
    'Supplements'
  ];

  // Create 20 products per category (realistic test data)
  for (const cat of categories) {
    for (let i = 1; i <= 20; i++) {
      const name = `${cat} Product ${i}`;
      const price = randInt(40, 400) + (Math.random() < 0.5 ? 0.0 : 0.5);
      await prisma.product.create({
        data: {
          name,
          description: `Beschrijving voor ${name}. Geschikt voor ${cat.toLowerCase()}.`,
          price: price,
          category: cat,
          subCategory: ['Morning Essentials','On-the-go','Night Care','Travel Kit','Office Care','Sports'][i % 6],
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/300/200`
        }
      });
    }
  }

  // Create pharmacies in Paramaribo, Wanica, Nickerie
  const pharmaciesData = [
    {
      name: 'Central Pharmacy',
      address: 'Waterkant 1, Paramaribo',
      lat: 5.825,
      lng: -55.167,
      email: 'central@healtease.test',
      password: 'pharmacy123'
    },
    {
      name: 'Wanica Health',
      address: 'Hoofdstraat 5, Lelydorp',
      lat: 5.713,
      lng: -55.204,
      email: 'wanica@healtease.test',
      password: 'pharmacy123'
    },
    {
      name: 'Nickerie Pharmacy',
      address: 'Keizerstraat 12, Nieuw Nickerie',
      lat: 5.966,
      lng: -57.040,
      email: 'nickerie@healtease.test',
      password: 'pharmacy123'
    }
  ];

  const createdPharmacies = [];
  for (const p of pharmaciesData) {
    const created = await prisma.pharmacy.upsert({
      where: { email: p.email },
      update: {},
      create: p
    });
    createdPharmacies.push(created);
  }

  // Create stocks: each pharmacy gets inventory for each product
  const allProducts = await prisma.product.findMany();
  for (const product of allProducts) {
    for (const ph of createdPharmacies) {
      const qty = randInt(10, 60);
      await prisma.stock.create({
        data: {
          pharmacyId: ph.id,
          productId: product.id,
          quantity: qty
        }
      });
    }
  }

  // Admin + pharmacy users
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@healtease.test',
        password: 'admin123',
        name: 'HealthEase Admin',
        role: 'ADMIN'
      },
      {
        email: 'central@healtease.test',
        password: 'pharmacy123',
        name: 'Central Pharmacy User',
        role: 'PHARMACY'
      }
    ],
    skipDuplicates: true
  });
  
  // Add a default regular user for testing
  await prisma.user.createMany({
    data: [
      {
        email: 'user@healtease.test',
        password: 'user123',
        name: 'Test User',
        role: 'CUSTOMER'
      }
    ],
    skipDuplicates: true
  });

  // A few sample reviews
  await prisma.review.createMany({
    data: [
      { author: 'Sophie V.', comment: 'Super snelle levering van mijn medicijnen!', rating: 5 },
      { author: 'Linda G.', comment: 'Eindelijk een overzichtelijke apotheek app in Suriname.', rating: 4 }
    ]
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });