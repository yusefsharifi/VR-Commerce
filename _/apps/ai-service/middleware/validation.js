/**
 * Request validation middleware
 * Simple validation without external dependencies
 */

export const validateUserId = (req, res, next) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({
      error: "Validation error",
      message: "Invalid user ID",
    });
  }

  req.validatedUserId = userId;
  next();
};

export const validateShopId = (req, res, next) => {
  const shopId = parseInt(req.params.shopId);

  if (isNaN(shopId) || shopId <= 0) {
    return res.status(400).json({
      error: "Validation error",
      message: "Invalid shop ID",
    });
  }

  req.validatedShopId = shopId;
  next();
};

export const validateEventData = (eventData) => {
  if (!eventData || typeof eventData !== "object") {
    return { error: { details: [{ message: "Invalid event data" }] } };
  }

  if (!eventData.event_type || typeof eventData.event_type !== "string") {
    return {
      error: {
        details: [{ message: "event_type is required and must be a string" }],
      },
    };
  }

  return { value: eventData };
};
