import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './entities/create-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { IQuestion } from './models/questions/questions.interface';
import { IQuestionCategoryMap } from './models/question-category-map/question-category-map.interface';
import { MapQuestionCategoryDto } from './entities/map-question-category.dto';
import { Readable } from 'stream';
import { CategoriesService } from 'src/categories/categories.service';
import { GetQuestionDto } from './entities/get-question.dto';

const Papa = require('papaparse');
const async = require('async');

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel('questions') private questionModel: Model<IQuestion>,
    @InjectModel('question_category_map') private questionCategoryMapModel: Model<IQuestionCategoryMap>,
    private categoriesService: CategoriesService
  ) { }
  async createQuestion(question: CreateQuestionDto): Promise<any> {
    try {
      // Check if any question already exists with the name
      const existsQuestion = await this.questionModel.findOne({ "name": question.name })
      if (existsQuestion) return Promise.reject({ 'message': "A question already exists with this name", "results": existsQuestion })

      // Create the question in the question collection
      const response = (await this.questionModel.create(question)).toObject();

      // Insert the question and category mapping into mapping collection if mapping has been added in the payload
      if (Array.isArray(question.category_ids) && question.category_ids.length > 0) {
        const mappingDataset = question.category_ids.map((category_id: string) => ({ 'question_id': response._id, 'category_id': category_id }))
        const mappingResponse = await this.questionCategoryMapModel.insertMany(mappingDataset)
        // console.log("mappingResponse=====================>", mappingResponse)
      }
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject({ 'message': error })
    }
  }

  async getQuestions(getQuestionDto: GetQuestionDto): Promise<any> {
    try {
      const skip = getQuestionDto.skip ? Number(getQuestionDto.skip) : 0;
      const limit = getQuestionDto.limit ? Number(getQuestionDto.limit) : undefined;
      const name = getQuestionDto.name ? getQuestionDto.name : undefined;
      const sortby = getQuestionDto.sortby ? getQuestionDto.sortby : undefined;
      const sortorder = getQuestionDto.sortorder ? (getQuestionDto.sortorder.trim().toLowerCase() == 'desc' ? -1 : 1) : 1;

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
      const response = await this.questionModel.aggregate(aggregation)
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject({ 'message': error })
    }
  }

  async mappingQuestionCategory(mappingQuestionCategory: MapQuestionCategoryDto): Promise<any> {
    try {
      // Create the question and category mapping in the question category map collection collection
      const response = await this.questionCategoryMapModel.findOneAndUpdate(
        { 'question_id': mappingQuestionCategory.question_id, 'category_id': mappingQuestionCategory.category_id },
        mappingQuestionCategory,
        { upsert: true, new: true }
      )
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject({ 'message': error })
    }
  }

  async deleteMappingQuestionCategory(mappingQuestionCategory: MapQuestionCategoryDto): Promise<any> {
    try {
      // Delete the question and category mapping in the question category map collection collection
      const response = await this.questionCategoryMapModel.deleteMany(
        { 'question_id': mappingQuestionCategory.question_id, 'category_id': mappingQuestionCategory.category_id }
      )
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject({ 'message': error })
    }
  }


  async parseCsv(buffer: Buffer): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // Convert the buffer to a stream
      const stream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });
      // Finally parse the data from the stream
      Papa.parse(stream, {
        header: true,
        dynamicTyping: true,
        complete: (results: any) => {
          resolve(results.data);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    })
  }

  async analyzeCsvData(csvData: Array<object>): Promise<any> {
    try {
      console.log('csvData==================+>', csvData)
      const analyzedDataForUpload = csvData.map((csv: object) => {
        const finalDataset: any = {
          'main_data': csv,
          'uploadable': false
        }
        if (csv['Question']) {
          finalDataset['question'] = csv['Question']
          finalDataset['categories'] = csv['Categories'] ? csv['Categories'].split(',').map((val: string) => val.replaceAll(' ', '')).filter((val: string) => val.length > 3) : [];
          finalDataset['uploadable'] = true
        }
        return finalDataset
      })
      return Promise.resolve(analyzedDataForUpload)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async uploadBulkData(bulkData: Array<object>): Promise<any> {
    try {
      const finalResponse: Array<object> = []
      for (let i = 0; i < bulkData.length; i++) {
        const eachData: any = bulkData[i]
        // Create the categories first
        const category_ids = await async.parallel(eachData['categories'].map((category: string) => async () => {
          try {
            const categoryCreateResponse = await this.categoriesService.createCategory({ name: category })
            return categoryCreateResponse._id;
          } catch (error) {
            console.log("error======================>", error, category)
            return error?.results?._id ? error.results._id : null
          }
        }))
        console.log('category_ids====================+++>', category_ids)
        let questionData: any;
        try {
          // Create the question and mappings
          questionData = await this.createQuestion({ 'name': eachData.question, 'category_ids': category_ids.filter((val: any) => val != null) })
        } catch (error) {
          questionData = error.results
        }
        finalResponse.push({ question: questionData, category_ids: category_ids })

      }
      return Promise.resolve(finalResponse)
    } catch (error) {
      return Promise.reject(error)
    }
  }

}
