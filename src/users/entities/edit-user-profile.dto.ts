import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class EditUserProfileDto {
  @ApiProperty({ example: "Soumyabrata" })
  @IsString()
  @IsOptional()
  firstname: string;

  @ApiProperty({ example: "Karmakar" })
  @IsString()
  @IsOptional()
  lastname: string;

  @ApiProperty({ example: "Soumya@1234" })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password: string;

  @ApiProperty({ example: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" })
  @IsString()
  @IsOptional()
  profile_image_url: string;
}