import prisma from '../db/prisma.js';

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
    return await prisma.plugin.findMany({ where: { status: 'active' } });
  }

  static async installPlugin(metadata: PluginMetadata) {
    await prisma.plugin.create({
      data: {
        id: metadata.id,
        name: metadata.name,
        description: metadata.description,
        version: metadata.version,
        author: metadata.author,
        permissions: JSON.stringify(metadata.permissions),
        config_schema: JSON.stringify(metadata.configSchema),
        status: 'active',
      }
    });
  }

  static async uninstallPlugin(id: string) {
    await prisma.plugin.delete({ where: { id } });
  }

  static async updatePluginStatus(id: string, status: 'active' | 'inactive') {
    await prisma.plugin.update({ where: { id }, data: { status } });
  }
}
