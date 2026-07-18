import prisma from '../db/prisma.js';

export interface AuditLogEntry {
  user_id: string;
  action: string;
  module: string;
  ip_address: string;
  old_value?: any;
  new_value?: any;
}

export class AuditLogger {
  static async log(entry: AuditLogEntry) {
    try {
      await prisma.legacyAuditLog.create({
        data: {
          user_id: entry.user_id,
          action: entry.action,
          module: entry.module,
          ip_address: entry.ip_address,
          old_value: entry.old_value ? JSON.stringify(entry.old_value) : null,
          new_value: entry.new_value ? JSON.stringify(entry.new_value) : null,
        }
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  static async getLogs(userId?: string, limit = 100) {
    try {
      if (userId) {
        return await prisma.legacyAuditLog.findMany({
          where: { user_id: userId },
          orderBy: { timestamp: 'desc' },
          take: limit,
        });
      }
      return await prisma.legacyAuditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }
}
