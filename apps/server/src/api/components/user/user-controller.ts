import express from 'express'
import * as httpStatus from 'http-status'
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

import { IPaginationService } from '../../../services'
import { validationMiddleware } from '../../middlewares'
import { APIErrorResponse, APIPaginationResponse } from '../../shared'
import { paginationParamsValidator, userValidator } from '../../validators'
import { UserMapper } from './user-mapper'
import { IUserService } from './user-service'
import { UserRequest, UserResponse } from './user-types'

@injectable()
@Route('users')
@Tags('users')
class UserController extends Controller {
  constructor(
    @inject('UserService') private userService: IUserService,
    @inject('PaginationService')
    private paginationService: IPaginationService,
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
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    details: { context: undefined, cause: undefined },
    isOperational: false,
  })
  @Middlewares(validationMiddleware(userValidator))
  public async addUser(@Body() body: UserRequest): Promise<UserResponse> {
    const user = UserMapper.toDomain(body)
    const registeredUser = await this.userService.registerUser(user)
    const userResponse = UserMapper.toResponse(registeredUser)
    this.setStatus(httpStatus.CREATED)
    return userResponse
  }

  // @Get('/')
  // public async fetchUserList(): Promise<UserListResponse> {
  //   const retrievedUserList = await this.userService.retrieveUserList()
  //   const userListResponse = retrievedUserList.map((u) => UserMapper.toResponse(u))
  //   this.setStatus(OK)
  //   return userListResponse
  // }

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
      },
    ],
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    details: { context: undefined, cause: undefined },
    isOperational: false,
  })
  @Middlewares(validationMiddleware(paginationParamsValidator))
  public async fetchPaginatedUsers(
    @Request() req: express.Request,
    @Query() page?: number,
    @Query() limit?: number,
  ): Promise<APIPaginationResponse<UserResponse>> {
    const baseURL = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    const parsedQuery = paginationParamsValidator.parse({
      query: { page: page, limit: limit },
    })
    const [retrievedUsers, totalRecords] =
      await this.userService.retrieveAndCountUsers(
        parsedQuery.query.page,
        parsedQuery.query.limit,
      )
    const paginationConfig = {
      page: parsedQuery.query.page,
      limit: parsedQuery.query.limit,
      totalRecords: totalRecords,
      records: retrievedUsers.map((u) => UserMapper.toResponse(u)),
    }
    this.setStatus(httpStatus.OK)
    return this.paginationService.createResponse(baseURL, paginationConfig)
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
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    details: { context: undefined, cause: undefined },
    isOperational: false,
  })
  public async fetchUser(@Path() userId: string): Promise<UserResponse> {
    const retrievedUser = await this.userService.retrieveUser(userId)
    const userResponse = UserMapper.toResponse(retrievedUser)
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
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    details: { context: undefined, cause: undefined },
    isOperational: false,
  })
  @Middlewares(validationMiddleware(userValidator))
  public async renewUser(
    @Path() userId: string,
    @Body() body: UserRequest,
  ): Promise<UserResponse> {
    const user = UserMapper.toDomain(body)
    const replacedUser = await this.userService.replaceUser(userId, user)
    const userResponse = UserMapper.toResponse(replacedUser)
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
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    details: { context: undefined, cause: undefined },
    isOperational: false,
  })
  public async destroyUser(@Path() userId: string): Promise<UserResponse> {
    const deletedUser = await this.userService.removeUser(userId)
    const userResponse = UserMapper.toResponse(deletedUser)
    this.setStatus(httpStatus.OK)
    return userResponse
  }
}

export { UserController }
