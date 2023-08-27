import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(private readonly repository: PostsRepository) {

  }
  async create(createPostDto: CreatePostDto) {
    return await this.repository.create(createPostDto);
  }

  async findAll() {
    const results = await this.repository.findAll();

    const filteredResults = results.map(post => {
      const { id, title, text, image } = post;
      return {
        id,
        title,
        text,
        ...(image !== null && { image })
      };
    });

    return filteredResults
  }

  async findOne(id: number) {
    const result = await this.repository.findOne(id)
    if (!result) throw new HttpException("Post not found", HttpStatus.NOT_FOUND)

    const { id: postId, title, text, image } = result;

    if (image === null) {
      return { id: postId, title, text };
    }

    return { id: postId, title, text, image };
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const result = await this.repository.update(id, updatePostDto)
    if (!result) throw new HttpException("Post not found", HttpStatus.NOT_FOUND)
    return result
  }

  async remove(id: number) {
    const checkPublications = await this.repository.checkPublications(id)
    if (checkPublications) throw new HttpException("Media is already on publication, cant delete", HttpStatus.FORBIDDEN)

    const result = await this.repository.remove(id)
    if (!result) throw new HttpException("Post not found", HttpStatus.NOT_FOUND)

    return result
  }
}
