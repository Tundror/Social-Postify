import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediasRepository {
  constructor(private readonly prisma: PrismaService) {
    
  }
  create(createMediaDto: CreateMediaDto) {
    return this.prisma.media.create({
      data: createMediaDto
    })
  }


  findAllWithoutId () {
    return this.prisma.media.findMany({
      select: {
        title: true,
        username: true
      }
    })
  }

  checkPublications (id: number) {
    return this.prisma.publication.findFirst({
      where: {
        mediaId: id
      }
    })
  }

  findAll() {
    return this.prisma.media.findMany();
  }

  findOne(id: number) {
    return this.prisma.media.findFirst({
      where: {
        id
      }
    });
  }

  update(id: number, updateMediaDto: UpdateMediaDto) {
    return this.prisma.media.update({
      data: updateMediaDto,
      where: {
        id
      }

    })
  }

  remove(id: number) {
    return this.prisma.media.delete({
      where: {
        id
      }
    });
  }
}
