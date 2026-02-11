/**
 * Quick test script to verify database queries work
 */

import { sql } from '../src/client';
import {
  createUser,
  createStudio,
  createEmployee,
  createService,
  assignServiceToEmployee,
  getStudioBySubdomain,
  getEmployeesByStudioId,
  getServicesWithPricing,
  closeConnection,
} from '../src';

async function runTest() {
  console.log('\n🧪 Testing Polished Database Layer\n');

  try {
    // 1. Create a test user (owner)
    console.log('1. Creating test user...');
    const user = await createUser({
      email: 'test@example.com',
      name: 'Test Owner',
      phone: '+1234567890',
    });
    console.log(`   ✅ Created user: ${user.name} (${user.id})`);

    // 2. Create a studio
    console.log('2. Creating test studio...');
    const studio = await createStudio({
      subdomain: 'test-studio',
      name: 'Test Beauty Studio',
      slug: 'test-beauty-studio',
      ownerId: user.id,
    });
    console.log(`   ✅ Created studio: ${studio.name} (${studio.subdomain})`);

    // 3. Create an employee
    console.log('3. Creating test employee...');
    const employeeUser = await createUser({
      email: 'employee@example.com',
      name: 'Sarah Martinez',
      phone: '+1234567891',
    });
    const employee = await createEmployee({
      studioId: studio.id,
      userId: employeeUser.id,
      title: 'Nail Specialist',
      bio: '10 years experience in nail art',
    });
    console.log(`   ✅ Created employee: ${employeeUser.name} - ${employee.title}`);

    // 4. Create a service
    console.log('4. Creating test service...');
    const service = await createService({
      studioId: studio.id,
      name: 'Gel Manicure',
      description: 'Long-lasting gel polish with expert application',
      category: 'Nails',
    });
    console.log(`   ✅ Created service: ${service.name}`);

    // 5. Assign service to employee
    console.log('5. Assigning service to employee...');
    const employeeService = await assignServiceToEmployee({
      employeeId: employee.id,
      serviceId: service.id,
      price: 65.0,
      duration: 60,
    });
    console.log(`   ✅ Assigned: $${employeeService.price} / ${employeeService.duration}min`);

    // 6. Query studio by subdomain
    console.log('6. Testing getStudioBySubdomain...');
    const foundStudio = await getStudioBySubdomain('test-studio');
    console.log(`   ✅ Found: ${foundStudio?.name}`);

    // 7. Get employees
    console.log('7. Testing getEmployeesByStudioId...');
    const employees = await getEmployeesByStudioId(studio.id);
    console.log(`   ✅ Found ${employees.length} employee(s): ${employees.map(e => e.user.name).join(', ')}`);

    // 8. Get services with pricing
    console.log('8. Testing getServicesWithPricing...');
    const services = await getServicesWithPricing(studio.id);
    console.log(`   ✅ Found ${services.length} service(s):`);
    for (const s of services) {
      console.log(`      - ${s.name}: $${s.minPrice}-$${s.maxPrice} (${s.employeeCount} employees)`);
    }

    console.log('\n✅ All tests passed!\n');

    // Clean up
    console.log('Cleaning up test data...');
    await sql`DELETE FROM studios WHERE id = ${studio.id}`;
    await sql`DELETE FROM users WHERE id = ${user.id}`;
    await sql`DELETE FROM users WHERE id = ${employeeUser.id}`;
    console.log('✅ Cleaned up\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

runTest();
