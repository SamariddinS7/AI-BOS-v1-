import db from '../db/settings.js';

export interface AuditLogEntry {
  user_id: string;
  action: string;
  module: string;
  ip_address: string;
  old_value?: any;
  new_value?: any;
}

export class AuditLogger {
  static log(entry: AuditLogEntry) {
    try {
      const stmt = db.prepare(`
        INSERT INTO AuditLog (user_id, action, module, ip_address, old_value, new_value)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        entry.user_id,
        entry.action,
        entry.module,
        entry.ip_address,
        entry.old_value ? JSON.stringify(entry.old_value) : null,
        entry.new_value ? JSON.stringify(entry.new_value) : null
      );
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  static getLogs(userId?: string, limit = 100) {
    try {
      if (userId) {
        return db.prepare('SELECT * FROM AuditLog WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?').all(userId, limit);
      }
      return db.prepare('SELECT * FROM AuditLog ORDER BY timestamp DESC LIMIT ?').all(limit);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }
}
