import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { CloudinaryModule } from './cloudinary/cloudinary.module.js';
import { PostsModule } from './posts/posts.module.js';
// ==================================================
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('SECRET_KEY'),
        signOptions: { expiresIn: '7d' },
      }),
    }),

    CloudinaryModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
})
export class AppModule {}
