const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const central = await prisma.pharmacy.findUnique({ where: { email: 'central@healtease.test' } });
    if (!central) {
      console.error('Central Pharmacy not found; aborting.');
      process.exit(1);
    }
    const nullOrders = await prisma.order.findMany({ where: { pharmacyId: null } });
    console.log(`Found ${nullOrders.length} orders with null pharmacyId.`);
    for (const o of nullOrders) {
      await prisma.order.update({ where: { id: o.id }, data: { pharmacyId: central.id } });
      console.log(`Updated order ${o.id} -> pharmacyId ${central.id}`);
    }
    console.log('Done updating orders.');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
