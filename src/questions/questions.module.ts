import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionSchema } from './models/questions/questions.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuestionCategoryMapSchema } from './models/question-category-map/question-category-map.schema';
import { CategoriesService } from 'src/categories/categories.service';
import { CategorySchema } from 'src/categories/models/categories/categories.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'categories', schema: CategorySchema },
      { name: 'questions', schema: QuestionSchema },
      { name: 'question_category_map', schema: QuestionCategoryMapSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, CategoriesService]
})
export class QuestionsModule { }
