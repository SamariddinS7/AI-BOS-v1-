import { Router } from 'express';
import db from '../lib/db/settings.js';
import { AuditLogger } from '../lib/audit/logger.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// --- User Settings ---
router.get('/user', (req: any, res) => {
  try {
    const settings = db.prepare('SELECT * FROM UserSettings WHERE user_id = ?').get(req.user.id);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/user', (req: any, res) => {
  try {
    const { 
      theme, font_size, primary_color, language, timezone, date_format, number_format, currency_format,
      compact_mode, animations_enabled, high_contrast, large_cursor, focus_highlight, screen_reader_optimized 
    } = req.body;
    
    const oldSettings = db.prepare('SELECT * FROM UserSettings WHERE user_id = ?').get(req.user.id);

    db.prepare(`
      UPDATE UserSettings SET
        theme = ?, font_size = ?, primary_color = ?, language = ?, timezone = ?,
        date_format = ?, number_format = ?, currency_format = ?, compact_mode = ?, animations_enabled = ?,
        high_contrast = ?, large_cursor = ?, focus_highlight = ?, screen_reader_optimized = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      theme, font_size, primary_color, language, timezone, date_format, number_format, currency_format,
      compact_mode ? 1 : 0, animations_enabled ? 1 : 0, 
      high_contrast ? 1 : 0, large_cursor ? 1 : 0, focus_highlight ? 1 : 0, screen_reader_optimized ? 1 : 0,
      req.user.id
    );
    
    AuditLogger.log({
      user_id: req.user.id,
      action: 'Umumiy sozlamalar yangilandi',
      module: 'GeneralSettings',
      ip_address: req.user.ip,
      old_value: oldSettings,
      new_value: req.body
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Notification Settings ---
router.get('/notifications', (req: any, res) => {
  try {
    const settings = db.prepare('SELECT * FROM NotificationSettings WHERE user_id = ?').get(req.user.id);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications', (req: any, res) => {
  try {
    const { email_enabled, sms_enabled, push_enabled, marketing_alerts, financial_alerts, ai_alerts, system_alerts, ai_alerts_critical_only } = req.body;
    
    const oldSettings = db.prepare('SELECT * FROM NotificationSettings WHERE user_id = ?').get(req.user.id);

    db.prepare(`
      UPDATE NotificationSettings SET
        email_enabled = ?, sms_enabled = ?, push_enabled = ?, marketing_alerts = ?,
        financial_alerts = ?, ai_alerts = ?, system_alerts = ?, ai_alerts_critical_only = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      email_enabled ? 1 : 0, sms_enabled ? 1 : 0, push_enabled ? 1 : 0, marketing_alerts ? 1 : 0,
      financial_alerts ? 1 : 0, ai_alerts ? 1 : 0, system_alerts ? 1 : 0, ai_alerts_critical_only ? 1 : 0, req.user.id
    );
    
    AuditLogger.log({
      user_id: req.user.id,
      action: 'Bildirishnomalar sozlamalari yangilandi',
      module: 'NotificationSettings',
      ip_address: req.user.ip,
      old_value: oldSettings,
      new_value: req.body
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Security Settings ---
router.get('/security', (req: any, res) => {
  try {
    const settings = db.prepare('SELECT * FROM SecuritySettings WHERE user_id = ?').get(req.user.id) as any;
    if (!settings) {
      return res.json({
        two_factor_enabled: false,
        biometric_enabled: false,
        session_timeout_minutes: 30,
        login_alert_enabled: true,
        allowed_ips: []
      });
    }
    res.json({
      ...settings,
      allowed_ips: JSON.parse(settings.allowed_ips || '[]')
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/security', (req: any, res) => {
  try {
    const { two_factor_enabled, biometric_enabled, session_timeout_minutes, login_alert_enabled, allowed_ips } = req.body;
    
    const oldSettings = db.prepare('SELECT * FROM SecuritySettings WHERE user_id = ?').get(req.user.id);

    db.prepare(`
      INSERT INTO SecuritySettings (
        user_id, two_factor_enabled, biometric_enabled, session_timeout_minutes, login_alert_enabled, allowed_ips
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        two_factor_enabled = excluded.two_factor_enabled,
        biometric_enabled = excluded.biometric_enabled,
        session_timeout_minutes = excluded.session_timeout_minutes,
        login_alert_enabled = excluded.login_alert_enabled,
        allowed_ips = excluded.allowed_ips,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      req.user.id, two_factor_enabled ? 1 : 0, biometric_enabled ? 1 : 0, session_timeout_minutes,
      login_alert_enabled ? 1 : 0, JSON.stringify(allowed_ips || [])
    );
    
    AuditLogger.log({
      user_id: req.user.id,
      action: 'Xavfsizlik sozlamalari yangilandi',
      module: 'SecuritySettings',
      ip_address: req.user.ip,
      old_value: oldSettings,
      new_value: req.body
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Session Management ---
router.get('/sessions', (req: any, res) => {
  try {
    const sessions = db.prepare('SELECT * FROM SessionLog WHERE user_id = ? ORDER BY last_activity DESC').all(req.user.id);
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/sessions/:id', (req: any, res) => {
  try {
    db.prepare('DELETE FROM SessionLog WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    
    AuditLogger.log({
      user_id: req.user.id,
      action: 'Sessiya to\'xtatildi',
      module: 'SessionManagement',
      ip_address: req.user.ip,
      old_value: { session_id: req.params.id },
      new_value: null
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Integration Settings ---
router.get('/integrations', (req: any, res) => {
  try {
    const settings = db.prepare('SELECT * FROM IntegrationSettings WHERE user_id = ?').get(req.user.id);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/integrations', (req: any, res) => {
  try {
    const { n8n_url, n8n_api_key, webhook_secret } = req.body;
    
    const oldSettings = db.prepare('SELECT * FROM IntegrationSettings WHERE user_id = ?').get(req.user.id);

    db.prepare(`
      UPDATE IntegrationSettings SET
        n8n_url = ?, n8n_api_key = ?, webhook_secret = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      n8n_url, n8n_api_key, webhook_secret, req.user.id
    );
    
    AuditLogger.log({
      user_id: req.user.id,
      action: 'Integratsiya sozlamalari yangilandi',
      module: 'IntegrationSettings',
      ip_address: req.user.ip,
      old_value: oldSettings,
      new_value: req.body
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Audit Logs ---
router.get('/audit', (req: any, res) => {
  try {
    const logs = AuditLogger.getLogs(req.user.id);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
