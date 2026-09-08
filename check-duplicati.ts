import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categorie = await prisma.categoria.findMany({
    select: {
      id: true,
      nome: true,
    },
    orderBy: {
      nome: 'asc',
    },
  });

  console.log('\n=== CATEGORIE NEL DATABASE ===\n');
  categorie.forEach(c => {
    console.log(`ID: ${c.id} | Nome: ${c.nome}`);
  });

  // Controlla duplicati
  const duplicati = categorie.filter((item, index, self) =>
    index !== self.findIndex(t => t.nome === item.nome)
  );

  if (duplicati.length > 0) {
    console.log('\n⚠️  TROVATI DUPLICATI ⚠️\n');
    duplicati.forEach(d => {
      console.log(`Nome duplicato: ${d.nome}`);
    });
    console.log('\n❌ NON ESEGUIRE "bunx prisma db push" - elimina prima i duplicati!');
  } else {
    console.log('\n✅ NESSUN DUPLICATO TROVATO\n');
    console.log('Puoi eseguire "bunx prisma db push" e rispondere "y"');
  }

  await prisma.$disconnect();
}

main().catch(console.error);