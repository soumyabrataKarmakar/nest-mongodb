import { Document } from "mongoose";

export interface IQuestionCategoryMap extends Document {
  readonly question_id: string;
  readonly category_id: string;
  readonly createdon_datetime: number;
}