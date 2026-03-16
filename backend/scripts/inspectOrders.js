const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const orders = await prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { pharmacy: true, user: true }
    });
    console.log('Latest orders (most recent first):');
    orders.forEach(o => {
      console.log(`ID: ${o.id} | userId: ${o.userId} (${o.user?.email||'?'}) | pharmacyId: ${o.pharmacyId} (${o.pharmacy?.name||'?'}) | deliveryMethod: ${o.deliveryMethod} | total: ${o.totalAmount} | createdAt: ${o.createdAt}`);
    });
  } catch (e) {
    console.error('Error querying orders:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
