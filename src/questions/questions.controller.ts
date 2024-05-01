import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UnsupportedMediaTypeException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { CreateQuestionDto } from './entities/create-question.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { MapQuestionCategoryDto } from './entities/map-question-category.dto';
import { FileInterceptor, File } from '@nest-lab/fastify-multer';
import * as path from 'path';
import { GetQuestionDto } from './entities/get-question.dto';
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


  // Get questions API with Authguard with Bearer Authorization
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get All Questions. Please remove all query parameters to fetch all questions' })
  @UseGuards(AuthGuard)
  @Get('get-all-questions')
  async getCategories(@Query() getQuestionDto: GetQuestionDto, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      const questions = await this.questionsService.getQuestions(getQuestionDto)

      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'results': questions,
          'count': questions.length,
          'message': "Questions fetched succesfully !!"
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

  // Bulk upload questions with category API with Authguard with Bearer Authorization
  @ApiOperation({ summary: 'Bulk Upload Question Category' })
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
  // @UseGuards(AuthGuard)
  @Post('bulk-upload-question-category-csv')
  async bulkUploadQuestionCategory(@UploadedFile() file: File, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      // Validate file type
      const allowedExtensions = ['.csv'];
      const fileExtension = path.extname(file.originalname).toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        throw new UnsupportedMediaTypeException('Only CSV files are allowed');
      }

      // Parse CSV from buffer
      const parsedCsv = await this.questionsService.parseCsv(file.buffer)
      console.log("parsedCsv====================>", parsedCsv)

      // Read and analysis the csv file and return array of questions
      const questionSet = await this.questionsService.analyzeCsvData(parsedCsv)
      console.log("questionSet====================>", questionSet)

      // Upload the CSV data into database and create the mappings
      const response = await this.questionsService.uploadBulkData(questionSet.filter((val: any) => val.uploadable == true))

      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'uploaded_data': response,
          'not_uploadable_data': questionSet.filter((val: any) => val.uploadable == false),
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
