import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { User } from '../../user/models/user.model';
import { PostStatus } from '../constants/status.constant';

export const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: PostStatus.VALID
  },
  createdTime: {
    type: Date,
    default: new Date()
  },
  lastUpdateTime: {
    type: Date
  },
  thread: {
    type: Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  versionKey: false
  })
  .pre('findOneAndUpdate', function(next) {
    this.setOptions({ runValidators: true, new: true, useFindAndModify: false});
    next();
  })
  .post('save', (error, doc, next) => {
    if('MongoError' === error.name) {
      if(error.code === 11000) {
        throw new ConflictException('Duplicated user identifier!');
      }
    }
    if('ValidationError' === error.name) {
      throw new BadRequestException(error.message);
    }
    next(error);
  })
  .post('findOneAndUpdate', (error, doc, next) => {
    if('ValidationError' === error.name) {
      throw new BadRequestException(error.message);
    }
    next(error);
  });
