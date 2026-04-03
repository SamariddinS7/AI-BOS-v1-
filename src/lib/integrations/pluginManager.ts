import db from '../db/settings';

export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  permissions: string[];
  configSchema: any;
}

export class PluginManager {
  static async getActivePlugins() {
    return db.prepare('SELECT * FROM Plugins WHERE status = "active"').all();
  }

  static async installPlugin(metadata: PluginMetadata) {
    db.prepare(`
      INSERT INTO Plugins (id, name, description, version, author, permissions, config_schema, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(
      metadata.id,
      metadata.name,
      metadata.description,
      metadata.version,
      metadata.author,
      JSON.stringify(metadata.permissions),
      JSON.stringify(metadata.configSchema)
    );
  }

  static async uninstallPlugin(id: string) {
    db.prepare('DELETE FROM Plugins WHERE id = ?').run(id);
  }

  static async updatePluginStatus(id: string, status: 'active' | 'inactive') {
    db.prepare('UPDATE Plugins SET status = ? WHERE id = ?').run(status, id);
  }
}
