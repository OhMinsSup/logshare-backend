import { Context, Middleware } from 'koa';
import * as Joi from 'joi';
import User, { IUser } from '../../../models/User';
import { checkEmpty } from '../../../lib/common';
import { TokenPayload } from '../../../lib/token';
import { Types } from 'mongoose';
import { serializeUsers } from '../../../lib/serialized';

/**
 * @description 유저 정보를 보여주는 api
 * @return {Promise<any>}
 * @param {Context} ctx koa Context
 */
export const getUserInfo: Middleware = async (ctx: Context) => {
  type ParamPayload = {
    name: string;
  };

  const { name }: ParamPayload = ctx.params;

  if (checkEmpty(name)) {
    ctx.status = 400;
    ctx.body = {
      name: 'INVALID_NAME',
    };
    return;
  }

  try {
    const user = await User.findByEmailOrUsername('username', name);

    if (!user) {
      ctx.status = 404;
      return;
    }

    ctx.body = {
      email: user.email,
      profile: user.profile,
      info: user.info,
      createdAt: user.createdAt,
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const profileUpdate: Middleware = async (ctx: Context) => {
  type BodySchema = {
    username: string;
    thumbnail: string;
    shortBio: string;
  };

  const schema = Joi.object().keys({
    username: Joi.string()
      .min(2)
      .max(15),
    thumbnail: Joi.string().uri(),
    shortBio: Joi.string().max(140),
    cover: Joi.string().uri(),
  });

  const result = Joi.validate(ctx.request.body, schema);

  if (result.error) {
    ctx.status = 400;
    ctx.body = {
      name: 'WRONG_SCHEMA',
      payload: result.error,
    };
    return;
  }

  const body: BodySchema = ctx.request.body;
  const { username } = body;

  if (username && checkEmpty(username)) {
    ctx.status = 400;
    ctx.body = {
      name: 'INVALID_NAME',
    };
    return;
  }

  const { _id: userId }: TokenPayload = ctx['user'];

  try {
    const profile: IUser = await User.findById(userId).exec();

    if (!profile) {
      ctx.throw(500, 'Invalid Profile');
    }

    ['username', 'shortBio', 'thumbnail', 'cover'].forEach(key => {
      if (body[key]) {
        profile.profile[key] = body[key];
      }
    });

    await profile.save();

    ctx.body = {
      profile,
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const usersList: Middleware = async (ctx: Context) => {
  type QueryPayload = {
    cursor: string | null;
  };

  const { cursor }: QueryPayload = ctx.query;

  if (cursor && !Types.ObjectId.isValid(cursor)) {
    ctx.status = 400;
    ctx.body = {
      name: 'Not ObjectId',
    };
    return;
  }

  const query = Object.assign({}, cursor ? { _id: { $lt: cursor } } : {});

  try {
    const users: IUser[] = await User.find(query)
      .select('profile')
      .sort({ _id: -1 })
      .limit(10)
      .lean()
      .exec();

    if (users.length === 0 || !users) {
      ctx.body = {
        next: '',
        usersWithData: [],
      };
      return;
    }

    const next =
      users.length === 10 ? `/common/user?cursor=${users[9]._id}` : null;

    ctx.body = {
      next,
      usersWithData: users.map(serializeUsers),
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};
