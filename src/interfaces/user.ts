import { Model } from "mongoose"

export interface IUser {
    username: string,
    email: string,
    password: string,
    admin: boolean,
}

// User Schema method interface
export interface IUserMethod {
    comparePassword(password: string): boolean
}

// User model type
export type UserModel = Model<IUser, {}, IUserMethod>