import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as moment from 'moment';

@Schema({ collection: 'questions' })
export class Question {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ default: () => moment().valueOf(), immutable: true, index: true })
  createdon_datetime: number;

  @Prop({ default: () => moment().valueOf(), index: true })
  updatedon_datetime: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
