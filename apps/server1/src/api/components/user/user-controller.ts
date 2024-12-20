import express from 'express'
import httpStatus from 'http-status'
import {
  Body,
  Controller,
  Delete,
  Example,
  Get,
  Middlewares,
  Path,
  Post,
  Put,
  Query,
  Request,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa'
import { inject, injectable } from 'tsyringe'

import { IAPIPaginationService } from '../../../services'
import {
  APIErrorResponse,
  APIPaginationResponse,
  validationMiddleware,
} from '../../shared'
import { UserMapper } from './user-mapper'
import { IUserService } from './user-service'
import { User, UserRequest, UserResponse } from './user-types'
import { userSchema } from './user-validator'

@injectable()
@Route('users')
@Tags('users')
class UserController extends Controller {
  constructor(
    @inject('UserService') private userService: IUserService,
    @inject('APIPaginationService')
    private apiPaginationService: IAPIPaginationService,
  ) {
    super()
  }

  /**
   * API endpoint used to create a new user.
   */
  @Post('/')
  @SuccessResponse('201', 'Created')
  @Example<UserResponse>({
    id: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    name: 'name',
    email: 'email@email.com',
    createdAt: new Date(),
    updatedAt: null,
  })
  @Response<APIErrorResponse>('422', 'Unprocessable Entity', {
    message: 'Unprocessable Entity',
    detail: { context: 'context', cause: 'cause' },
    isOperational: true,
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    detail: { context: 'context', cause: 'cause' },
    isOperational: false,
  })
  @Middlewares(validationMiddleware(userSchema))
  public async addUser(@Body() body: UserRequest): Promise<UserResponse> {
    const userMapper = new UserMapper()
    const user = userMapper.toDomain(body)
    const registeredUser = await this.userService.registerUser(user)
    const userResponse = userMapper.toResponse(registeredUser)
    this.setStatus(httpStatus.CREATED)
    return userResponse
  }

  /**
   * API endpoint used to get users through page-based pagination schema.
   * @param page The number of the page. If isn't provided, it will be set to 1.
   * @param limit The number of records per page. If isn't provided, it will be set to 1.
   */
  @Get('/')
  @SuccessResponse('200', 'OK')
  @Example<APIPaginationResponse<UserResponse>>({
    page: 1,
    limit: 1,
    totalPages: 1,
    totalRecords: 1,
    records: [
      {
        id: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
        name: 'name',
        email: 'email@email.com',
        createdAt: new Date(),
        updatedAt: null,
      },
    ],
    previous: 'previous',
    next: 'next',
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    detail: { context: 'context', cause: 'cause' },
    isOperational: false,
  })
  public async fetchPaginatedUsers(
    @Request() req: express.Request,
    @Query() page?: number,
    @Query() limit?: number,
  ): Promise<APIPaginationResponse<UserResponse>> {
    const baseURL = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    page = page ? page : 1
    limit = limit ? limit : 1
    const [retrievedUsers, totalRecords] =
      await this.userService.retrieveAndCountUsers(page, limit)
    const apiPaginationData = {
      page: page,
      limit: limit,
      totalRecords: totalRecords,
      records: retrievedUsers,
    }
    const apiPaginationResponse =
      this.apiPaginationService.createResponse<User>(baseURL, apiPaginationData)
    this.setStatus(httpStatus.OK)
    return apiPaginationResponse
  }

  /**
   * API endpoint used to get a user by its ID.
   */
  @Get('{userId}')
  @SuccessResponse('200', 'OK')
  @Example<UserResponse>({
    id: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    name: 'name',
    email: 'email@email.com',
    createdAt: new Date(),
    updatedAt: null,
  })
  @Response<APIErrorResponse>('404', 'Not Found', {
    message: 'Not Found',
    detail: { context: 'context', cause: 'cause' },
    isOperational: true,
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    detail: { context: 'context', cause: 'cause' },
    isOperational: false,
  })
  public async fetchUser(@Path() userId: string): Promise<UserResponse> {
    const retrievedUser = await this.userService.retrieveUser(userId)
    const userMapper = new UserMapper()
    const userResponse = userMapper.toResponse(retrievedUser)
    this.setStatus(httpStatus.OK)
    return userResponse
  }

  /**
   * API endpoint used to update a user by its ID.
   */
  @Put('{userId}')
  @SuccessResponse('200', 'OK')
  @Example<UserResponse>({
    id: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    name: 'name',
    email: 'email@email.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  @Response<APIErrorResponse>('404', 'Not Found', {
    message: 'Not Found',
    detail: { context: 'context', cause: 'cause' },
    isOperational: true,
  })
  @Response<APIErrorResponse>('422', 'Unprocessable Entity', {
    message: 'Unprocessable Entity',
    detail: { context: 'context', cause: 'cause' },
    isOperational: true,
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    detail: { context: 'context', cause: 'cause' },
    isOperational: false,
  })
  @Middlewares(validationMiddleware(userSchema))
  public async renewUser(
    @Path() userId: string,
    @Body() body: UserRequest,
  ): Promise<UserResponse> {
    const userMapper = new UserMapper()
    const user = userMapper.toDomain(body)
    const replacedUser = await this.userService.replaceUser(userId, user)
    const userResponse = userMapper.toResponse(replacedUser)
    this.setStatus(httpStatus.OK)
    return userResponse
  }

  /**
   * API endpoint used to delete a user by its ID.
   */
  @Delete('{userId}')
  @SuccessResponse('200', 'OK')
  @Example<UserResponse>({
    id: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    name: 'name',
    email: 'email@email.com',
    createdAt: new Date(),
    updatedAt: null,
  })
  @Response<APIErrorResponse>('404', 'Not Found', {
    message: 'Not Found',
    detail: { context: 'context', cause: 'cause' },
    isOperational: true,
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    detail: { context: 'context', cause: 'cause' },
    isOperational: false,
  })
  public async destroyUser(@Path() userId: string): Promise<UserResponse> {
    const deletedUser = await this.userService.removeUser(userId)
    const userMapper = new UserMapper()
    const userResponse = userMapper.toResponse(deletedUser)
    this.setStatus(httpStatus.OK)
    return userResponse
  }
}

export { UserController }
