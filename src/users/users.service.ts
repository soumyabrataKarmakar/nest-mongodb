import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { IUser } from './models/user/user.interface';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './entities/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('users') private userModel: Model<IUser>) { }

  async findExistingUser(email: string): Promise<any> {
    try {
      const aggregation: PipelineStage[] = [
        {
          "$match": {
            "email": email
          }
        }
      ]
      const foundUserData = await this.userModel.aggregate(aggregation)
      // if (foundUserData.length > 0) return Promise.reject({ 'status': 409, "message": "Already registered email" })
      return Promise.resolve(foundUserData.length > 0 ? foundUserData[0] : false)
    } catch (error) {
      return Promise.reject({ 'message': error })
    }
  }

  async createUser(user: CreateUserDto) {
    try {
      const response = (await this.userModel.create(user)).toObject();
      return Promise.resolve({ ...response, password: undefined })
    } catch (error) {
      return Promise.reject({ 'message': error })
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Number of salt rounds
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async getProfileData(id: string): Promise<any> {
    try {
      const aggregation: PipelineStage[] = [
        {
          "$match": {
            "_id": new mongoose.Types.ObjectId(id)
          }
        }, {
          "$project": {
            'password': 0
          }
        }
      ]

      console.log("aggregation================>", JSON.stringify(aggregation))
      const foundUserData = await this.userModel.aggregate(aggregation)
      if (foundUserData.length == 0) return Promise.reject({ 'status': 404, "message": "User not found" })
      return Promise.resolve(foundUserData[0])
    } catch (error) {
      return Promise.reject({ 'message': error })
    }
  }

}
