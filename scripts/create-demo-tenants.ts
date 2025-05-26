import { db } from '../server/db';
import { tenantService } from '../server/tenant-service';
import { 
  tenants, 
  subscriptionPlans, 
  tenantSubscriptions,
  tenantUsers 
} from '../shared/tenant-schema';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function createDemoTenants() {
  console.log('🏢 Creating demo tenant organizations...');

  try {
    // Demo organizations to create
    const demoTenants = [
      {
        tenant: {
          name: "Acme Corporation",
          subdomain: "acme",
          billingEmail: "billing@acme.com"
        },
        admin: {
          firstName: "John",
          lastName: "Smith", 
          email: "john@acme.com",
          password: "AcmeAdmin123!"
        }
      },
      {
        tenant: {
          name: "Tech Innovators Inc",
          subdomain: "techinnovators",
          billingEmail: "billing@techinnovators.com"
        },
        admin: {
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah@techinnovators.com", 
          password: "TechAdmin123!"
        }
      },
      {
        tenant: {
          name: "Global Solutions Ltd",
          subdomain: "globalsolutions",
          billingEmail: "billing@globalsolutions.com"
        },
        admin: {
          firstName: "Michael",
          lastName: "Chen",
          email: "michael@globalsolutions.com",
          password: "GlobalAdmin123!"
        }
      },
      {
        tenant: {
          name: "Startup Dynamics",
          subdomain: "startupdynamics", 
          billingEmail: "billing@startupdynamics.com"
        },
        admin: {
          firstName: "Emily",
          lastName: "Rodriguez",
          email: "emily@startupdynamics.com",
          password: "StartupAdmin123!"
        }
      },
      {
        tenant: {
          name: "Enterprise Systems Corp",
          subdomain: "enterprisesystems",
          billingEmail: "billing@enterprisesystems.com"
        },
        admin: {
          firstName: "David",
          lastName: "Wilson",
          email: "david@enterprisesystems.com",
          password: "EnterpriseAdmin123!"
        }
      }
    ];

    let createdCount = 0;

    for (const demo of demoTenants) {
      try {
        // Check if tenant already exists
        const existingTenant = await tenantService.getTenantByDomain(demo.tenant.subdomain);
        if (existingTenant) {
          console.log(`⚠️  Tenant ${demo.tenant.name} (${demo.tenant.subdomain}) already exists, skipping...`);
          continue;
        }

        // Create the tenant with admin user
        const { tenant, adminUser } = await tenantService.createTenant(demo.tenant, demo.admin);
        
        console.log(`✅ Created tenant: ${tenant.name}`);
        console.log(`   📧 Admin: ${adminUser.email}`);
        console.log(`   🌐 Subdomain: ${tenant.subdomain}.yourdomain.com`);
        console.log(`   🎯 Status: ${tenant.status} (trial ends: ${tenant.trialEndsAt})`);
        
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create tenant ${demo.tenant.name}:`, error);
      }
    }

    // Get subscription plans to assign to some tenants
    const plans = await tenantService.getSubscriptionPlans();
    const starterPlan = plans.find(p => p.name === 'Starter');
    const professionalPlan = plans.find(p => p.name === 'Professional');
    const enterprisePlan = plans.find(p => p.name === 'Enterprise');

    console.log('\n📊 Demo tenant statistics:');
    console.log(`   ✨ Created: ${createdCount} new organizations`);
    console.log(`   📋 Available subscription plans: ${plans.length}`);

    // List all tenants
    const allTenants = await db.select().from(tenants);
    console.log('\n🏢 All tenant organizations:');
    
    for (const tenant of allTenants) {
      const userCount = await db.select().from(tenantUsers)
        .where(eq(tenantUsers.tenantId, tenant.id));
      
      console.log(`   • ${tenant.name}`);
      console.log(`     🌐 ${tenant.subdomain}.yourdomain.com`);
      console.log(`     👥 ${userCount.length} users`);
      console.log(`     📊 Status: ${tenant.status}`);
      console.log('');
    }

    console.log('🎉 Demo tenant creation completed successfully!');
    console.log('\n💡 You can now test the multi-tenant features:');
    console.log('   1. Visit acme.yourdomain.com to access Acme Corporation');
    console.log('   2. Visit techinnovators.yourdomain.com for Tech Innovators Inc');
    console.log('   3. Each organization has completely isolated data');
    console.log('   4. Each has their own admin user and subscription');

  } catch (error) {
    console.error('❌ Error creating demo tenants:', error);
    throw error;
  }
}

// Run the script
createDemoTenants()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

export { createDemoTenants };