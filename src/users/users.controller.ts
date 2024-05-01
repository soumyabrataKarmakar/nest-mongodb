import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './entities/create-user.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UsersService } from './users.service';
import { LoginUserDto } from './entities/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth/auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService, private jwtService: JwtService) { }

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
      console.log('request=================>', request['user'])
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
}
