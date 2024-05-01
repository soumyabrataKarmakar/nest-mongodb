import { Body, Controller, Get, HttpStatus, Patch, Post, Query, Req, Res, UnsupportedMediaTypeException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './entities/create-user.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UsersService } from './users.service';
import { LoginUserDto } from './entities/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth/auth.guard';
import { EditUserProfileDto } from './entities/edit-user-profile.dto';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { FileInterceptor, File } from '@nest-lab/fastify-multer';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService, private jwtService: JwtService, private readonly awsS3Service: AwsS3Service) { }

  @ApiOperation({ summary: 'Create user' })
  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      console.log("createUserDto=================+>", createUserDto)
      // Check if the email already registered
      const existingData = await this.userService.findExistingUser(createUserDto.email)
      if (existingData) throw { "status": 409, "message": "Already email registered" }

      // Hash the password before storing it in the database
      const hashedPassword = await this.userService.hashPassword(createUserDto.password);
      createUserDto.password = hashedPassword

      // Store the data in the database
      const response = await this.userService.createUser(createUserDto)

      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'results': response,
          'message': "User created succesfully !!"
        })
    } catch (error) {
      console.log("error================>", error)
      reply
        .status(error.status ? error.status : HttpStatus.BAD_REQUEST)
        .send({
          'status': 'error',
          'results': error.results ? error.results : undefined,
          'message': error.message ? error.message : 'Something Went Wrong !!'
        });
    }


  }

  // Login API
  @ApiOperation({ summary: 'User Login' })
  @Post('login')
  async userLogin(@Body() loginUserDto: LoginUserDto, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      // Check if the email is valid
      const existingData: any = await this.userService.findExistingUser(loginUserDto.email)
      if (!existingData) throw { "status": 404, "message": "Email not registered" }

      // Hash the password before storing it in the database
      const comparePassword = await this.userService.comparePasswords(loginUserDto.password, existingData.password);
      if (!comparePassword) throw { "status": 401, "message": "Password is invalid" }

      // Generate access token for authorization
      const token = await this.jwtService.signAsync({ '_id': existingData._id, "email": existingData.email })

      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'access_token': token,
          'message': "Logged in succesfully !!"
        })
    } catch (error) {
      console.log("error================>", error)
      reply
        .status(error.status ? error.status : HttpStatus.BAD_REQUEST)
        .send({
          'status': 'error',
          'results': error.results ? error.results : undefined,
          'message': error.message ? error.message : 'Something Went Wrong !!'
        });
    }
  }

  // Profile details API with Authguard with Bearer Authorization
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Profile' })
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      const profileData = await this.userService.getProfileData(request['user']['_id'])

      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'results': profileData,
          'message': "Profile data fetched succesfully !!"
        })
    } catch (error) {
      console.log("error================>", error)
      reply
        .status(error.status ? error.status : HttpStatus.BAD_REQUEST)
        .send({
          'status': 'error',
          'results': error.results ? error.results : undefined,
          'message': error.message ? error.message : 'Something Went Wrong !!'
        });
    }
  }

  // Edit Profile details API with Authguard with Bearer Authorization
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit Profile' })
  @UseGuards(AuthGuard)
  @Post('edit-profile')
  async editProfile(@Body() editUserProfileDto: EditUserProfileDto, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      console.log('editUserProfileDto=================>', editUserProfileDto)
      // Check if user tring to update email
      if (editUserProfileDto['email']) throw { "status": 401, "message": "Email can't be updated !!" }

      // Hash the password if password is in the payload
      if (editUserProfileDto.password) {
        const hashedPassword = await this.userService.hashPassword(editUserProfileDto.password);
        editUserProfileDto.password = hashedPassword
      }

      // Update the profile details in the database
      const updateResponse = await this.userService.editUserProfile(request['user']['_id'], editUserProfileDto)


      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'results': updateResponse,
          'message': "Profile data updated succesfully !!"
        })
    } catch (error) {
      console.log("error================>", error)
      reply
        .status(error.status ? error.status : HttpStatus.BAD_REQUEST)
        .send({
          'status': 'error',
          'results': error.results ? error.results : undefined,
          'message': error.message ? error.message : 'Something Went Wrong !!'
        });
    }
  }

  // Upload file image file to aws s3 bucket and get the image url
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data') // Specify that this endpoint consumes a file
  @UseInterceptors(FileInterceptor("file"))// Use the file interceptor
  @ApiBody({
    required: true,
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        }
      }
    }
  })
  @UseGuards(AuthGuard)
  @Patch('upload-image')
  async uploadImage(@UploadedFile() file: File, @Res() reply: FastifyReply) {
    try {
      // Validate file type
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
      if (!allowedImageTypes.includes(file.mimetype)) {
        throw new UnsupportedMediaTypeException('Only image files (JPEG, PNG, GIF, BMP, TIFF, WEBP) are allowed');
      }

      const imageUrl = await this.awsS3Service.uploadImageToS3(file.buffer, file.originalname);
      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'results': imageUrl,
          'message': "Image uploaded succesfully !!"
        })

    } catch (error) {
      console.log("error================>", error)
      reply
        .status(error.status ? error.status : HttpStatus.BAD_REQUEST)
        .send({
          'status': 'error',
          'results': error.results ? error.results : undefined,
          'message': error.message ? error.message : 'Something Went Wrong !!'
        });
    }
  }
}
