import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { getDatabaseConfig } from './config/database.config';

// Entities
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { BlogPost } from './entities/blog-post.entity';

// Services
import { UserService } from './services/user.service';
import { CategoryService } from './services/category.service';
import { TagService } from './services/tag.service';
import { BlogPostService } from './services/blog-post.service';
import { AuthService } from './services/auth.service';
import { SeedService } from './services/seed.service';

// Controllers
import { UserController } from './controllers/user.controller';
import { CategoryController } from './controllers/category.controller';
import { TagController } from './controllers/tag.controller';
import { BlogPostController } from './controllers/blog-post.controller';
import { AuthController } from './controllers/auth.controller';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Category, Tag, BlogPost]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'health-blog-secret-key'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d') 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AppController,
    UserController,
    CategoryController,
    TagController,
    BlogPostController,
    AuthController,
  ],
  providers: [
    AppService,
    UserService,
    CategoryService,
    TagService,
    BlogPostService,
    AuthService,
    SeedService,
    JwtStrategy,
  ],
})
export class AppModule {}
