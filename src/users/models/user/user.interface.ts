import { Document } from "mongoose";

export interface IUser extends Document {
  readonly firstname: string;
  readonly lastname: string;
  readonly email: string;
  readonly password: string;
  readonly profile_image_url: string;
  readonly createdon_datetime: number;
  readonly updatedon_datetime: number;
}