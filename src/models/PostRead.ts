import { Schema, Model, Document, model } from 'mongoose';
import { IUser } from './User';
import { IPost } from './Post';

export interface IPostRead extends Document {
  user: IUser;
  post: IPost;
  ip: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IPostReadModel extends Model<IPostRead> {}

const PostReadSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    ip: String,
  },
  { autoIndex: false, timestamps: true }
);

const PostRead: IPostReadModel = model<IPostRead>(
  'PostRead',
  PostReadSchema
) as IPostReadModel;

export default PostRead;
