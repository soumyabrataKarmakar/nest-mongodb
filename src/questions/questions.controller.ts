import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { CreateQuestionDto } from './entities/create-question.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { MapQuestionCategoryDto } from './entities/map-question-category.dto';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) { }

  // Create question API with Authguard with Bearer Authorization
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Question' })
  @UseGuards(AuthGuard)
  @Post('create-question')
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      const questionData = await this.questionsService.createQuestion(createQuestionDto)

      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'results': questionData,
          'message': "Question created succesfully !!"
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

  // Map questions with category API with Authguard with Bearer Authorization
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Map Question Category' })
  @UseGuards(AuthGuard)
  @Post('map-question-category')
  async mapQuestionCategory(@Body() mapQuestionCategoryDto: MapQuestionCategoryDto, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      const mappingData = await this.questionsService.mappingQuestionCategory(mapQuestionCategoryDto)

      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'results': mappingData,
          'message': "Question and Category mapped succesfully !!"
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

  // Delete mapping questions with category API with Authguard with Bearer Authorization
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Mappping with Question Category' })
  @UseGuards(AuthGuard)
  @Post('delete-map-question-category')
  async deleteMapQuestionCategory(@Body() mapQuestionCategoryDto: MapQuestionCategoryDto, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      const mappingDeleteData = await this.questionsService.deleteMappingQuestionCategory(mapQuestionCategoryDto)

      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'results': mappingDeleteData,
          'message': "Question and Category mapping deleted succesfully !!"
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
