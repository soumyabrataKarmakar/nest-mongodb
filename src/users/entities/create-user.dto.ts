import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: "Soumyabrata" })
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({ example: "Karmakar" })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ example: "soumyabratakarmakar1999@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Soumya@1234" })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" })
  @IsString()
  profile_image_url: string;
}