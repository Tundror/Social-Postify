import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsUrl()
    image: string;
}
