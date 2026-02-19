import 'dotenv/config';
import '../config/db.config';
import { User, PriorityNeed, UserRole, SubscribeType } from './model';
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

  // Create superadmin role if it doesn't exist
  let superadminRole = await UserRole.findOne({
    where: { name: 'superadmin' },
  });
  if (!superadminRole) {
    superadminRole = await UserRole.create({ name: 'superadmin' });
  }

  // Create full subscription type if it doesn't exist
  let fullSubscribeType = await SubscribeType.findOne({
    where: { name: 'full' },
  });
  if (!fullSubscribeType) {
    fullSubscribeType = await SubscribeType.create({ name: 'full' });
  }

  await User.create({
    name,
    email,
    password: hashedPassword,
    phone_number,
    role_id: superadminRole.id,
    subscribe_type_id: fullSubscribeType.id,
    unique_key: 'alfianganteng',
  });
  console.log('Superadmin seeded!');
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

async function seedSubscribeTypes() {
  const subscribeTypes = [
    { name: 'bibit' },
    { name: 'bertumbuh' },
    { name: 'full' },
  ];

  for (const type of subscribeTypes) {
    const existing = await SubscribeType.findOne({
      where: { name: type.name },
    });
    if (!existing) {
      await SubscribeType.create(type);
      console.log(`Subscribe type "${type.name}" seeded!`);
    } else {
      console.log(`Subscribe type "${type.name}" already exists.`);
    }
  }
}

async function seedUserRole() {
  const churchPositions = [
    'pastor',
    'minister',
    'preacher',
    'senior_pastor',
    'associate_pastor',
    'youth_pastor',
    'bishop',
    'priest',
    'deacon',
    'deaconess',
    'elder',
    'warden',
    'trustee',
    'church_secretary',
    'treasurer',
    'worship_leader',
    'choir_director',
    'music_director',
    'usher',
    'greeter',
    'sunday_school_teacher',
    'pope',
    'cardinal',
    'archbishop',
    'vicar',
    'altar_server',
  ];

  for (const position of churchPositions) {
    const existing = await UserRole.findOne({
      where: { name: position },
    });
    if (!existing) {
      await UserRole.create({
        name: position,
      });
      console.log(`Role account "${position}" seeded!`);
    } else {
      console.log(`Role account "${position}" already exists.`);
    }
  }
}

async function main() {
  try {
    console.log('Database sync completed...');

    await seedSubscribeTypes();
    await seedSuperadmin();
    await seedPriorityNeeds();
    await seedUserRole();
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
