const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Producten toevoegen (gebaseerd op 'Everyday Must-Haves' en 'Shop by Category')
  const products = [
    {
      name: 'Paracetamol 500mg',
      description: 'Pijnstiller en koortsverlagend middel.',
      price: 25.00,
      category: 'Medications',
      subCategory: 'Morning Essentials',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200'
    },
    {
      name: 'Vitamin C Complex',
      description: 'Ondersteunt het immuunsysteem.',
      price: 120.00,
      category: 'Health & Wellness',
      subCategory: 'Morning Essentials',
      imageUrl: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf4?q=80&w=200'
    },
    {
      name: 'First Aid Kit',
      description: 'Complete set voor noodsituaties.',
      price: 350.00,
      category: 'First Aid',
      subCategory: 'On-the-go',
      imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=200'
    }
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // Basis apotheken (multi-vendor)
  const centralPharmacy = await prisma.pharmacy.create({
    data: {
      name: 'Central Pharmacy',
      address: 'Waterkant 1, Paramaribo',
      lat: 5.825,
      lng: -55.167,
      email: 'pharmacy@healtease.test',
      // LET OP: in productie altijd hashen!
      password: 'pharmacy123'
    }
  });

  const northPharmacy = await prisma.pharmacy.create({
    data: {
      name: 'Northside Pharmacy',
      address: 'Anamoestraat 10, Paramaribo-Noord',
      lat: 5.864,
      lng: -55.203,
      email: 'pharmacy2@healtease.test',
      password: 'pharmacy123'
    }
  });

  // Voorraad voor apotheken (alle producten een start-quantity)
  const allProducts = await prisma.product.findMany();
  for (const product of allProducts) {
    await prisma.stock.createMany({
      data: [
        {
          pharmacyId: centralPharmacy.id,
          productId: product.id,
          quantity: 25
        },
        {
          pharmacyId: northPharmacy.id,
          productId: product.id,
          quantity: 15
        }
      ]
    });
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
        email: 'pharmacy@healtease.test',
        password: 'pharmacy123',
        name: 'Central Pharmacy User',
        role: 'PHARMACY'
      }
    ],
    skipDuplicates: true
  });

  // Een paar test reviews (Testimonials)
  await prisma.review.createMany({
    data: [
      { author: 'Sophie V.', comment: 'Super snelle levering van mijn medicijnen!', rating: 5 },
      { author: 'Linda G.', comment: 'Eindelijk een overzichtelijke apotheek app in Suriname.', rating: 4 }
    ]
  });

  console.log('Seeding klaar!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });