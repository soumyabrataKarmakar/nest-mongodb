import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class MapQuestionCategoryDto {
  @ApiProperty({ example: "663205416eb953a2ee8627c7" })
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @ApiProperty({ example: "6631f52b80919dc5ce519aeb" })
  @IsString()
  @IsNotEmpty()
  category_id: string;
}