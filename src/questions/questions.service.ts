import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './entities/create-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IQuestion } from './models/questions/questions.interface';
import { IQuestionCategoryMap } from './models/question-category-map/question-category-map.interface';
import { MapQuestionCategoryDto } from './entities/map-question-category.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel('questions') private questionModel: Model<IQuestion>,
    @InjectModel('question_category_map') private questionCategoryMapModel: Model<IQuestionCategoryMap>
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
        console.log("mappingResponse=====================>", mappingResponse)
      }


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
}
