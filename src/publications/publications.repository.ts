import { Injectable } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicationsRepository {
  constructor(private readonly prisma: PrismaService) {

  }
  create(createPublicationDto: CreatePublicationDto) {
    return this.prisma.publication.create({
      data: createPublicationDto
    });
  }

  findAll(published?: boolean, after?: Date) {
    console.log("published repository", published);
    console.log("after repository", after);
    const currentDate = new Date();
    if (after && (published && published !== null)) {
      console.log(1)
      return this.prisma.publication.findMany({
        where: {
          date: {
            gt: after,
            lte: currentDate
          }
        }
      })
    }
    if (after && (!published && published !== null)) {
      console.log(2)
      return this.prisma.publication.findMany({
        where: {
          date: {
            gt: after,
            gte: currentDate
          }
        }
      })
    }
    else if (after && !published) {
      console.log(3)
      return this.prisma.publication.findMany({
        where: {
          date: {
            gt: after,
          }
        }
      })
    }
    else if (after === null && published === true) {
      console.log(4)
      return this.prisma.publication.findMany({
        where: {
          date: {
            lt: currentDate,
          }
        }
      })
    }
    else if (after === null && published === false) {
      console.log(5)
      return this.prisma.publication.findMany({
        where: {
          date: {
            gte: currentDate,
          }
        }
      })
    }
    else {
      console.log(6)
      return this.prisma.publication.findMany()
    };
  }

  findOne(id: number) {
    return this.prisma.publication.findFirst({
      where: {
        id
      }
    });
  }

  update(id: number, updatePublicationDto: UpdatePublicationDto) {
    return this.prisma.publication.update({
      data: updatePublicationDto,
      where: {
        id
      }
    });
  }

  checkPost(id: number) {
    return this.prisma.post.findFirst({
      where: {
        id
      }
    })
  }

  checkMedia(id: number) {
    return this.prisma.media.findFirst({
      where: {
        id
      }
    })
  }

  remove(id: number) {
    return this.prisma.publication.delete({
      where: {
        id
      }
    })
  }
}
