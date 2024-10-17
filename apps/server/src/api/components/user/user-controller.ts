/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Response,
  Route,
  Tags,
} from 'tsoa'
import { inject, injectable } from 'tsyringe'

import { validationMiddleware } from '../../middlewares'
import { APIErrorResponse } from '../../shared'
import { userValidator } from '../../validators'
import { UserMapper } from './user-mapper'
import { UserDTO, UserListDTO } from './user-models'
import { IUserService } from './user-service'

@injectable()
@Route('users')
@Tags('users')
class UserController extends Controller {
  constructor(@inject('UserService') private userService: IUserService) {
    super()
  }

  /**
   * API endpoint used to create a new user
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

  @Get('/')
  public async fetchUserList(): Promise<UserListDTO> {
    const retrievedUserList = await this.userService.retrieveUserList()
    const userListDTO = retrievedUserList.map((u) => UserMapper.toDTO(u))
    this.setStatus(OK)
    return userListDTO
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
