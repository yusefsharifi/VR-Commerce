/**
 * ========================================
 * PASSAGE 414 - AI SERVICE SETUP GUIDE
 * ========================================
 *
 * This guide will help you set up and run the AI microservice
 */

export const setupGuide = {
  title: "Passage 414 AI Service - Complete Setup Guide",

  overview: `
    The AI Service is a separate microservice that provides:
    - Behavioral intelligence and user profiling
    - Personalized product recommendations
    - Vendor insights and analytics
    - Shop performance scoring
    - Traffic analysis and ranking
  `,

  prerequisites: `
    1. Node.js 18+ installed
    2. PostgreSQL database (shared with core backend)
    3. Redis server (for event queue) - optional for development
    4. Core Passage 414 backend running
  `,

  quickStart: {
    step1_installDependencies: `
      cd apps/ai-service
      npm install express cors dotenv @neondatabase/serverless
    `,

    step2_createPackageJson: `
      Create package.json with:
      {
        "name": "passage414-ai-service",
        "version": "1.0.0",
        "type": "module",
        "scripts": {
          "start": "node server.js",
          "dev": "node --watch server.js",
          "worker": "node workers/eventProcessor.js"
        },
        "dependencies": {
          "express": "^4.18.2",
          "cors": "^2.8.5",
          "dotenv": "^16.3.1",
          "@neondatabase/serverless": "^0.9.0"
        }
      }
    `,

    step3_setupEnvironment: `
      Create .env file with:
      
      PORT=4000
      NODE_ENV=development
      DATABASE_URL=your-postgres-connection-string
      AI_SERVICE_API_KEY=your-secure-api-key
    `,

    step4_runService: `
      # Start the API server
      npm start
      
      # Or in development mode with auto-reload
      npm run dev
      
      # In a separate terminal, start the event processor
      npm run worker
    `,

    step5_testEndpoints: `
      # Check health
      curl http://localhost:4000/health
      
      # Get recommendations (requires API key)
      curl -H "X-API-Key: your-api-key" http://localhost:4000/ai/recommendations/1
    `,
  },

  coreBackendIntegration: {
    step1_addEnvironmentVars: `
      Add to core backend .env:
      
      AI_SERVICE_URL=http://localhost:4000
      AI_SERVICE_API_KEY=your-secure-api-key
    `,

    step2_useProxyEndpoints: `
      Core backend proxy endpoints are already created:
      
      GET /api/ai/recommendations/:userId
      GET /api/ai/vendor-insights/:shopId
      GET /api/ai/shop-score/:shopId
      GET /api/ai/leaderboard/:category
      
      Example frontend usage:
      const response = await fetch('/api/ai/recommendations/' + userId);
      const { recommendations } = await response.json();
    `,
  },

  apiEndpoints: {
    health: {
      method: "GET",
      path: "/health",
      auth: "None",
      description: "Health check endpoint",
      example: "curl http://localhost:4000/health",
    },

    recommendations: {
      method: "GET",
      path: "/ai/recommendations/:userId",
      auth: "Required (X-API-Key header)",
      params: "?limit=5 (optional)",
      description: "Get personalized product recommendations",
      example:
        'curl -H "X-API-Key: key" http://localhost:4000/ai/recommendations/123?limit=5',
    },

    vendorInsights: {
      method: "GET",
      path: "/ai/vendor-insights/:shopId",
      auth: "Required (X-API-Key header)",
      description: "Get comprehensive shop insights",
      example:
        'curl -H "X-API-Key: key" http://localhost:4000/ai/vendor-insights/456',
    },

    shopScore: {
      method: "GET",
      path: "/ai/shop-score/:shopId",
      auth: "Required (X-API-Key header)",
      description: "Get traffic and engagement scores",
      example:
        'curl -H "X-API-Key: key" http://localhost:4000/ai/shop-score/456',
    },

    userProfile: {
      method: "GET",
      path: "/ai/user-profile/:userId",
      auth: "Required (X-API-Key header)",
      description: "Get user AI profile",
      example:
        'curl -H "X-API-Key: key" http://localhost:4000/ai/user-profile/123',
    },

    processUser: {
      method: "POST",
      path: "/ai/process-user/:userId",
      auth: "Required (X-API-Key header)",
      description: "Manually trigger user behavior processing",
      example:
        'curl -X POST -H "X-API-Key: key" http://localhost:4000/ai/process-user/123',
    },

    leaderboard: {
      method: "GET",
      path: "/ai/category-leaderboard/:category",
      auth: "Required (X-API-Key header)",
      params: "?limit=10 (optional)",
      description: "Get shop rankings for category",
      example:
        'curl -H "X-API-Key: key" http://localhost:4000/ai/category-leaderboard/Jewelry',
    },
  },

  databaseTables: {
    userAIProfiles: {
      name: "user_ai_profiles",
      description: "Stores AI-computed user behavior scores",
      columns: {
        id: "Serial primary key",
        user_id: "Foreign key to auth_users",
        intent_score: "Purchase intent (0-1)",
        price_sensitivity: "low, medium, or high",
        favorite_category: "Most viewed category",
        purchase_probability: "Conversion likelihood (0-1)",
        total_events: "Total analytics events",
        last_activity: "Last event timestamp",
        updated_at: "Profile update timestamp",
      },
    },

    productAffinities: {
      name: "product_affinities",
      description: "Tracks user interest in specific products",
      columns: {
        id: "Serial primary key",
        user_id: "Foreign key to auth_users",
        product_id: "Foreign key to products",
        affinity_score: "Interest level (0-1)",
        view_count: "Number of times viewed",
        last_viewed: "Last view timestamp",
      },
    },

    shopAIMetrics: {
      name: "shop_ai_metrics",
      description: "AI-computed shop performance metrics",
      columns: {
        id: "Serial primary key",
        shop_id: "Foreign key to shops",
        traffic_score: "Traffic performance (0-100)",
        engagement_score: "Engagement quality (0-100)",
        conversion_rate: "Visit to purchase rate",
        category_ranking: "Rank within category",
        updated_at: "Metrics update timestamp",
      },
    },
  },

  architectureDesign: {
    statelessDesign: `
      The AI service is completely stateless. Each request is independent,
      allowing horizontal scaling. Session state is stored in the database.
    `,

    queueBasedProcessing: `
      Analytics events are pushed to a queue (Redis in production, in-memory for dev).
      The background worker processes events asynchronously without blocking requests.
    `,

    separateDatabase: `
      AI service uses the same Postgres instance but separate tables:
      - user_ai_profiles
      - product_affinities
      - shop_ai_metrics
      
      This prevents locks on core tables and allows independent scaling.
    `,

    futureMLIntegration: `
      Current implementation uses rule-based algorithms (no ML libraries).
      To add ML:
      1. Replace scoring functions with ML model inference
      2. Train models on historical data
      3. Deploy as separate inference services
      4. Update service layer to call ML endpoints
    `,
  },

  productionDeployment: {
    docker: `
      The AI service includes Dockerfile and docker-compose.yml.
      
      To run with Docker:
      docker-compose up -d
      
      This will start:
      - ai-service (API server on port 4000)
      - ai-worker (background event processor)
      - redis (event queue)
    `,

    environmentVariables: `
      Required in production:
      - DATABASE_URL: PostgreSQL connection string
      - AI_SERVICE_API_KEY: Secure random key
      - REDIS_URL: Redis connection string
      
      Optional:
      - PORT: API server port (default: 4000)
      - NODE_ENV: production
      - BATCH_SIZE: Events per batch (default: 100)
      - PROCESS_INTERVAL_MS: Processing interval (default: 30000)
    `,

    monitoring: `
      Health check endpoint: GET /health
      Returns 200 OK if service is healthy
      
      Set up monitoring to:
      - Check /health every 30 seconds
      - Alert if response is not 200
      - Monitor worker logs for processing stats
    `,
  },

  troubleshooting: {
    databaseConnectionError: `
      Error: Database connection failed
      
      Solution:
      1. Verify DATABASE_URL is correct
      2. Check PostgreSQL is running
      3. Ensure database exists
      4. Verify network connectivity
    `,

    redisConnectionError: `
      Error: Redis connection failed
      
      Solution:
      1. Verify REDIS_URL is correct
      2. Check Redis server is running
      3. For development, in-memory queue is used automatically
    `,

    noRecommendations: `
      Issue: Recommendations endpoint returns empty array
      
      Causes:
      1. User has no analytics events
      2. No products in database
      3. Products have stock = 0
      
      Solution:
      - Generate test analytics events
      - Ensure products exist with stock > 0
      - Manually process user: POST /ai/process-user/:userId
    `,

    rateLimitError: `
      Error: 429 Too Many Requests
      
      Solution:
      - Wait 15 minutes for rate limit to reset
      - Or increase limits in middleware/rateLimit.js
    `,
  },

  exampleUsage: {
    frontendRecommendations: `
      // In a React component
      import { useEffect, useState } from 'react';
      
      function ProductRecommendations({ userId }) {
        const [recommendations, setRecommendations] = useState([]);
        
        useEffect(() => {
          async function fetchRecommendations() {
            try {
              const res = await fetch(\`/api/ai/recommendations/\${userId}\`);
              const data = await res.json();
              setRecommendations(data.recommendations);
            } catch (error) {
              console.error('Failed to fetch recommendations:', error);
            }
          }
          
          fetchRecommendations();
        }, [userId]);
        
        return (
          <div>
            <h2>Recommended for You</h2>
            {recommendations.map(product => (
              <div key={product.id}>
                <h3>{product.name}</h3>
                <p>{product.base_price_irr} IRR</p>
              </div>
            ))}
          </div>
        );
      }
    `,

    vendorDashboardInsights: `
      // In vendor dashboard
      import { useEffect, useState } from 'react';
      
      function VendorInsights({ shopId }) {
        const [insights, setInsights] = useState(null);
        
        useEffect(() => {
          async function fetchInsights() {
            try {
              const res = await fetch(\`/api/ai/vendor-insights/\${shopId}\`);
              const data = await res.json();
              setInsights(data.insights);
            } catch (error) {
              console.error('Failed to fetch insights:', error);
            }
          }
          
          fetchInsights();
        }, [shopId]);
        
        if (!insights) return <div>Loading insights...</div>;
        
        return (
          <div>
            <h2>Shop Insights</h2>
            
            <section>
              <h3>Conversion Metrics</h3>
              <p>Conversion Rate: {insights.conversion.conversionRate}%</p>
              <p>Total Visits: {insights.conversion.visits}</p>
            </section>
            
            <section>
              <h3>Product Performance</h3>
              <p>High Performers: {insights.products.highPerformers.length}</p>
              <p>Needs Attention: {insights.products.needsAttention.length}</p>
            </section>
            
            <section>
              <h3>Pricing Analysis</h3>
              <p>Positioning: {insights.pricing.positioning}</p>
              <p>Suggestion: {insights.pricing.suggestion}</p>
            </section>
            
            <section>
              <h3>Promotion Suggestions</h3>
              {insights.promotions.map((promo, i) => (
                <div key={i}>
                  <h4>{promo.title}</h4>
                  <p>{promo.description}</p>
                  <p>Expected Impact: {promo.expectedImpact}</p>
                </div>
              ))}
            </section>
          </div>
        );
      }
    `,
  },

  nextSteps: {
    step1: "Set up Redis in production for reliable event queuing",
    step2: "Monitor AI service performance and adjust scoring weights",
    step3: "Collect more analytics data for better recommendations",
    step4: "Train ML models on historical data",
    step5: "Replace rule-based algorithms with ML inference",
    step6: "Add A/B testing for recommendation strategies",
    step7: "Implement real-time streaming analytics",
  },
};

// Log guide to console for easy access
console.log("AI Service Setup Guide loaded!");
console.log('Access via: import { setupGuide } from "./SETUP-GUIDE.js"');
