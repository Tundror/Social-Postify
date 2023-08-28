import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe())
    prisma = app.get(PrismaService)

    await prisma.publication.deleteMany()
    await prisma.media.deleteMany()
    await prisma.post.deleteMany()

    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('I’m okay!');
  });
  describe('media tests', () => {
    describe('post media tests', () => {
      it('should create media', async () => {
        await request(app.getHttpServer())
          .post('/medias')
          .send({
            title: "test",
            username: "user"
          })
          .expect(HttpStatus.CREATED)
      })

      it('should return error 409 conflict when trying to create dupes', async () => {
        await request(app.getHttpServer())
          .post('/medias')
          .send({
            title: "test",
            username: "user"
          })

        await request(app.getHttpServer())
          .post('/medias')
          .send({
            title: "test",
            username: "user"
          })
          .expect(HttpStatus.CONFLICT)

      })
      it('should return error 400 when body is incorrect', async () => {
        await request(app.getHttpServer())
          .post('/medias')
          .send({
            title: "test"
          })
          .expect(HttpStatus.BAD_REQUEST)
      })
    })
    describe('get /medias tests', () => {
      it('should get media', async () => {
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const result = await request(app.getHttpServer())
          .get('/medias')
          .expect(HttpStatus.OK)
        expect(result.body).toStrictEqual([{
          id: media.id,
          title: "test",
          username: "user"
        }])
      })
      it('should return empty array if no media is found', async () => {
        const result = await request(app.getHttpServer())
          .get('/medias')
          .expect(HttpStatus.OK)
        expect(result.body).toStrictEqual([])
      })
    })
    describe('get /medias/:id tests', () => {
      it('should get a media', async () => {
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const result = await request(app.getHttpServer())
          .get(`/medias/${media.id}`)
          .expect(HttpStatus.OK)
        expect(result.body).toStrictEqual({
          id: media.id,
          title: "test",
          username: "user"
        })
      })
      it('should return error 404 when media not found', async () => {
        const result = await request(app.getHttpServer())
          .get(`/medias/1`)
          .expect(HttpStatus.NOT_FOUND)
      })
    })

    describe('put /medias tests', () => {
      it('should return 200 when ok', async () => {
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const result = await request(app.getHttpServer())
          .put(`/medias/${media.id}`)
          .send({
            title: "a",
            username: "b"
          })
          .expect(HttpStatus.OK)
      })
      it('should return 409 when duped', async () => {
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const result = await request(app.getHttpServer())
          .put(`/medias/${media.id}`)
          .send({
            title: "test",
            username: "user"
          })
          .expect(HttpStatus.CONFLICT)
      })
      it('should return 404 when not found', async () => {
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const result = await request(app.getHttpServer())
          .put(`/medias/${media.id + 1}`)
          .send({
            title: "a",
            username: "b"
          })
          .expect(HttpStatus.NOT_FOUND)
      })

    })
    describe("delete /media tests", () => {
      it('should delete media', async () => {
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const result = await request(app.getHttpServer())
          .delete(`/medias/${media.id}`)
          .expect(HttpStatus.OK)
      })
      it('should return 404 when not found', async () => {
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const result = await request(app.getHttpServer())
          .delete(`/medias/${media.id + 1}`)
          .expect(HttpStatus.NOT_FOUND)
      })
      it('should return 403 when already in publication', async () => {
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const post = await prisma.post.create({
          data: {
            title: "a",
            text: "a"
          }
        })
        const publication = await prisma.publication.create({
          data: {
            mediaId: media.id,
            postId: post.id,
            date: new Date()
          }
        })
        const result = await request(app.getHttpServer())
          .delete(`/medias/${media.id}`)
          .expect(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('posts tests', () => {
    describe('post posts tests', () => {
      it("should post a post", async () => {
        await request(app.getHttpServer())
          .post('/posts')
          .send({
            title: "test",
            text: "hi"
          })
          .expect(HttpStatus.CREATED)
      })
      it('should return bad request when missing fields', async () => {
        await request(app.getHttpServer())
          .post('/posts')
          .send({
            title: "test"
          })
          .expect(HttpStatus.BAD_REQUEST)
      })
    })
    describe('get posts tests', () => {
      it('should get posts', async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const result = await request(app.getHttpServer())
          .get('/posts')
          .expect(HttpStatus.OK)
        expect(result.body).toStrictEqual([{
          id: post.id,
          title: "test",
          text: "hi"
        }])
      })
      it('should return empty array when no posts', async () => {
        const result = await request(app.getHttpServer())
          .get('/posts')
          .expect(HttpStatus.OK)
        expect(result.body).toStrictEqual([])
      })
    })
    describe("get /posts/:id tests", () => {
      it("should return post", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const result = await request(app.getHttpServer())
          .get(`/posts/${post.id}`)
          .expect(HttpStatus.OK)
        expect(result.body).toStrictEqual({
          id: post.id,
          title: "test",
          text: "hi"
        })
      })
      it("should return error 404 when no post found", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const result = await request(app.getHttpServer())
          .get(`/posts/${post.id + 1}`)
          .expect(HttpStatus.NOT_FOUND)
      })
    })
    describe("put /posts/:id tests", () => {
      it("should update post", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const result = await request(app.getHttpServer())
          .put(`/posts/${post.id}`)
          .send({
            title: "testu",
            text: "hiu"
          })
          .expect(HttpStatus.OK)
      })
      it("should return 404 when post not found", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const result = await request(app.getHttpServer())
          .put(`/posts/${post.id + 1}`)
          .send({
            title: "testu",
            text: "hiu"
          })
          .expect(HttpStatus.NOT_FOUND)
      })
    })
    describe("delete /posts/:id", () => {
      it("should delete a post", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const result = await request(app.getHttpServer())
          .delete(`/posts/${post.id}`)
          .expect(HttpStatus.OK)
      })
      it("should return 404 when no post found", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const result = await request(app.getHttpServer())
          .delete(`/posts/${post.id + 1}`)
          .expect(HttpStatus.NOT_FOUND)
      })
    })
  })
  describe('publications tests', () => {
    describe('post /publications tests', () => {
      it("should post publication", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const result = await request(app.getHttpServer())
          .post(`/publications`)
          .send({
            mediaId: media.id,
            postId: post.id,
            date: "2023-08-29T13:25:17.352Z"
          })
          .expect(HttpStatus.CREATED)
      })
      it("should return error 400 when fields are missing", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const result = await request(app.getHttpServer())
          .post(`/publications`)
          .send({
            mediaId: media.id,
            postId: post.id
          })
          .expect(HttpStatus.BAD_REQUEST)
      })
      it("should return error 404 when there is no post or media for publication", async () => {
        const result = await request(app.getHttpServer())
          .post(`/publications`)
          .send({
            mediaId: 1,
            postId: 1,
            date: "2023-08-29T13:25:17.352Z"
          })
          .expect(HttpStatus.NOT_FOUND)
      })

    })
    describe('get /publications tests', () => {
      it('should return publications', async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const publication = await prisma.publication.create({
          data: {
            mediaId: media.id,
            postId: post.id,
            date: "2023-08-29T13:25:17.352Z"
          }
        })
        const result = await request(app.getHttpServer())
          .get(`/publications`)
          .expect(HttpStatus.OK)
        expect(result.body).toStrictEqual([{
          id: publication.id,
          mediaId: media.id,
          postId: post.id,
          date: "2023-08-29T13:25:17.352Z"
        }])
      })
      it("should return an empty array when no publications exist", async () => {
        const result = await request(app.getHttpServer())
          .get(`/publications`)
          .expect(HttpStatus.OK)
        expect(result.body).toStrictEqual([])
      })
    })
    describe("get /publication/:id tests", () => {
      it("should get publication", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const publication = await prisma.publication.create({
          data: {
            mediaId: media.id,
            postId: post.id,
            date: "2023-08-29T13:25:17.352Z"
          }
        })
        const result = await request(app.getHttpServer())
          .get(`/publications/${publication.id}`)
          .expect(HttpStatus.OK)
        expect(result.body).toStrictEqual({
          id: publication.id,
          mediaId: media.id,
          postId: post.id,
          date: "2023-08-29T13:25:17.352Z"
        })
      })
      it("should return error 404 when no publication found", async () => {
        const result = await request(app.getHttpServer())
          .get(`/publications/1`)
          .expect(HttpStatus.NOT_FOUND)
      })
    })
    describe("put /publications/:id tests", () => {
      it("should update publication", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const future = new Date()
        future.setDate(future.getDate() + 2)
        const publication = await prisma.publication.create({
          data: {
            mediaId: media.id,
            postId: post.id,
            date: future
          }
        })
        const now = new Date()
        now.setDate(now.getDate() + 1);
        const result = await request(app.getHttpServer())
          .put(`/publications/${publication.id}`)
          .send({
            id: publication.id,
            mediaId: media.id,
            postId: post.id,
            date: now})
          .expect(HttpStatus.OK)
      })
      it("should return error 403 if trying to alter already published publication", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const publication = await prisma.publication.create({
          data: {
            mediaId: media.id,
            postId: post.id,
            date: "2023-08-23T13:25:17.352Z"
          }
        })
        const now = new Date()
        now.setDate(now.getDate() + 1);
        const result = await request(app.getHttpServer())
          .put(`/publications/${publication.id}`)
          .send({
            id: publication.id,
            mediaId: media.id,
            postId: post.id,
            date: now})
          .expect(HttpStatus.FORBIDDEN)
      })
      it("should return error 404 if no publication found", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const now = new Date()
        now.setDate(now.getDate() + 1);
        const result = await request(app.getHttpServer())
          .put(`/publications/0`)
          .send({
            id: 0,
            mediaId: media.id,
            postId: post.id,
            date: now})
          .expect(HttpStatus.NOT_FOUND)
      })
      it("should return error 404 if there are no posts or media corresponding", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const publication = await prisma.publication.create({
          data: {
            mediaId: media.id,
            postId: post.id,
            date: "2023-08-23T13:25:17.352Z"
          }
        })
        const now = new Date()
        now.setDate(now.getDate() + 1);
        const result = await request(app.getHttpServer())
          .put(`/publications/${publication.id}`)
          .send({
            id: publication.id,
            mediaId: 0,
            postId: 0,
            date: now})
          .expect(HttpStatus.NOT_FOUND)
      })
    })
    describe("delete /publications/:id", () => {
      it("should delete publication", async () => {
        const post = await prisma.post.create({
          data: {
            title: "test",
            text: "hi"
          }
        })
        const media = await prisma.media.create({
          data: {
            title: "test",
            username: "user"
          }
        })
        const publication = await prisma.publication.create({
          data: {
            mediaId: media.id,
            postId: post.id,
            date: "2023-08-23T13:25:17.352Z"
          }
        })
        const now = new Date()
        now.setDate(now.getDate() + 1);
        const result = await request(app.getHttpServer())
          .delete(`/publications/${publication.id}`)
          .expect(HttpStatus.OK)
      })
      it("should return error 404 if no publication found", async () => {
        const now = new Date()
        now.setDate(now.getDate() + 1);
        const result = await request(app.getHttpServer())
          .delete(`/publications/0`)
          .expect(HttpStatus.NOT_FOUND)
      })
    })

  })

});
