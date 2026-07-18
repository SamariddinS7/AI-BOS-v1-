import Database from 'better-sqlite3';
import path from 'path';

let db: any;

try {
  const dbPath = path.resolve(process.cwd(), 'settings.db');
  db = new Database(dbPath);

  // Initialize Database Schema
  db.exec(`
    -- 1. IAM
    CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT UNIQUE,
        status TEXT DEFAULT 'active',
        subscription_plan TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        UNIQUE(tenant_id, name)
    );

    CREATE TABLE IF NOT EXISTS permissions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
        role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
        permission_id TEXT REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        role_id TEXT REFERENCES roles(id) ON DELETE SET NULL,
        first_name TEXT NOT NULL,
        last_name TEXT,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT,
        updated_by TEXT,
        deleted_at DATETIME,
        UNIQUE(tenant_id, email)
    );

    -- 2. CRM & Sales
    CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        industry TEXT,
        type TEXT,
        ltv REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        first_name TEXT NOT NULL,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
        assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        title TEXT,
        value REAL NOT NULL DEFAULT 0,
        stage TEXT NOT NULL,
        probability INTEGER CHECK (probability >= 0 AND probability <= 100),
        expected_close_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS interactions (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
        deal_id TEXT REFERENCES deals(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        summary TEXT,
        interaction_date DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME,
        CHECK (customer_id IS NOT NULL OR deal_id IS NOT NULL)
    );

    -- 3. Finance
    CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT,
        currency TEXT NOT NULL DEFAULT 'UZS',
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS transaction_categories (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
        category_id TEXT NOT NULL REFERENCES transaction_categories(id) ON DELETE RESTRICT,
        deal_id TEXT REFERENCES deals(id) ON DELETE SET NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_date DATETIME NOT NULL,
        is_verified INTEGER DEFAULT 0,
        description TEXT,
        counterparty TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME
    );

    -- 4. Marketing
    CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        budget REAL DEFAULT 0,
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'planned',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS marketing_channels (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS ad_metrics (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        channel_id TEXT NOT NULL REFERENCES marketing_channels(id) ON DELETE CASCADE,
        metric_date TEXT NOT NULL,
        spend REAL DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        revenue REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(campaign_id, channel_id, metric_date)
    );

    -- 5. HR & Team
    CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        manager_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
        position TEXT,
        salary REAL,
        hire_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS kpi_records (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        evaluation_month TEXT NOT NULL,
        score REAL NOT NULL,
        comments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME
    );

    -- 6. Inventory
    CREATE TABLE IF NOT EXISTS warehouses (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        address TEXT,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS product_categories (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        category_id TEXT REFERENCES product_categories(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        sku TEXT,
        price REAL NOT NULL DEFAULT 0,
        cost REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME,
        UNIQUE(tenant_id, sku)
    );

    CREATE TABLE IF NOT EXISTS inventory_stock (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        warehouse_id TEXT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, warehouse_id)
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        from_warehouse_id TEXT REFERENCES warehouses(id) ON DELETE RESTRICT,
        to_warehouse_id TEXT REFERENCES warehouses(id) ON DELETE RESTRICT,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        reference_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL
    );

    -- 7. System & Automation
    CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        n8n_webhook_url TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS WorkflowNodes (
      id TEXT PRIMARY KEY,
      workflow_id TEXT,
      type TEXT,
      label TEXT,
      config TEXT,
      position_x REAL,
      position_y REAL,
      FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS WorkflowEdges (
      id TEXT PRIMARY KEY,
      workflow_id TEXT,
      source_node_id TEXT,
      target_node_id TEXT,
      label TEXT,
      config TEXT,
      FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS WorkflowExecutions (
      id TEXT PRIMARY KEY,
      workflow_id TEXT,
      status TEXT,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      trigger_data TEXT,
      FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS WorkflowLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      execution_id TEXT,
      node_id TEXT,
      level TEXT,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(execution_id) REFERENCES WorkflowExecutions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        webhook_url TEXT,
        allowed_events TEXT, -- JSON string
        permissions TEXT, -- JSON string
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS ApiKeys (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      tenant_id TEXT,
      key_hash TEXT NOT NULL,
      name TEXT,
      scopes TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS Backups (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      size INTEGER,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Plugins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      version TEXT,
      author TEXT,
      permissions TEXT,
      config_schema TEXT,
      status TEXT DEFAULT 'inactive',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS WebhookSubscriptions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      event_type TEXT NOT NULL,
      target_url TEXT NOT NULL,
      secret TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS IntegrationLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT,
      integration_id TEXT,
      type TEXT,
      action TEXT,
      status TEXT,
      response_time INTEGER,
      payload TEXT,
      error_message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS DataMappings (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      name TEXT NOT NULL,
      source_format TEXT,
      target_format TEXT,
      mapping_rules TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS AnalyticsMetrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT,
      module TEXT,
      metric TEXT,
      level TEXT,
      period_key TEXT,
      value REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS AnalyticsData (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT,
      module TEXT,
      metric TEXT,
      value REAL,
      date TEXT,
      department TEXT,
      region TEXT,
      product TEXT,
      campaign TEXT,
      employee TEXT
    );

    CREATE TABLE IF NOT EXISTS SessionLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      tenant_id TEXT,
      device TEXT,
      ip_address TEXT,
      login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS SecuritySettings (
      user_id TEXT PRIMARY KEY,
      tenant_id TEXT,
      two_factor_enabled INTEGER DEFAULT 0,
      biometric_enabled INTEGER DEFAULT 0,
      session_timeout_minutes INTEGER DEFAULT 30,
      login_alert_enabled INTEGER DEFAULT 1,
      allowed_ips TEXT DEFAULT '[]',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS NotificationSettings (
      user_id TEXT PRIMARY KEY,
      tenant_id TEXT,
      email_enabled INTEGER DEFAULT 1,
      sms_enabled INTEGER DEFAULT 0,
      push_enabled INTEGER DEFAULT 1,
      marketing_alerts INTEGER DEFAULT 1,
      financial_alerts INTEGER DEFAULT 1,
      ai_alerts INTEGER DEFAULT 1,
      system_alerts INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT,
        old_data TEXT,
        new_data TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS AuditLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      tenant_id TEXT,
      action TEXT,
      module TEXT,
      ip_address TEXT,
      old_value TEXT,
      new_value TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS MarketingSkillExecution (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT,
      skill_type TEXT,
      status TEXT,
      input_parameters TEXT,
      output_result TEXT,
      confidence_score REAL,
      user_id TEXT,
      approval_workflow_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ApprovalWorkflow (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      skill_type TEXT,
      requester_id TEXT,
      status TEXT,
      approvals TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS SkillRecommendation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT,
      skill_type TEXT,
      recommendation TEXT,
      confidence REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Legacy tables for compatibility with existing code
    CREATE TABLE IF NOT EXISTS UserSettings (
        user_id TEXT PRIMARY KEY,
        tenant_id TEXT,
        theme TEXT DEFAULT 'system',
        font_size TEXT DEFAULT 'medium',
        primary_color TEXT DEFAULT 'teal',
        language TEXT DEFAULT 'uz',
        timezone TEXT DEFAULT 'Asia/Tashkent',
        date_format TEXT DEFAULT 'DD.MM.YYYY',
        number_format TEXT DEFAULT 'space',
        currency_format TEXT DEFAULT 'UZS',
        compact_mode INTEGER DEFAULT 0,
        animations_enabled INTEGER DEFAULT 1,
        high_contrast INTEGER DEFAULT 0,
        large_cursor INTEGER DEFAULT 0,
        focus_highlight INTEGER DEFAULT 0,
        screen_reader_optimized INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS IntegrationSettings (
        user_id TEXT PRIMARY KEY,
        tenant_id TEXT,
        n8n_url TEXT,
        n8n_api_key TEXT,
        openai_api_key TEXT,
        webhook_secret TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS TelegramSettings (
        tenant_id TEXT PRIMARY KEY,
        bot_token TEXT,
        system_prompt TEXT,
        custom_code TEXT,
        auto_reply INTEGER DEFAULT 0,
        use_custom_code INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS TelegramMessages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id TEXT,
        chat_id TEXT,
        username TEXT,
        text TEXT,
        is_bot INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS api_test_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT,
      method TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status_code INTEGER,
      response_time_ms REAL,
      passed BOOLEAN,
      error_type TEXT,
      requires_auth BOOLEAN,
      notes TEXT
    );
  `);

  try {
    db.prepare('ALTER TABLE transactions ADD COLUMN counterparty TEXT').run();
  } catch (e) {
    // Column might already exist
  }

  try {
    db.prepare('ALTER TABLE accounts ADD COLUMN type TEXT').run();
  } catch (e) {}

  try {
    db.prepare('ALTER TABLE marketing_channels ADD COLUMN type TEXT').run();
  } catch (e) {}

  try {
    db.prepare('ALTER TABLE warehouses ADD COLUMN location TEXT').run();
  } catch (e) {}

  try {
    db.prepare('ALTER TABLE customers ADD COLUMN type TEXT').run();
  } catch (e) {}

  try {
    db.prepare('ALTER TABLE deals ADD COLUMN title TEXT').run();
  } catch (e) {}

  // Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
    CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_deals_tenant_stage ON deals(tenant_id, stage);
    CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON transactions(tenant_id, transaction_date);
    CREATE INDEX IF NOT EXISTS idx_ad_metrics_campaign_date ON ad_metrics(campaign_id, metric_date);
  `);

  // Seed default tenant if not exists
  const checkTenant = db.prepare('SELECT id FROM tenants WHERE id = ?').get('default-tenant-id');
  if (!checkTenant) {
    db.prepare("INSERT INTO tenants (id, name, domain) VALUES (?, ?, ?)").run('default-tenant-id', 'AI-BOS Global', 'ai-bos.com');
  }

  // Seed default user
  const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@ai-bos.com');
  if (!checkUser) {
    db.prepare(`
      INSERT INTO users (id, tenant_id, first_name, email, password_hash, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('admin-user-id', 'default-tenant-id', 'System Admin', 'admin@ai-bos.com', 'hashed_password', 'active');
  }
  
  // Seed UserSettings for legacy code
  const checkUserSettings = db.prepare('SELECT user_id FROM UserSettings WHERE user_id = ?').get('admin-user-id');
  if (!checkUserSettings) {
      db.prepare('INSERT INTO UserSettings (user_id, tenant_id) VALUES (?, ?)').run('admin-user-id', 'default-tenant-id');
      db.prepare('INSERT INTO IntegrationSettings (user_id, tenant_id) VALUES (?, ?)').run('admin-user-id', 'default-tenant-id');
  }

  // Seed TelegramSettings
  const checkTelegramSettings = db.prepare('SELECT tenant_id FROM TelegramSettings WHERE tenant_id = ?').get('default-tenant-id');
  if (!checkTelegramSettings) {
      db.prepare('INSERT INTO TelegramSettings (tenant_id, system_prompt, custom_code) VALUES (?, ?, ?)').run(
        'default-tenant-id',
        'Sen AI-BOS tizimining aqlli yordamchisisan. Foydalanuvchilarga qisqa va aniq javob ber.',
        `// msg: Telegram xabari obyekti
// sysPrompt: AI tizim xabari
// callAI: AI ga so'rov yuborish funksiyasi (async)

if (msg.text === "/start") {
  return "Assalomu alaykum! AI-BOS botiga xush kelibsiz.";
}

// AI orqali javob olish
const reply = await callAI(msg.text, sysPrompt);
return reply;`
      );
  }

  // Seed Analytics Data (Transactions, Campaigns, Products, etc.)
  const checkTransactions = db.prepare('SELECT count(*) as count FROM transactions').get() as { count: number };
  if (checkTransactions.count === 0) {
    console.log('Seeding initial analytics data...');
    const tenantId = 'default-tenant-id';
    const userId = 'admin-user-id';
    
    // 1. Accounts & Categories
    db.prepare("INSERT INTO accounts (id, tenant_id, name, type, balance) VALUES (?, ?, ?, ?, ?)").run('acc-1', tenantId, 'Main Bank', 'bank', 150000);
    db.prepare("INSERT INTO transaction_categories (id, tenant_id, name, type) VALUES (?, ?, ?, ?)").run('cat-rev', tenantId, 'Sales Revenue', 'income');
    db.prepare("INSERT INTO transaction_categories (id, tenant_id, name, type) VALUES (?, ?, ?, ?)").run('cat-exp', tenantId, 'Operating Expense', 'expense');

    // 2. Transactions (Revenue & Expenses over last 6 months)
    const insertTx = db.prepare("INSERT INTO transactions (id, tenant_id, account_id, category_id, type, amount, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
    const now = new Date();
    for (let i = 0; i < 180; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString();
      
      // Daily Revenue (random between 5000 and 15000)
      const revAmount = Math.floor(Math.random() * 10000) + 5000;
      insertTx.run(`tx-rev-${i}`, tenantId, 'acc-1', 'cat-rev', 'income', revAmount, dateStr);
      
      // Daily Expense (random between 2000 and 8000)
      const expAmount = Math.floor(Math.random() * 6000) + 2000;
      insertTx.run(`tx-exp-${i}`, tenantId, 'acc-1', 'cat-exp', 'expense', expAmount, dateStr);
    }

    // 3. Marketing Campaigns & Channels
    const channels = [
      { id: 'ch-google', name: 'Google Ads' },
      { id: 'ch-meta', name: 'Meta Ads' },
      { id: 'ch-tv', name: 'TV / Media' },
      { id: 'ch-inf', name: 'Influencer' },
      { id: 'ch-out', name: 'Outdoor' },
      { id: 'ch-rad', name: 'Radio' }
    ];
    const insertChannel = db.prepare("INSERT INTO marketing_channels (id, tenant_id, name, type) VALUES (?, ?, ?, ?)");
    channels.forEach(ch => insertChannel.run(ch.id, tenantId, ch.name, 'digital'));

    db.prepare("INSERT INTO campaigns (id, tenant_id, name, budget, start_date, status) VALUES (?, ?, ?, ?, ?, ?)").run('camp-1', tenantId, 'Q1 Growth', 50000, now.toISOString(), 'active');

    // Ad Metrics
    const insertAdMetric = db.prepare("INSERT INTO ad_metrics (id, tenant_id, campaign_id, channel_id, metric_date, spend, impressions, clicks, conversions, revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    channels.forEach((ch, idx) => {
      // Generate some realistic looking metrics per channel
      const baseSpend = [4200, 3800, 8500, 2200, 3000, 1200][idx] * 12800; // UZS
      const baseRev = [18500, 14200, 22000, 9800, 5500, 2100][idx] * 12800;
      
      insertAdMetric.run(`metric-${ch.id}`, tenantId, 'camp-1', ch.id, now.toISOString(), baseSpend, baseSpend * 10, baseSpend / 100, baseSpend / 1000, baseRev);
    });

    // 4. Products & Inventory
    db.prepare("INSERT INTO product_categories (id, tenant_id, name) VALUES (?, ?, ?)").run('pcat-1', tenantId, 'Electronics');
    const insertProduct = db.prepare("INSERT INTO products (id, tenant_id, category_id, name, sku, price, cost) VALUES (?, ?, ?, ?, ?, ?, ?)");
    insertProduct.run('prod-1', tenantId, 'pcat-1', 'Laptop Pro', 'LAP-001', 1500, 1000);
    insertProduct.run('prod-2', tenantId, 'pcat-1', 'Smartphone X', 'PHN-001', 800, 500);
    insertProduct.run('prod-3', tenantId, 'pcat-1', 'Wireless Earbuds', 'EAR-001', 150, 60);

    db.prepare("INSERT INTO warehouses (id, tenant_id, name, location) VALUES (?, ?, ?, ?)").run('wh-1', tenantId, 'Main Warehouse', 'Tashkent');
    const insertStock = db.prepare("INSERT INTO inventory_stock (id, tenant_id, product_id, warehouse_id, quantity) VALUES (?, ?, ?, ?, ?)");
    insertStock.run('stk-1', tenantId, 'prod-1', 'wh-1', 150);
    insertStock.run('stk-2', tenantId, 'prod-2', 'wh-1', 300);
    insertStock.run('stk-3', tenantId, 'prod-3', 'wh-1', 500);

    // 5. CRM Deals
    db.prepare("INSERT INTO customers (id, tenant_id, name, type) VALUES (?, ?, ?, ?)").run('cust-1', tenantId, 'Acme Corp', 'b2b');
    const insertDeal = db.prepare("INSERT INTO deals (id, tenant_id, customer_id, name, title, value, stage, expected_close_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    insertDeal.run('deal-1', tenantId, 'cust-1', 'Enterprise License', 'Enterprise License', 50000, 'negotiation', now.toISOString());
    insertDeal.run('deal-2', tenantId, 'cust-1', 'Support Package', 'Support Package', 12000, 'won', now.toISOString());
    insertDeal.run('deal-3', tenantId, 'cust-1', 'Consulting', 'Consulting', 8000, 'proposal', now.toISOString());
    
    console.log('Analytics data seeded successfully.');
  }

  // 6. AnalyticsData for Charts
  const checkAnalytics = db.prepare('SELECT count(*) as count FROM AnalyticsData').get() as { count: number };
  if (checkAnalytics.count === 0) {
    console.log('Seeding AnalyticsData...');
    const insertAnalytics = db.prepare("INSERT INTO AnalyticsData (tenant_id, module, metric, value, date) VALUES (?, ?, ?, ?, ?)");
    const now = new Date();
    for (let i = 0; i < 90; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Revenue
      const revValue = Math.floor(Math.random() * 20000) + 10000;
      insertAnalytics.run('default-tenant-id', 'revenue', 'amount', revValue, dateStr);
      
      // Expenses
      const expValue = Math.floor(Math.random() * 10000) + 5000;
      insertAnalytics.run('default-tenant-id', 'expenses', 'amount', expValue, dateStr);
      
      // Marketing ROI
      const roiValue = Math.floor(Math.random() * 200) + 100;
      insertAnalytics.run('default-tenant-id', 'marketing', 'roi', roiValue, dateStr);
    }
    console.log('AnalyticsData seeded successfully.');
  }

} catch (error) {
  console.error('Failed to initialize database:', error);
  db = {
    exec: () => {},
    prepare: () => ({
      run: () => ({ changes: 0, lastInsertRowid: 0n }),
      get: () => null,
      all: () => [],
    }),
  };
}

export default db;
