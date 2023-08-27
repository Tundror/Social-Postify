import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicationsModule } from './publications/publications.module';
import { PostsModule } from './posts/posts.module';
import { MediasModule } from './medias/medias.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PublicationsModule, PostsModule, MediasModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
