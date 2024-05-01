import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as moment from 'moment';

@Schema({ collection: 'users' })
export class User {
  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, index: 1 })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({})
  profile_image_url: string;

  @Prop({ default: () => moment().valueOf(), immutable: true })
  createdon_datetime: number;

  @Prop({ default: () => moment().valueOf() })
  updatedon_datetime: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
