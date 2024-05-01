import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as moment from 'moment';

@Schema({ collection: 'question_category_map' })
export class QuestionCategoryMap {
  @Prop({ required: true, index: true })
  question_id: string;

  @Prop({ required: true, index: true })
  category_id: string;

  @Prop({ default: () => moment().valueOf(), immutable: true, index: true })
  createdon_datetime: number;
}

export const QuestionCategoryMapSchema = SchemaFactory.createForClass(QuestionCategoryMap);
QuestionCategoryMapSchema.index({ question_id: 1, category_id: 1 }, { unique: true });