import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Token } from '../entities/token.entity';
import { TokenService } from '../services/token.service.';
import { IncomingMessage, OutgoingMessage } from 'http';
import { transformAndValidateSync } from 'class-transformer-validator';

@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {

  constructor(private readonly reflector: Reflector, private readonly tokenService: TokenService) {

  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {

    // check @RefreshToken() decorator, get its reqTokenField (which field to set token for request)
    const refreshToken: string = this.reflector.get('RefreshToken', context.getHandler());
    if(refreshToken == null) {
      return next.handle();
    }

    // get http context, request and response
    const ctx: any = GqlExecutionContext.create(context).getContext();
    const request: IncomingMessage = ctx.req;
    const response: OutgoingMessage = ctx.res;

    // check authorization header
    const tokenHeader: string = request.headers.authorization;
    if(tokenHeader == null) {
      return next.handle();
    }

    // extract string token from authorization header
    // BE AWARE! @param(searchValue) should be 'Bearer ', NOT 'Bearer'. The blank should be replaced to ''!
    const token: string = tokenHeader.replace('Bearer ', '');

    // parse token to Token object
    let parsedToken: Token;
    try {
      parsedToken = await this.tokenService.parseAsync(token);
      parsedToken = await transformAndValidateSync(Token, parsedToken);
    }
    catch (e) {
      return next.handle();
    }

    response.setHeader('authorization', await this.tokenService.generateAsync(parsedToken));

    return next.handle();
  }
}
