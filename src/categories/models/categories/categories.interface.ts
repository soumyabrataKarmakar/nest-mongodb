import { Document } from "mongoose";

export interface ICategory extends Document {
  readonly name: string;
  readonly createdon_datetime: number;
  readonly updatedon_datetime: number;
}