/**
 * Environment Variables Template
 * Copy this file to .env and fill in your values
 */

export const envTemplate = `
# Server Configuration
PORT=4000
NODE_ENV=development

# Database (Shared Postgres - same as core backend)
DATABASE_URL=postgresql://user:password@postgres:5432/passage414

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_QUEUE_NAME=analytics_events

# Security
AI_SERVICE_API_KEY=your-internal-api-key-here-change-in-production

# Core Backend URL (for REST API communication)
CORE_API_URL=http://backend:3000

# AI Processing Configuration
BATCH_SIZE=100
PROCESS_INTERVAL_MS=30000
`;

// Export for programmatic access
export const requiredEnvVars = ["DATABASE_URL", "AI_SERVICE_API_KEY"];

export const optionalEnvVars = {
  PORT: "4000",
  NODE_ENV: "development",
  REDIS_URL: "redis://localhost:6379",
  REDIS_QUEUE_NAME: "analytics_events",
  CORE_API_URL: "http://localhost:3000",
  BATCH_SIZE: "100",
  PROCESS_INTERVAL_MS: "30000",
};
