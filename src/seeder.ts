import 'dotenv/config';
import '../config/db.config';
import { User, Category, PriorityNeed, Church } from './model';
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
    unique_key: 'alfianganteng',
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

  // Get demo church
  const church = await Church.findOne({
    where: { email: 'demo@gereja.com' },
  });
  if (!church) {
    console.log('Demo church not found, skipping category seeding.');
    return;
  }

  for (const cat of categories) {
    const existing = await Category.findOne({
      where: { name: cat.name, church_id: church.id },
    });
    if (!existing) {
      await Category.create({ ...cat, church_id: church.id });
      console.log(`Category "${cat.name}" seeded!`);
    } else {
      console.log(`Category "${cat.name}" already exists.`);
    }
  }
}

async function seedPriorityNeeds() {
  const priorityNeeds = [
    {
      name: 'member_management',
      description: 'member_management_desc',
    },
    {
      name: 'attendance_tracking',
      description: 'attendance_tracking_desc',
    },
    {
      name: 'event_management',
      description: 'event_management_desc',
    },
    {
      name: 'children_church',
      description: 'children_church_desc',
    },
    {
      name: 'communication',
      description: 'communication_desc',
    },
    {
      name: 'volunteer_scheduling',
      description: 'volunteer_scheduling_desc',
    },
    {
      name: 'financial_reporting',
      description: 'financial_reporting_desc',
    },
    {
      name: 'multi_branch_management',
      description: 'multi_branch_management_desc',
    },
  ];

  for (const need of priorityNeeds) {
    const existing = await PriorityNeed.findOne({
      where: { name: need.name },
    });
    if (!existing) {
      await PriorityNeed.create(need);
      console.log(`Priority need "${need.name}" seeded!`);
    } else {
      console.log(`Priority need "${need.name}" already exists.`);
    }
  }
}

async function main() {
  try {
    await seedSuperadmin();
    await seedCategories();
    await seedPriorityNeeds();
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
