const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
  points: 60, // 60 requests
  duration: 60, // per 60 seconds (1 minute)
});

const rateLimitMiddleware = (req, res, next) => {
  // Use user ID from authenticated request, or IP for unauthenticated routes like login
  const key = req.user ? req.user.id : req.ip;

  rateLimiter.consume(key)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ error: { code: 'RATE_LIMIT', message: 'Too many requests.' } });
    });
};

module.exports = rateLimitMiddleware;