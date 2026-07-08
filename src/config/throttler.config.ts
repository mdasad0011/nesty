import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => ({
  ttl: process.env.THROTTLE_TTL ? parseInt(process.env.THROTTLE_TTL, 10) : 60,
  limit: process.env.THROTTLE_LIMIT
    ? parseInt(process.env.THROTTLE_LIMIT, 10)
    : 10,
}));
