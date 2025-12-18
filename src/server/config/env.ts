import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(() => 3000),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(Number).default(() => 12),
  
  // Email (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // Payment
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  
  // File Upload
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default(() => 5242880),
  ALLOWED_IMAGE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(() => 900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(() => 100),
  
  // Platform
  PLATFORM_FEE_PERCENTAGE: z.string().transform(Number).default(() => 5),
  FREE_PLAN_MAX_EVENTS: z.string().transform(Number).default(() => 3),
  FREE_PLAN_MAX_ATTENDEES: z.string().transform(Number).default(() => 50),
  PREMIUM_PLAN_PRICE: z.string().transform(Number).default(() => 29900),
  PRO_PLAN_PRICE: z.string().transform(Number).default(() => 59900),
  
  // Monitoring (Optional)
  SENTRY_DSN: z.string().optional(),
  GA_MEASUREMENT_ID: z.string().optional(),
});

// Validate and export environment
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment validation passed');
    return env;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.issues.forEach((err: any) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    console.error('\n💡 Check your .env file and ensure all required variables are set');
    process.exit(1);
  }
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;