/**
 * Create Dev Users via Admin API
 * 
 * This script uses the admin API endpoint to create users
 * Run with: node scripts/create-users-via-api.js
 */

const https = require('https');

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

const DEV_USERS = [
  {
    email: 'darshan.khapekar@ves.ac.in',
    name: 'Darshan Khapekar',
    role: 'faculty',
    department: 'Computer',
    designation: 'Assistant Professor',
    employee_id: 'FAC001',
    password: '123456789',
  },
  {
    email: 'admin@ves.ac.in',
    name: 'Admin User',
    role: 'misAdmin',
    department: 'Computer',
    designation: 'Administrator',
    employee_id: 'ADM001',
    password: '123456789',
  },
  {
    email: 'nupur.giri@ves.ac.in',
    name: 'Nupur Giri',
    role: 'hod',
    department: 'Computer',
    designation: 'Head of Department',
    employee_id: 'HOD001',
    password: '123456789',
  },
];

async function createUser(userData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(userData);
    const url = new URL(`${API_URL}/api/admin/users`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const protocol = url.protocol === 'https:' ? https : require('http');
    const req = protocol.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode === 200) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Failed to create user'));
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Create Dev Users via Admin API       ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nAPI URL: ${API_URL}`);
  console.log(`Creating ${DEV_USERS.length} dev users...\n`);

  const results = [];

  for (const userData of DEV_USERS) {
    try {
      console.log(`📝 Creating: ${userData.email}...`);
      const result = await createUser(userData);
      console.log(`   ✅ SUCCESS: ${result.message}`);
      console.log(`   📧 Email: ${userData.email}`);
      console.log(`   🔑 Password: ${userData.password}`);
      results.push({ email: userData.email, success: true });
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      results.push({ email: userData.email, success: false, error: error.message });
    }
    console.log('');
  }

  console.log('╔════════════════════════════════════════╗');
  console.log('║            Summary                      ║');
  console.log('╚════════════════════════════════════════╝');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n✅ Successful: ${successful}/${results.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
    console.log('\nFailed users:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.email}: ${r.error}`);
    });
  }

  if (successful > 0) {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║        Dev Users Ready! 🎉             ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\nYou can now login with:\n');
    
    results.filter(r => r.success).forEach(r => {
      console.log(`   ${r.email}`);
    });
    
    console.log('\nPassword for all: 123456789');
  }
  
  console.log('\n════════════════════════════════════════\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
