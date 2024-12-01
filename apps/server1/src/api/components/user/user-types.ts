type UserRequest = {
  name: string
  email: string
}

type User = {
  id: string | null
  name: string
  email: string
  createdAt: Date | null
  updatedAt: Date | null
}

type UserResponse = {
  id: string | null
  name: string
  email: string
  createdAt: Date | null
  updatedAt: Date | null
}

export { User, UserRequest, UserResponse }
