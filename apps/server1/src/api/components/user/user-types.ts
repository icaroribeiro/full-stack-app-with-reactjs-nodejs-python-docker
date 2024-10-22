type UserRequest = {
  name: string
  email: string
}

type User = {
  id?: string | undefined
  name: string
  email: string
}

type UserList = User[]

type UserResponse = {
  id: string
  name: string
  email: string
}

type UserListResponse = UserResponse[]

export { User, UserList, UserListResponse, UserRequest, UserResponse }
