# AI-BOS ↔ n8n Enterprise Integration

This module provides a secure, production-grade bridge between the AI-BOS platform and n8n workflow automation.

## Features

- **Secure Outbound Triggers**: AI-BOS can trigger n8n workflows securely using HMAC signatures (`X-AI-BOS-Signature`).
- **Secure Inbound Webhooks**: n8n can call back into AI-BOS with signature verification (`X-N8N-Signature`) and timestamp validation to prevent replay attacks.
- **Circuit Breaker**: Automatically stops outbound requests if n8n becomes unresponsive, preventing cascading failures.
- **Event Mapping**: Configurable mapping between internal AI-BOS events (e.g., `marketing.roi_drop`) and specific n8n workflow IDs.

## Configuration

The integration is configured via the `N8NIntegrationConfig` interface:

```typescript
interface N8NIntegrationConfig {
  instanceUrl: string; // URL of your n8n instance
  webhookSecret: string; // Shared secret for HMAC
  apiKeyHash: string; // Hashed API key for authentication
  // ...
}
```

## Usage

### Triggering n8n from AI-BOS

```typescript
import { N8NService } from './lib/n8n-integration/N8NService';

// Dispatch an event
await n8nService.dispatchEvent('marketing.roi_drop', {
  campaignId: '123',
  currentRoi: 0.15,
  threshold: 0.20
});
```

### Receiving Webhooks from n8n

Configure your n8n HTTP Request node to:
1.  **Method**: POST
2.  **URL**: `https://your-ai-bos-url/api/integrations/n8n/webhook`
3.  **Headers**:
    *   `X-N8N-Signature`: HMAC-SHA256 of the body using the shared secret.
    *   `X-N8N-Timestamp`: ISO 8601 timestamp.

## Security

- **HMAC Signatures**: All payloads are signed to ensure integrity and authenticity.
- **Replay Protection**: Timestamps are checked with a 5-minute window.
- **Circuit Breaker**: Fails fast after 5 consecutive errors.
