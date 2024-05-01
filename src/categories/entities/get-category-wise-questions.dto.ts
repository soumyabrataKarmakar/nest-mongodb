import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetCategoryWiseQuestionDto {
  @ApiProperty({ example: "66322d60c26f670a58ee951d" })
  @IsString()
  category_id: string;
}