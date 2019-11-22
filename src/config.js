module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://dunder-mifflin@localhost/spaced-repetition',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
}
