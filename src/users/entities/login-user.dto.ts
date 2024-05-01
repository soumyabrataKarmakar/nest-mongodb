import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: "soumyabratakarmakar1999@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Soumya@1234" })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}