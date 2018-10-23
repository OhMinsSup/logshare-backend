import { Schema, model, Document, Model, DocumentQuery } from 'mongoose';
import { IUser } from './User';
import { IPost } from './Post';

export interface ILike extends Document {
  user: IUser;
  post: IPost;
}

export interface ILikeModel extends Model<ILike> {
  checkExists(
    userId: string,
    postId: string
  ): Promise<DocumentQuery<ILike, ILike>>;
}

const LikeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

LikeSchema.statics.checkExists = function(
  userId: string,
  postId: string
): Promise<any> {
  return this.findOne({
    $and: [{ user: userId }, { post: postId }],
  })
    .lean()
    .exec();
};

const Like = model<ILike>('Like', LikeSchema) as ILikeModel;

export default Like;
