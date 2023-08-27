import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationsRepository } from './publications.repository';
import dayjs from 'dayjs';

@Injectable()
export class PublicationsService {
  constructor(private readonly repository: PublicationsRepository) {

  }
  async create(createPublicationDto: CreatePublicationDto) {
    const checkPost = this.repository.checkPost(createPublicationDto.postId)
    const checkMedia = this.repository.checkMedia(createPublicationDto.mediaId)

    if (!checkPost || !checkMedia) throw new HttpException("No post or media found for publication", HttpStatus.NOT_FOUND)

    return this.repository.create(createPublicationDto);
  }

  async findAll(published?: string, after?: string) {
    const parsedDate = new Date(after);
    const currentDate = new Date();
   
  
    if (after && isNaN(parsedDate.getTime())) {
      throw new HttpException('O valor de "after" deve ser uma instância de Date.', HttpStatus.BAD_REQUEST);
    }
    let publishedValue = undefined
    if (published === "true") publishedValue = true
    else if (published === "false") publishedValue = false
    else if (published) throw new HttpException('Published deve ser true ou false', HttpStatus.BAD_REQUEST)

    if(after && published){
      if(publishedValue == true){
        if (parsedDate > currentDate) throw new HttpException("Nao eh possivel encontrar essa data", HttpStatus.FORBIDDEN)
      }
    }

    console.log("published service", published)
    console.log("after service", after)
    if(after && publishedValue == true) return this.repository.findAll(publishedValue, parsedDate);
    else if(after && publishedValue == false) return this.repository.findAll(publishedValue, parsedDate);
    else if(after && publishedValue == undefined) return this.repository.findAll(null, parsedDate);
    else if (!after && publishedValue == true)return this.repository.findAll(publishedValue, null);
    else if (!after && publishedValue == false)return this.repository.findAll(publishedValue, null);
    else return this.repository.findAll();
  }

  async findOne(id: number) {
    const result = await this.repository.findOne(id);
    if (!result) throw new HttpException("Publication not found", HttpStatus.NOT_FOUND)

    return result
  }

  async update(id: number, updatePublicationDto: UpdatePublicationDto) {
    const checkPublication = await this.repository.findOne(id)
    if (!checkPublication) throw new HttpException("Publication not found", HttpStatus.NOT_FOUND)

    const checkPost = this.repository.checkPost(updatePublicationDto.postId)
    const checkMedia = this.repository.checkMedia(updatePublicationDto.mediaId)

    if (!checkPost || !checkMedia) throw new HttpException("No post or media found for publication", HttpStatus.NOT_FOUND)

    const now = new Date()
    if (checkPublication.date < now) throw new HttpException("Can`t change an already made publication", HttpStatus.FORBIDDEN)

    return this.repository.update(id, updatePublicationDto);
  }

  remove(id: number) {
    const result = this.repository.remove(id)
    if (!result) throw new HttpException("Publication not found", HttpStatus.NOT_FOUND)

    return result;
  }
}
