import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { ICategory } from './models/categories/categories.interface';
import { CreateCategoryDto } from './entities/create-category.dto';
import { GetCategoryDto } from './entities/get-category.dto';
import { IQuestionCategoryMap } from 'src/questions/models/question-category-map/question-category-map.interface';
import { GetCategoryWiseQuestionDto } from './entities/get-category-wise-questions.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('categories') private categoryModel: Model<ICategory>,
    @InjectModel('question_category_map') private questionCategoryMapModel: Model<IQuestionCategoryMap>
  ) { }

  async createCategory(category: CreateCategoryDto): Promise<any> {
    try {
      // Check if any category already exists with the name
      const existsCategory = await this.categoryModel.findOne({ "name": category.name })
      if (existsCategory) return Promise.reject({ 'message': "A category already exists with this name", "results": existsCategory })
      const response = (await this.categoryModel.create(category)).toObject();
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject({ 'message': error })
    }
  }

  async getCategories(getCategory: GetCategoryDto): Promise<any> {
    try {
      const skip = getCategory.skip ? Number(getCategory.skip) : 0;
      const limit = getCategory.limit ? Number(getCategory.limit) : undefined;
      const name = getCategory.name ? getCategory.name : undefined;
      const sortby = getCategory.sortby ? getCategory.sortby : undefined;
      const sortorder = getCategory.sortorder ? (getCategory.sortorder.trim().toLowerCase() == 'desc' ? -1 : 1) : 1;

      // Default aggregation
      const aggregation: PipelineStage[] = []

      // Add name stage in the aggregation if name value is valid and search through the collection with regular expression search with case insensitivity
      if (name) aggregation.push({ '$match': { 'name': { '$regex': name, '$options': 'i' } } })

      // Add sort stage in the aggregation
      if (sortby) aggregation.push({ '$sort': { [sortby]: sortorder } })

      // Add skip stage in the aggregation with valid value or 0 skip value
      aggregation.push({ '$skip': skip })

      // Add limit stage in the aggregation if limit value is valid
      if (limit) aggregation.push({ '$limit': limit })

      console.log("aggregation====================>", JSON.stringify(aggregation))
      const response = await this.categoryModel.aggregate(aggregation)
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject({ 'message': error })
    }
  }

  async getCategoryWiseQuestions(getCategoryWiseQuestionDto: GetCategoryWiseQuestionDto): Promise<any> {
    try {

      // Aggregation pipeline
      const aggregation: PipelineStage[] = [
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(getCategoryWiseQuestionDto.category_id)
          }
        }, {
          '$lookup': {
            'from': 'question_category_map',
            'let': {
              'category_id': '$_id'
            },
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$eq': [
                      {
                        '$toString': '$$category_id'
                      }, '$category_id'
                    ]
                  }
                }
              }, {
                '$lookup': {
                  'from': 'questions',
                  'let': {
                    'question_id': '$question_id'
                  },
                  'pipeline': [
                    {
                      '$match': {
                        '$expr': {
                          '$eq': [
                            {
                              '$toObjectId': '$$question_id'
                            }, '$_id'
                          ]
                        }
                      }
                    }
                  ],
                  'as': 'question'
                }
              }, {
                '$addFields': {
                  'question': {
                    '$first': '$question'
                  }
                }
              }, {
                '$project': {
                  '_id': '$question._id',
                  'name': '$question.name',
                  'createdon_datetime': '$question.createdon_datetime',
                  'updatedon_datetime': '$question.updatedon_datetime'
                }
              }
            ],
            'as': 'questions'
          }
        }, {
          '$unwind': {
            'path': '$questions',
            'preserveNullAndEmptyArrays': false
          }
        }, {
          '$project': {
            'category_name': '$name',
            'category_id': {
              '$toString': '$_id'
            },
            'category_createdon_datetime': '$createdon_datetime',
            'category_updated_datetime': '$updatedon_datetime',
            'question_id': {
              '$toString': '$questions._id'
            },
            'question_name': '$questions.name',
            'question_createdon_datetime': '$questions.createdon_datetime',
            'question_updated_datetime': '$questions.updatedon_datetime'
          }
        }
      ]



      console.log("aggregation====================>", JSON.stringify(aggregation))
      const response = await this.categoryModel.aggregate(aggregation)
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject({ 'message': error })
    }
  }
}
