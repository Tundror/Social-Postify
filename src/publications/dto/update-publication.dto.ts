import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicationDto } from './create-publication.dto';
import { IsDate, IsNotEmpty, IsNumber, IsString} from "class-validator";

export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {
    @IsNumber()
    @IsNotEmpty()
    id: number;
    
    @IsNumber()
    @IsNotEmpty()
    mediaId: number;

    @IsNumber()
    @IsNotEmpty()
    postId: number;

    @IsDate()
    @IsNotEmpty()
    date: Date
}
