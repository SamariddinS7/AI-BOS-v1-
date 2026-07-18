/**
 * Prisma seed — populates default tenant, roles, admin user, and analytics data.
 * Run: npx prisma db seed  (or: npx tsx prisma/seed.ts)
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. Default Tenant ──────────────────────────────────────────────────────
  await prisma.tenant.upsert({
    where: { id: 'default-tenant-id' },
    update: {},
    create: {
      id: 'default-tenant-id',
      name: 'AI-BOS Global',
      domain: 'ai-bos.com',
      status: 'active',
    },
  });

  // ── 2. RBAC Roles ──────────────────────────────────────────────────────────
  const roles = [
    { id: 'role-owner',    name: 'OWNER',    description: 'Full system access' },
    { id: 'role-admin',    name: 'ADMIN',    description: 'Administrative access' },
    { id: 'role-manager',  name: 'MANAGER',  description: 'Manage resources' },
    { id: 'role-viewer',   name: 'VIEWER',   description: 'Read-only access' },
    { id: 'role-ai-agent', name: 'AI_AGENT', description: 'AI agent service account' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: { ...role, tenant_id: 'default-tenant-id' },
    });
  }

  // ── 3. Default Admin User ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { id: 'admin-user-id' },
    update: {},
    create: {
      id: 'admin-user-id',
      tenant_id: 'default-tenant-id',
      role_id: 'role-admin',
      first_name: 'System Admin',
      email: 'admin@ai-bos.com',
      password_hash: passwordHash,
      status: 'active',
    },
  });

  // ── 4. User Settings ───────────────────────────────────────────────────────
  await prisma.userSettings.upsert({
    where: { user_id: 'admin-user-id' },
    update: {},
    create: { user_id: 'admin-user-id', tenant_id: 'default-tenant-id' },
  });

  await prisma.integrationSettings.upsert({
    where: { user_id: 'admin-user-id' },
    update: {},
    create: { user_id: 'admin-user-id', tenant_id: 'default-tenant-id' },
  });

  // ── 5. Telegram Settings ───────────────────────────────────────────────────
  await prisma.telegramSettings.upsert({
    where: { tenant_id: 'default-tenant-id' },
    update: {},
    create: {
      tenant_id: 'default-tenant-id',
      system_prompt: "Sen AI-BOS tizimining aqlli yordamchisisan. Foydalanuvchilarga qisqa va aniq javob ber.",
      custom_code: `// msg: Telegram xabari obyekti
// sysPrompt: AI tizim xabari
// callAI: AI ga so'rov yuborish funksiyasi (async)

if (msg.text === "/start") {
  return "Assalomu alaykum! AI-BOS botiga xush kelibsiz.";
}

// AI orqali javob olish
const reply = await callAI(msg.text, sysPrompt);
return reply;`,
    },
  });

  // ── 6. Analytics seed data ─────────────────────────────────────────────────
  const txCount = await prisma.transaction.count();
  if (txCount === 0) {
    console.log('  Seeding finance data...');

    // Accounts & Categories
    await prisma.account.upsert({
      where: { id: 'acc-1' },
      update: {},
      create: { id: 'acc-1', tenant_id: 'default-tenant-id', name: 'Main Bank', type: 'bank', balance: 150000 },
    });
    await prisma.transactionCategory.upsert({
      where: { id: 'cat-rev' },
      update: {},
      create: { id: 'cat-rev', tenant_id: 'default-tenant-id', name: 'Sales Revenue', type: 'income' },
    });
    await prisma.transactionCategory.upsert({
      where: { id: 'cat-exp' },
      update: {},
      create: { id: 'cat-exp', tenant_id: 'default-tenant-id', name: 'Operating Expense', type: 'expense' },
    });

    // 180 days of transactions
    const now = new Date();
    const txData = [];
    for (let i = 0; i < 180; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      txData.push(
        { id: `tx-rev-${i}`, tenant_id: 'default-tenant-id', account_id: 'acc-1', category_id: 'cat-rev', type: 'income',  amount: Math.floor(Math.random() * 10000) + 5000, transaction_date: date },
        { id: `tx-exp-${i}`, tenant_id: 'default-tenant-id', account_id: 'acc-1', category_id: 'cat-exp', type: 'expense', amount: Math.floor(Math.random() * 6000)  + 2000, transaction_date: date },
      );
    }
    await prisma.transaction.createMany({ data: txData, skipDuplicates: true });

    // Marketing
    const channels = [
      { id: 'ch-google', name: 'Google Ads' },
      { id: 'ch-meta',   name: 'Meta Ads' },
      { id: 'ch-tv',     name: 'TV / Media' },
      { id: 'ch-inf',    name: 'Influencer' },
      { id: 'ch-out',    name: 'Outdoor' },
      { id: 'ch-rad',    name: 'Radio' },
    ];
    for (const ch of channels) {
      await prisma.marketingChannel.upsert({ where: { id: ch.id }, update: {}, create: { ...ch, tenant_id: 'default-tenant-id', type: 'digital' } });
    }
    await prisma.campaign.upsert({
      where: { id: 'camp-1' },
      update: {},
      create: { id: 'camp-1', tenant_id: 'default-tenant-id', name: 'Q1 Growth', budget: 50000, start_date: now.toISOString(), status: 'active' },
    });
    const spends  = [4200, 3800, 8500, 2200, 3000, 1200];
    const revenues = [18500, 14200, 22000, 9800, 5500, 2100];
    for (let idx = 0; idx < channels.length; idx++) {
      const ch = channels[idx];
      const spend = spends[idx] * 12800;
      const rev   = revenues[idx] * 12800;
      await prisma.adMetric.upsert({
        where: { campaign_id_channel_id_metric_date: { campaign_id: 'camp-1', channel_id: ch.id, metric_date: now.toISOString().split('T')[0] } },
        update: {},
        create: { id: `metric-${ch.id}`, tenant_id: 'default-tenant-id', campaign_id: 'camp-1', channel_id: ch.id, metric_date: now.toISOString().split('T')[0], spend, impressions: spend * 10, clicks: spend / 100, conversions: spend / 1000, revenue: rev },
      });
    }

    // Products & Inventory
    await prisma.productCategory.upsert({ where: { id: 'pcat-1' }, update: {}, create: { id: 'pcat-1', tenant_id: 'default-tenant-id', name: 'Electronics' } });
    const products = [
      { id: 'prod-1', name: 'Laptop Pro',      sku: 'LAP-001', price: 1500, cost: 1000 },
      { id: 'prod-2', name: 'Smartphone X',    sku: 'PHN-001', price: 800,  cost: 500 },
      { id: 'prod-3', name: 'Wireless Earbuds', sku: 'EAR-001', price: 150, cost: 60 },
    ];
    for (const p of products) {
      await prisma.product.upsert({ where: { id: p.id }, update: {}, create: { ...p, tenant_id: 'default-tenant-id', category_id: 'pcat-1' } });
    }
    await prisma.warehouse.upsert({ where: { id: 'wh-1' }, update: {}, create: { id: 'wh-1', tenant_id: 'default-tenant-id', name: 'Main Warehouse', location: 'Tashkent' } });
    const stocks = [
      { id: 'stk-1', product_id: 'prod-1', quantity: 150 },
      { id: 'stk-2', product_id: 'prod-2', quantity: 300 },
      { id: 'stk-3', product_id: 'prod-3', quantity: 500 },
    ];
    for (const s of stocks) {
      await prisma.inventoryStock.upsert({ where: { id: s.id }, update: {}, create: { ...s, tenant_id: 'default-tenant-id', warehouse_id: 'wh-1' } });
    }

    // CRM
    await prisma.customer.upsert({ where: { id: 'cust-1' }, update: {}, create: { id: 'cust-1', tenant_id: 'default-tenant-id', name: 'Acme Corp', type: 'b2b' } });
    const deals = [
      { id: 'deal-1', name: 'Enterprise License', title: 'Enterprise License', value: 50000, stage: 'negotiation' },
      { id: 'deal-2', name: 'Support Package',    title: 'Support Package',    value: 12000, stage: 'won' },
      { id: 'deal-3', name: 'Consulting',         title: 'Consulting',         value: 8000,  stage: 'proposal' },
    ];
    for (const d of deals) {
      await prisma.deal.upsert({ where: { id: d.id }, update: {}, create: { ...d, tenant_id: 'default-tenant-id', customer_id: 'cust-1', expected_close_date: now.toISOString() } });
    }

    console.log('  Finance data seeded.');
  }

  // ── 7. Analytics Data ──────────────────────────────────────────────────────
  const analyticsCount = await prisma.analyticsDataEntry.count();
  if (analyticsCount === 0) {
    console.log('  Seeding analytics data...');
    const now = new Date();
    const analyticsData = [];
    for (let i = 0; i < 90; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      analyticsData.push(
        { tenant_id: 'default-tenant-id', module: 'revenue',   metric: 'amount', value: Math.floor(Math.random() * 20000) + 10000, date: dateStr },
        { tenant_id: 'default-tenant-id', module: 'expenses',  metric: 'amount', value: Math.floor(Math.random() * 10000) + 5000,  date: dateStr },
        { tenant_id: 'default-tenant-id', module: 'marketing', metric: 'roi',    value: Math.floor(Math.random() * 200) + 100,     date: dateStr },
      );
    }
    await prisma.analyticsDataEntry.createMany({ data: analyticsData });
    console.log('  Analytics data seeded.');
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
