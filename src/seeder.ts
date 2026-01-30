import 'dotenv/config';
import '../config/db.config';
import { User } from './model';
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

seedSuperadmin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
