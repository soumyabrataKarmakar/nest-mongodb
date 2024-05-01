import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { ICategory } from './models/categories/categories.interface';
import { CreateCategoryDto } from './entities/create-category.dto';
import { GetCategoryDto } from './entities/get-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel('categories') private categoryModel: Model<ICategory>) { }

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
}
