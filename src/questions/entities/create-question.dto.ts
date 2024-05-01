import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ example: "Who saved Rama and Laxman from Nagapasha?" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: ["6631f52b80919dc5ce519aeb", "6631f59780919dc5ce519aed"], required: false })
  category_ids: string;
}