import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsUrl()
    image: string;
}
