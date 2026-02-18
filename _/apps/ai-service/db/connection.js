import { neon } from "@neondatabase/serverless";
import config from "../config/index.js";

/**
 * Database connection using Neon serverless Postgres
 * Shared database with core backend, separate AI-specific tables
 */

const sql = config.database.url
  ? neon(config.database.url)
  : () => {
      throw new Error("DATABASE_URL environment variable is not set");
    };

/**
 * Initialize AI-specific database tables
 * Creates tables if they don't exist
 */
export async function initializeDatabase() {
  try {
    // User AI Profile table - stores behavioral intelligence scores
    await sql`
      CREATE TABLE IF NOT EXISTS user_ai_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        intent_score DECIMAL(3, 2) DEFAULT 0.00,
        price_sensitivity VARCHAR(20) DEFAULT 'medium',
        favorite_category TEXT,
        purchase_probability DECIMAL(3, 2) DEFAULT 0.00,
        total_events INTEGER DEFAULT 0,
        last_activity TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
      )
    `;

    // Product affinity tracking - what users are interested in
    await sql`
      CREATE TABLE IF NOT EXISTS product_affinities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        affinity_score DECIMAL(3, 2) DEFAULT 0.00,
        view_count INTEGER DEFAULT 0,
        last_viewed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )
    `;

    // Shop performance metrics - AI-computed insights
    await sql`
      CREATE TABLE IF NOT EXISTS shop_ai_metrics (
        id SERIAL PRIMARY KEY,
        shop_id INTEGER NOT NULL UNIQUE,
        traffic_score DECIMAL(5, 2) DEFAULT 0.00,
        engagement_score DECIMAL(5, 2) DEFAULT 0.00,
        conversion_rate DECIMAL(5, 4) DEFAULT 0.0000,
        category_ranking INTEGER,
        avg_session_duration INTEGER DEFAULT 0,
        bounce_rate DECIMAL(5, 4) DEFAULT 0.0000,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
      )
    `;

    // Create indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_ai_profiles_user 
      ON user_ai_profiles(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_product_affinities_user 
      ON product_affinities(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_product_affinities_product 
      ON product_affinities(product_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_shop_ai_metrics_shop 
      ON shop_ai_metrics(shop_id)
    `;

    console.log("✓ AI Service database tables initialized successfully");
  } catch (error) {
    console.error("✗ Database initialization error:", error);
    throw error;
  }
}

export default sql;
