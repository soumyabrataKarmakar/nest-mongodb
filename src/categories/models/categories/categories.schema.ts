import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as moment from 'moment';

@Schema({ collection: 'categories' })
export class Category {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ default: () => moment().valueOf(), immutable: true, index: true })
  createdon_datetime: number;

  @Prop({ default: () => moment().valueOf(), index: true })
  updatedon_datetime: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
