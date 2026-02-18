/**
 * Simple rate limiting middleware
 * Tracks requests per IP address
 */

const requestCounts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > WINDOW_MS) {
      requestCounts.delete(key);
    }
  }
}

function createLimiter(max) {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    cleanupOldEntries();

    if (!requestCounts.has(clientId)) {
      requestCounts.set(clientId, {
        count: 1,
        resetTime: now,
      });
      return next();
    }

    const data = requestCounts.get(clientId);

    if (now - data.resetTime > WINDOW_MS) {
      data.count = 1;
      data.resetTime = now;
      return next();
    }

    if (data.count >= max) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
      });
    }

    data.count++;
    next();
  };
}

export const generalLimiter = createLimiter(100);
export const computeLimiter = createLimiter(20);
export const recommendationLimiter = createLimiter(50);
