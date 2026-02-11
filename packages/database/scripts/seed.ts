/**
 * Database Seed Script
 *
 * Populates the database with demo data for development.
 * Usage: bun run seed
 */

import { sql } from '../src/client';
import {
  createUser,
  createStudio,
  createEmployee,
  createService,
  assignServiceToEmployee,
  closeConnection,
} from '../src';

async function seed() {
  console.log('\n🌱 Seeding Polished Database\n');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('Clearing existing data...');
    await sql`DELETE FROM bookings`;
    await sql`DELETE FROM employee_services`;
    await sql`DELETE FROM services`;
    await sql`DELETE FROM employees`;
    await sql`DELETE FROM studios`;
    await sql`DELETE FROM users`;
    console.log('✅ Cleared existing data\n');

    // 1. Create owner user
    console.log('1. Creating owner user...');
    const owner = await createUser({
      email: 'marco@milanbeauty.com',
      name: 'Marco Rossi',
      phone: '+39 02 1234567',
    });
    console.log(`   ✅ Created owner: ${owner.name}`);

    // 2. Create studio
    console.log('2. Creating demo studio...');
    const studio = await createStudio({
      subdomain: 'milan-beauty',
      name: 'Milan Beauty Studio',
      slug: 'milan-beauty-studio',
      ownerId: owner.id,
      phone: '+39 02 1234567',
      email: 'hello@milanbeauty.com',
      address: 'Via della Moda 123, Milan, IT 20121',
    });
    console.log(`   ✅ Created studio: ${studio.name} (${studio.subdomain})`);

    // 3. Create employees
    console.log('3. Creating employees...');
    const employeeData = [
      { name: 'Sarah Martinez', email: 'sarah@milanbeauty.com', title: 'Nail Specialist', bio: '10 years experience in nail art and gel applications. Certified in advanced nail techniques.' },
      { name: 'Lisa Chen', email: 'lisa@milanbeauty.com', title: 'Hair Stylist', bio: 'Expert in modern cuts and color techniques. Trained in Paris and Milan.' },
      { name: 'Mike Johnson', email: 'mike@milanbeauty.com', title: 'Nail Technician', bio: 'Specialized in intricate nail art designs. Instagram featured artist.' },
      { name: 'Emma Wilson', email: 'emma@milanbeauty.com', title: 'Esthetician', bio: 'Licensed skincare specialist with expertise in anti-aging treatments.' },
    ];

    const employees = [];
    for (const emp of employeeData) {
      const user = await createUser({ email: emp.email, name: emp.name });
      const employee = await createEmployee({
        studioId: studio.id,
        userId: user.id,
        title: emp.title,
        bio: emp.bio,
      });
      employees.push({ ...employee, user });
      console.log(`   ✅ Created employee: ${emp.name} - ${emp.title}`);
    }

    // 4. Create services
    console.log('4. Creating services...');
    const serviceData = [
      { name: 'Gel Manicure', description: 'Long-lasting gel polish with expert application. Includes nail shaping, cuticle care, and your choice of color.', category: 'Nails' },
      { name: 'Classic Pedicure', description: 'Relaxing foot treatment with exfoliation, massage, and polish application.', category: 'Nails' },
      { name: 'Nail Art', description: 'Custom nail art designs from simple accents to intricate patterns.', category: 'Nails' },
      { name: 'Acrylic Extensions', description: 'Full set of acrylic nail extensions with your choice of shape and length.', category: 'Nails' },
      { name: 'Haircut & Styling', description: 'Professional cut and style tailored to your face shape and lifestyle.', category: 'Hair' },
      { name: 'Hair Coloring', description: 'Full color, highlights, or balayage with premium products.', category: 'Hair' },
      { name: 'Deep Cleansing Facial', description: 'Deep cleansing facial with customized treatment for your skin type.', category: 'Skincare' },
      { name: 'Anti-Aging Treatment', description: 'Advanced anti-aging facial with collagen and vitamin C serums.', category: 'Skincare' },
      { name: 'Swedish Massage', description: 'Classic relaxation massage to relieve tension and stress.', category: 'Massage' },
      { name: 'Deep Tissue Massage', description: 'Therapeutic massage focusing on muscle knots and tension areas.', category: 'Massage' },
    ];

    const services = [];
    for (let i = 0; i < serviceData.length; i++) {
      const svc = serviceData[i];
      const service = await createService({
        studioId: studio.id,
        name: svc.name,
        description: svc.description,
        category: svc.category,
        displayOrder: i,
      });
      services.push(service);
      console.log(`   ✅ Created service: ${svc.name} (${svc.category})`);
    }

    // 5. Assign services to employees with pricing
    console.log('5. Assigning services to employees...');

    // Sarah (Nail Specialist) - Nail services
    const nailServices = services.filter(s => s.category === 'Nails');
    for (const svc of nailServices) {
      await assignServiceToEmployee({
        employeeId: employees[0].id,
        serviceId: svc.id,
        price: svc.name === 'Gel Manicure' ? 65 : svc.name === 'Classic Pedicure' ? 55 : svc.name === 'Nail Art' ? 45 : 95,
        duration: svc.name === 'Acrylic Extensions' ? 90 : 60,
      });
    }
    console.log(`   ✅ Assigned ${nailServices.length} services to Sarah`);

    // Mike (Nail Technician) - Some nail services
    for (const svc of nailServices.slice(0, 3)) {
      await assignServiceToEmployee({
        employeeId: employees[2].id,
        serviceId: svc.id,
        price: svc.name === 'Gel Manicure' ? 60 : svc.name === 'Classic Pedicure' ? 50 : 55,
        duration: svc.name === 'Nail Art' ? 45 : 60,
      });
    }
    console.log(`   ✅ Assigned 3 services to Mike`);

    // Lisa (Hair Stylist) - Hair services
    const hairServices = services.filter(s => s.category === 'Hair');
    for (const svc of hairServices) {
      await assignServiceToEmployee({
        employeeId: employees[1].id,
        serviceId: svc.id,
        price: svc.name === 'Haircut & Styling' ? 85 : 150,
        duration: svc.name === 'Haircut & Styling' ? 60 : 120,
      });
    }
    console.log(`   ✅ Assigned ${hairServices.length} services to Lisa`);

    // Emma (Esthetician) - Skincare and massage
    const skincareServices = services.filter(s => s.category === 'Skincare' || s.category === 'Massage');
    for (const svc of skincareServices) {
      await assignServiceToEmployee({
        employeeId: employees[3].id,
        serviceId: svc.id,
        price: svc.name.includes('Facial') ? 95 : svc.name.includes('Anti-Aging') ? 150 : 110,
        duration: svc.name.includes('Massage') ? 60 : 75,
      });
    }
    console.log(`   ✅ Assigned ${skincareServices.length} services to Emma`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - 1 Studio: ${studio.name}`);
    console.log(`   - ${employees.length + 1} Users (1 owner + ${employees.length} employees)`);
    console.log(`   - ${services.length} Services`);
    console.log(`   - Multiple service-employee assignments\n`);

    console.log('🌐 Access your demo studio at:');
    console.log(`   http://${studio.subdomain}.localhost:3001\n`);

  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

seed();
