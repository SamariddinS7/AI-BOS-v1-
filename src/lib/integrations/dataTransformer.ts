export class DataTransformer {
  static transform(data: any, mappingRules: Record<string, string>) {
    const transformed: any = {};
    
    for (const [targetKey, sourcePath] of Object.entries(mappingRules)) {
      transformed[targetKey] = this.getValueByPath(data, sourcePath);
    }
    
    return transformed;
  }

  private static getValueByPath(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}

// Example:
// External CRM Format: { user: { full_name: "John Doe", contact: { email_addr: "john@example.com" } } }
// Mapping Rules: { name: "user.full_name", email: "user.contact.email_addr" }
// Result: { name: "John Doe", email: "john@example.com" }
