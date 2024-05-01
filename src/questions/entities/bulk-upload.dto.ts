import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class BulkUploadDto {
  @ApiProperty({ example: "questions-category.csv" })
  @IsString()
  @IsNotEmpty()
  filename: string;
}