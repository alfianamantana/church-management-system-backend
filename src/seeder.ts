import 'dotenv/config';
import '../config/db.config';
import { User, Category } from './model';
import bcrypt from 'bcrypt';
async function seedSuperadmin() {
  const email = 'admin@admin.com';
  const password = 'admin123';
  const name = 'Super Admin';
  const phone_number = '081234567890';

  // Cek apakah sudah ada superadmin
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log('Superadmin already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    phone_number,
    role: 'superadmin',
    subscribe_type: 'full',
  });
  console.log('Superadmin seeded!');
}

async function seedCategories() {
  const categories = [
    { name: 'Donasi', type: 'income' as const },
    { name: 'Persembahan', type: 'income' as const },
    { name: 'Pengeluaran Kantor', type: 'expense' as const },
    { name: 'Pengeluaran Acara', type: 'expense' as const },
    { name: 'Pengeluaran Makanan', type: 'expense' as const },
    { name: 'Pengeluaran Transportasi', type: 'expense' as const },
  ];

  for (const cat of categories) {
    const existing = await Category.findOne({ where: { name: cat.name } });
    if (!existing) {
      await Category.create(cat);
      console.log(`Category "${cat.name}" seeded!`);
    } else {
      console.log(`Category "${cat.name}" already exists.`);
    }
  }
}

async function main() {
  try {
    await seedSuperadmin();
    await seedCategories();
    console.log('Seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
