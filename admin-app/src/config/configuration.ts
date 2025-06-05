export default () => ({
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'health_blog_admin',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'health-blog-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
