/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'
import { CREATED, OK } from 'http-status'
import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  Path,
  Post,
  Put,
  Query,
  Request,
  Response,
  Route,
  Tags,
} from 'tsoa'
import { inject, injectable } from 'tsyringe'

import { validationMiddleware } from '../../middlewares'
import { APIErrorResponse, APIPaginatedEntityResponse } from '../../shared'
import { paginationQueryParamsValidator, userValidator } from '../../validators'
import { UserMapper } from './user-mapper'
import { UserDTO } from './user-models'
import { IUserService } from './user-service'

@injectable()
@Route('users')
@Tags('users')
class UserController extends Controller {
  constructor(@inject('UserService') private userService: IUserService) {
    super()
  }

  /**
   * API endpoint used to create a new user.
   */
  @Post('/')
  @Response<UserDTO>('201', 'Created', {
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
  public async addUser(@Body() body: any): Promise<UserDTO> {
    const user = UserMapper.toDomain(body)
    const registeredUser = await this.userService.registerUser(user)
    const userDTO = UserMapper.toDTO(registeredUser)
    this.setStatus(CREATED)
    return userDTO
  }

  // @Get('/')
  // public async fetchUserList(): Promise<UserListDTO> {
  //   const retrievedUserList = await this.userService.retrieveUserList()
  //   const userListDTO = retrievedUserList.map((u) => UserMapper.toDTO(u))
  //   this.setStatus(OK)
  //   return userListDTO
  // }

  /**
   * API endpoint used to fetch users usgn page-based pagination schema.
   * Supply the page and limit pagination parameters and receive the selecting users.
   * @param page The number of the page. If isn't provided, it will be set to 1.
   * @param limit The number of records per page. If isn't provided, it will be set to 1.
   */
  @Get('/')
  @Response<APIPaginatedEntityResponse<UserDTO>>('200', 'OK', {
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
  @Middlewares(validationMiddleware(paginationQueryParamsValidator))
  public async fetchUserListWithPagination(
    @Request() req: express.Request,
    @Query() page?: number,
    @Query() limit?: number,
  ): Promise<APIPaginatedEntityResponse<UserDTO>> {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    const parsedQuery = paginationQueryParamsValidator.parse({
      query: { page: page, limit: limit },
    })
    const paginationConfig = {
      url: url,
      page: parsedQuery.query.page,
      limit: parsedQuery.query.limit,
    }
    const retrievedUsers =
      await this.userService.retrieveUsers(paginationConfig)
    const retrievedUsersDTO = {
      ...retrievedUsers,
      records: retrievedUsers.records.map((u) => UserMapper.toDTO(u)),
    }
    this.setStatus(OK)
    return retrievedUsersDTO
  }

  @Get('{userId}')
  public async fetchUser(@Path() userId: string): Promise<UserDTO> {
    const retrievedUser = await this.userService.retrieveUser(userId)
    const userDTO = UserMapper.toDTO(retrievedUser)
    this.setStatus(OK)
    return userDTO
  }

  @Put('{userId}')
  @Middlewares(validationMiddleware(userValidator))
  public async renewUser(
    @Path() userId: string,
    @Body() body: any,
  ): Promise<UserDTO> {
    const user = UserMapper.toDomain(body)
    const replacedUser = await this.userService.replaceUser(userId, user)
    const userDTO = UserMapper.toDTO(replacedUser)
    this.setStatus(OK)
    return userDTO
  }

  @Delete('{userId}')
  public async destroyUser(@Path() userId: string): Promise<UserDTO> {
    const deletedUser = await this.userService.removeUser(userId)
    const userDTO = UserMapper.toDTO(deletedUser)
    this.setStatus(OK)
    return userDTO
  }
}

export { UserController }
