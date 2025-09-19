import prisma from './config/database';

async function testConnection() {
  try {
    // Test de connexion simple
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Compter les utilisateurs (devrait être 0)
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
