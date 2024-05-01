import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEmpty } from 'class-validator';

export class GetQuestionDto {
  @ApiProperty({ example: 10, required: false })
  @IsString()
  @IsOptional()
  limit: number;

  @ApiProperty({ example: 0, required: false })
  @IsString()
  @IsOptional()
  skip: number;

  @ApiProperty({ example: "mytho", required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ example: "name", required: false, description: "field name on which to be sorted" })
  @IsOptional()
  @IsString()
  sortby: string;

  @ApiProperty({ example: "asc", required: false, description: "asc or desc" })
  @IsOptional()
  @IsString()
  sortorder: string;
}