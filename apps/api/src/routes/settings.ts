import { Router } from 'express';
import prisma from '../lib/db/prisma.js';
import { AuditLogger } from '../lib/audit/logger.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Settings accessible to all authenticated users; write ops handled per-route
router.use(requireAuth, requireRole(['VIEWER']));

// --- User Settings ---
router.get('/user', async (req: any, res) => {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { user_id: req.user.id },
    });
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/user', async (req: any, res) => {
  try {
    const {
      theme, font_size, primary_color, language, timezone, date_format, number_format, currency_format,
      compact_mode, animations_enabled, high_contrast, large_cursor, focus_highlight, screen_reader_optimized
    } = req.body;

    const oldSettings = await prisma.userSettings.findUnique({
      where: { user_id: req.user.id },
    });

    await prisma.userSettings.update({
      where: { user_id: req.user.id },
      data: {
        theme, font_size, primary_color, language, timezone,
        date_format, number_format, currency_format,
        compact_mode, animations_enabled,
        high_contrast, large_cursor, focus_highlight, screen_reader_optimized,
        updated_at: new Date(),
      },
    });

    AuditLogger.log({
      user_id: req.user.id,
      action: 'Umumiy sozlamalar yangilandi',
      module: 'GeneralSettings',
      ip_address: req.user.ip,
      old_value: oldSettings,
      new_value: req.body,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Notification Settings ---
router.get('/notifications', async (req: any, res) => {
  try {
    const settings = await prisma.notificationSettings.findUnique({
      where: { user_id: req.user.id },
    });
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications', async (req: any, res) => {
  try {
    const {
      email_enabled, sms_enabled, push_enabled, marketing_alerts,
      financial_alerts, ai_alerts, system_alerts, ai_alerts_critical_only
    } = req.body;

    const oldSettings = await prisma.notificationSettings.findUnique({
      where: { user_id: req.user.id },
    });

    await prisma.notificationSettings.update({
      where: { user_id: req.user.id },
      data: {
        email_enabled, sms_enabled, push_enabled, marketing_alerts,
        financial_alerts, ai_alerts, system_alerts, ai_alerts_critical_only,
        updated_at: new Date(),
      },
    });

    AuditLogger.log({
      user_id: req.user.id,
      action: 'Bildirishnomalar sozlamalari yangilandi',
      module: 'NotificationSettings',
      ip_address: req.user.ip,
      old_value: oldSettings,
      new_value: req.body,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Security Settings ---
router.get('/security', async (req: any, res) => {
  try {
    const settings = await prisma.securitySettings.findUnique({
      where: { user_id: req.user.id },
    }) as any;

    if (!settings) {
      return res.json({
        two_factor_enabled: false,
        biometric_enabled: false,
        session_timeout_minutes: 30,
        login_alert_enabled: true,
        allowed_ips: [],
      });
    }

    res.json({
      ...settings,
      allowed_ips: JSON.parse(settings.allowed_ips || '[]'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/security', async (req: any, res) => {
  try {
    const { two_factor_enabled, biometric_enabled, session_timeout_minutes, login_alert_enabled, allowed_ips } = req.body;

    const oldSettings = await prisma.securitySettings.findUnique({
      where: { user_id: req.user.id },
    });

    await prisma.securitySettings.upsert({
      where: { user_id: req.user.id },
      update: {
        two_factor_enabled,
        biometric_enabled,
        session_timeout_minutes,
        login_alert_enabled,
        allowed_ips: JSON.stringify(allowed_ips || []),
        updated_at: new Date(),
      },
      create: {
        user_id: req.user.id,
        two_factor_enabled,
        biometric_enabled,
        session_timeout_minutes,
        login_alert_enabled,
        allowed_ips: JSON.stringify(allowed_ips || []),
      },
    });

    AuditLogger.log({
      user_id: req.user.id,
      action: 'Xavfsizlik sozlamalari yangilandi',
      module: 'SecuritySettings',
      ip_address: req.user.ip,
      old_value: oldSettings,
      new_value: req.body,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Session Management ---
router.get('/sessions', async (req: any, res) => {
  try {
    const sessions = await prisma.sessionLog.findMany({
      where: { user_id: req.user.id },
      orderBy: { last_activity: 'desc' },
    });
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/sessions/:id', async (req: any, res) => {
  try {
    await prisma.sessionLog.delete({
      where: { id: req.params.id, user_id: req.user.id },
    });

    AuditLogger.log({
      user_id: req.user.id,
      action: 'Sessiya to\'xtatildi',
      module: 'SessionManagement',
      ip_address: req.user.ip,
      old_value: { session_id: req.params.id },
      new_value: null,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Integration Settings ---
router.get('/integrations', async (req: any, res) => {
  try {
    const settings = await prisma.integrationSettings.findUnique({
      where: { user_id: req.user.id },
    });
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/integrations', async (req: any, res) => {
  try {
    const { n8n_url, n8n_api_key, webhook_secret } = req.body;

    const oldSettings = await prisma.integrationSettings.findUnique({
      where: { user_id: req.user.id },
    });

    await prisma.integrationSettings.update({
      where: { user_id: req.user.id },
      data: {
        n8n_url,
        n8n_api_key,
        webhook_secret,
        updated_at: new Date(),
      },
    });

    AuditLogger.log({
      user_id: req.user.id,
      action: 'Integratsiya sozlamalari yangilandi',
      module: 'IntegrationSettings',
      ip_address: req.user.ip,
      old_value: oldSettings,
      new_value: req.body,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Audit Logs ---
router.get('/audit', async (req: any, res) => {
  try {
    const logs = await AuditLogger.getLogs(req.user.id);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
