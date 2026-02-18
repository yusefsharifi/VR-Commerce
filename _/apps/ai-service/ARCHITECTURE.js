/**
 * ========================================
 * PASSAGE 414 - AI SERVICE ARCHITECTURE
 * ========================================
 *
 * Comprehensive architecture documentation
 */

export const architecture = {
  systemOverview: `
    The AI Service is a modular microservice that operates independently
    from the core Passage 414 platform. It provides behavioral intelligence,
    recommendations, and insights without adding complexity to the main app.
    
    Key Design Principles:
    - Separation of Concerns: AI logic isolated from core business logic
    - Stateless Design: Horizontally scalable, no session state
    - Queue-Based Processing: Asynchronous event handling
    - Future-Proof: Ready for ML model integration
  `,

  components: {
    apiServer: {
      file: "server.js",
      port: 4000,
      role: "Exposes REST API for AI features",
      technology: "Node.js + Express",
      endpoints: [
        "/health - Health check",
        "/ai/recommendations/:userId - Get recommendations",
        "/ai/vendor-insights/:shopId - Get shop insights",
        "/ai/shop-score/:shopId - Get performance scores",
        "/ai/user-profile/:userId - Get AI profile",
        "/ai/process-user/:userId - Trigger processing",
        "/ai/category-leaderboard/:category - Get rankings",
      ],
    },

    eventProcessor: {
      file: "workers/eventProcessor.js",
      role: "Background worker that processes analytics events",
      functionality: [
        "Consumes events from Redis queue",
        "Updates user AI profiles",
        "Computes product affinities",
        "Calculates shop metrics",
        "Runs in batches every 30 seconds",
      ],
    },

    behaviorEngine: {
      file: "services/behaviorEngine.js",
      role: "Analyzes user behavior patterns",
      computes: {
        intentScore: "Purchase likelihood (0-1)",
        priceSensitivity: "Budget preference (low/medium/high)",
        favoriteCategory: "Most engaged category",
        purchaseProbability: "Conversion likelihood (0-1)",
      },
    },

    recommendationEngine: {
      file: "services/recommendationEngine.js",
      role: "Generates personalized recommendations",
      strategies: [
        "Affinity-based (40% weight) - Similar to viewed products",
        "Category-based (30% weight) - From favorite category",
        "Price-based (20% weight) - Matching price sensitivity",
        "Collaborative (10% weight) - Similar users' preferences",
      ],
    },

    vendorInsights: {
      file: "services/vendorInsights.js",
      role: "Provides actionable insights for shop owners",
      features: [
        "Conversion funnel analysis",
        "Product performance categorization",
        "Competitive price positioning",
        "Data-driven promotion suggestions",
      ],
    },

    trafficAnalysis: {
      file: "services/trafficAnalysis.js",
      role: "Computes shop performance metrics",
      metrics: {
        trafficScore: "Volume + growth + unique visitors (0-100)",
        engagementScore: "Views per visit + cart rate + returns (0-100)",
        categoryRanking: "Position within category",
      },
    },
  },

  dataFlow: {
    eventGeneration: `
      1. User action occurs (view product, add to cart, purchase)
      2. Core backend records event in analytics_events table
      3. Core backend pushes event to Redis queue
      4. Event includes: user_id, event_type, shop_id, product_id, timestamp
    `,

    eventProcessing: `
      1. Event processor polls Redis queue every 30 seconds
      2. Processes events in batches of 100
      3. For each event:
         a. Update product_affinities (if product interaction)
         b. Update user_ai_profiles (if important event)
         c. Update shop_ai_metrics (if shop visit)
      4. Scores are recalculated based on historical data
    `,

    apiRequest: `
      1. Frontend/Backend makes request to /api/ai/* endpoint
      2. Core backend proxies request to AI service
      3. AI service validates API key
      4. AI service queries database for relevant data
      5. AI service computes/retrieves scores
      6. Response sent back to client
    `,
  },

  databaseSchema: {
    userAIProfiles: {
      purpose: "Store behavioral intelligence for each user",
      updateFrequency: "On purchases, cart adds, or 10% of other events",
      retention: "Indefinite (for personalization)",
      indexes: ["user_id (unique)"],
    },

    productAffinities: {
      purpose: "Track user interest in specific products",
      updateFrequency: "Every product view, cart add, or purchase",
      retention: "Indefinite (for recommendations)",
      indexes: ["user_id", "product_id", "unique(user_id, product_id)"],
    },

    shopAIMetrics: {
      purpose: "Store computed shop performance metrics",
      updateFrequency: "On shop visits or 5% of other events",
      retention: "Indefinite (for rankings)",
      indexes: ["shop_id (unique)"],
    },
  },

  scalability: {
    horizontal: `
      The AI service is stateless and can be scaled horizontally:
      - Run multiple instances behind a load balancer
      - Each instance can handle requests independently
      - Database queries are optimized with indexes
      - No session state stored in memory
    `,

    vertical: `
      For single-instance optimization:
      - Increase BATCH_SIZE for faster processing
      - Decrease PROCESS_INTERVAL_MS for real-time updates
      - Add database read replicas for heavy queries
      - Use connection pooling for database efficiency
    `,

    queueScaling: `
      Redis queue can be scaled:
      - Use Redis Cluster for distributed queuing
      - Run multiple worker instances
      - Each worker processes different event types
      - Implement priority queues for important events
    `,
  },

  security: {
    authentication: `
      All AI service endpoints require X-API-Key header:
      - Key stored in environment variable
      - Validated in middleware/auth.js
      - Different key for each environment
    `,

    authorization: `
      Core backend proxy endpoints handle user authorization:
      - Users can only access their own recommendations
      - Vendors can only access their shop insights
      - Admins can access any data
    `,

    rateLimiting: `
      IP-based rate limiting prevents abuse:
      - General endpoints: 100 requests / 15 minutes
      - Compute-intensive: 20 requests / 15 minutes
      - Recommendations: 50 requests / 15 minutes
    `,

    sqlInjectionPrevention: `
      All database queries use parameterized queries via Neon SQL:
      - Template literals automatically escape values
      - No string concatenation for queries
      - Built-in protection against SQL injection
    `,
  },

  monitoring: {
    healthChecks: {
      endpoint: "GET /health",
      returns: {
        status: "healthy",
        service: "ai-service",
        timestamp: "ISO 8601",
      },
      monitoringFrequency: "Every 30 seconds",
      alertOn: "Non-200 response or timeout",
    },

    workerStats: {
      location: "Console logs from eventProcessor.js",
      metrics: [
        "processedCount - Total events processed",
        "errorCount - Failed processing attempts",
        "successRate - Percentage of successful processing",
      ],
    },

    databaseMetrics: {
      tables: ["user_ai_profiles", "product_affinities", "shop_ai_metrics"],
      metrics: ["Row count", "Table size", "Query performance"],
      tools: ["PostgreSQL pg_stat_statements", "Query explain plans"],
    },
  },

  futureEnhancements: {
    phase1_mlIntegration: {
      title: "Machine Learning Integration",
      timeline: "3-6 months",
      tasks: [
        "Collect sufficient training data (10k+ events)",
        "Train collaborative filtering model",
        "Train purchase prediction model",
        "Deploy ML inference service",
        "A/B test ML vs rule-based recommendations",
      ],
    },

    phase2_realTime: {
      title: "Real-Time Processing",
      timeline: "6-9 months",
      tasks: [
        "Implement streaming analytics (Kafka/RabbitMQ)",
        "Real-time recommendation updates",
        "Live shop performance dashboards",
        "WebSocket connections for live updates",
      ],
    },

    phase3_advanced: {
      title: "Advanced Features",
      timeline: "9-12 months",
      tasks: [
        "Natural language search",
        "Image-based product matching",
        "Dynamic pricing optimization",
        "Fraud detection",
        "Customer lifetime value prediction",
      ],
    },
  },

  migrationToML: {
    step1_dataCollection: `
      Continue collecting analytics events until you have:
      - 10,000+ user events
      - 1,000+ products with views
      - 500+ completed purchases
    `,

    step2_modelTraining: `
      Use Python for training (scikit-learn, TensorFlow, PyTorch):
      
      # Example: Train collaborative filtering model
      from sklearn.decomposition import TruncatedSVD
      
      # Load user-product interaction matrix
      interactions = load_interactions_from_db()
      
      # Train matrix factorization model
      model = TruncatedSVD(n_components=50)
      user_factors = model.fit_transform(interactions)
      
      # Save model
      joblib.dump(model, 'recommendation_model.pkl')
    `,

    step3_inferenceService: `
      Create separate Python Flask/FastAPI service:
      
      from fastapi import FastAPI
      import joblib
      
      app = FastAPI()
      model = joblib.load('recommendation_model.pkl')
      
      @app.get("/predict/{user_id}")
      async def predict(user_id: int):
          recommendations = model.predict(user_id)
          return {"recommendations": recommendations}
    `,

    step4_integrationUpdate: `
      Update services/recommendationEngine.js:
      
      async getMLRecommendations(userId) {
        const response = await fetch(\`http://ml-service:5000/predict/\${userId}\`);
        const data = await response.json();
        return data.recommendations;
      }
      
      async getRecommendations(userId, limit) {
        // Use ML if available, fallback to rule-based
        try {
          return await this.getMLRecommendations(userId);
        } catch (error) {
          return await this.getRuleBasedRecommendations(userId, limit);
        }
      }
    `,
  },
};

export default architecture;
