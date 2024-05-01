import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateCategoryDto } from './entities/create-category.dto';
import { GetCategoryDto } from './entities/get-category.dto';

const async = require('async')

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) { }

  // Create category API with Authguard with Bearer Authorization
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Category' })
  @UseGuards(AuthGuard)
  @Post('create-category')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      const categoryData = await this.categoriesService.createCategory(createCategoryDto)

      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'results': categoryData,
          'message': "Category created succesfully !!"
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

  // Get categories API with Authguard with Bearer Authorization
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get All Categories. Please remove all query parameters to fetch all categories' })
  @UseGuards(AuthGuard)
  @Get('get-all-categories')
  async getCategories(@Query() getCategoryDto: GetCategoryDto, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    try {
      const categories = await this.categoriesService.getCategories(getCategoryDto)

      reply
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .send({
          'status': 'success',
          'results': categories,
          'count': categories.length,
          'message': "Category fetched succesfully !!"
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
