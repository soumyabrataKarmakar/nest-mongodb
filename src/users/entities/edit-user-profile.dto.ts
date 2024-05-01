import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class EditUserProfileDto {
  @ApiProperty({ example: "Soumyabrata" })
  @IsString()
  firstname: string;

  @ApiProperty({ example: "Karmakar" })
  @IsString()
  lastname: string;

  @ApiProperty({ example: "Soumya@1234" })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" })
  @IsString()
  profile_image_url: string;
}