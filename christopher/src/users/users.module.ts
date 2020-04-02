import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'User',
      schema: UserSchema,
      collection: 'users'
    }])
  ],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
