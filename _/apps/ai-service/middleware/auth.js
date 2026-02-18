import config from "../config/index.js";

/**
 * API Key Authentication Middleware
 * Validates internal API key for secure service-to-service communication
 */
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "API key is required",
    });
  }

  if (apiKey !== config.apiKey) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Invalid API key",
    });
  }

  next();
};

/**
 * Optional API Key Middleware (for internal requests)
 * Allows requests from internal services without API key
 */
export const optionalApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  // If API key is provided, validate it
  if (apiKey && apiKey !== config.apiKey) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Invalid API key",
    });
  }

  // Mark request as authenticated if valid API key
  req.isAuthenticated = apiKey === config.apiKey;
  next();
};
