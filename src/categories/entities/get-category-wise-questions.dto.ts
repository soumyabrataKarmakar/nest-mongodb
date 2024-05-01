import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetCategoryWiseQuestionDto {
  @ApiProperty({ example: 10 })
  @IsString()
  category_id: string;
}