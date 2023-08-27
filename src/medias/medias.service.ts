import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediasRepository } from './medias.repository';

@Injectable()
export class MediasService {
  constructor(private readonly repository: MediasRepository) {

  }
  async create(createMediaDto: CreateMediaDto) {
    const checkDuplicate = await this.repository.findAllWithoutId()
    const duplicateExists = checkDuplicate.some(item => {
      return item.title === createMediaDto.title && item.username === createMediaDto.username;
    });
  
    if (duplicateExists) {
      throw new HttpException("Title and username combination already exists!", HttpStatus.CONFLICT);
    }

    return await this.repository.create(createMediaDto);
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    const result = await this.repository.findOne(id);
    if (!result) throw new HttpException("Media not found", HttpStatus.NOT_FOUND)

    return result
  }

  async update(id: number, updateMediaDto: UpdateMediaDto) {
    const checkDuplicate = await this.repository.findAllWithoutId()
    const duplicateExists = checkDuplicate.some(item => {
      return item.title === updateMediaDto.title && item.username === updateMediaDto.username;
    });
  
    if (duplicateExists) {
      throw new HttpException("Title and username combination already exists!", HttpStatus.CONFLICT);
    }

    const result = await this.repository.update(id, updateMediaDto);
    if (!result) throw new HttpException("Media not found", HttpStatus.NOT_FOUND)

    return result
  }

  async remove(id: number) {
    const checkPublications = await this.repository.checkPublications(id)
    if (checkPublications) throw new HttpException("Media is already on publication, cant delete", HttpStatus.FORBIDDEN)
    
    const result = await this.repository.remove(id);
    if (!result) throw new HttpException("Media not found", HttpStatus.NOT_FOUND)

    return result
  }
}
