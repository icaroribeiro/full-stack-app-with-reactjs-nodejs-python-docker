type User = {
  id?: string | undefined
  name: string
  email: string
}

type UserList = User[]

type UserDTO = {
  id: string
  name: string
  email: string
}

type UserListDTO = UserDTO[]

export { User, UserDTO, UserList, UserListDTO }
