import config from "../config/config";
import { Request, Response } from "express";

import { User } from '../models/user.model'
import { IUser } from "../interfaces/user";
import { signInValidation, signUpValidation } from "../helper/user-validation";

/**
 * User Sign in controller
 * @param req Node HTTP Request
 * @param res Node HTTP Response
 * @returns HTTP Response
 */
export const signIn = async (req: Request, res: Response) => {
    try{
        // Validate user input
        const value: Pick<IUser, 'email'|'password'> = await signInValidation.validateAsync(req.body)

        const {email, password} = value

        const user = await User.findOne({email})

        // If user didn't found
        if(!user) {
            console.log('[server]: ERR! email-not-registered-in-the-database')
            return res.status(401).send({
                error: true,
                status: 401,
                type: 'SignInError',
                data: {
                    message: 'User with corresponding email not found.'
                }
            })
        }
        
        const {username, admin} = user
        
        // Authenticating user by password
        const authenticated = await user.comparePassword(password)

        // If user unauthorized
        if(!authenticated){
            console.log('[server]: ERR! invalid-user-credential-provided-by-the-client')
            return res.status(401).send({
                error: true,
                status: 401,
                type: 'SignInError',
                data: {
                    message: 'Invalid credential provided.'
                }
            })
        }

        const clientSession: Omit<IUser, 'password'> = {
            username,
            email,
            admin
        }

        // Set client session
        req.session.user = clientSession

        // Success response
        console.log(`[server]: OK! ${email}-signed-in!`)
        return res.status(300).send({
            success:true,
            status: 300,
            data: {
                message: 'Successfully signed up',
                ...clientSession
            }
        })
    }
    catch(error){
        // Error handler if something went wrong while signing in user
        console.error('sign-in-error', error)
        return res.status(500).send({
            error: true,
            status: 500,
            type: 'SignInError',
            data: {
                message: 'Something went wrong while trying to sign in, please try again.'
            }
        })
    }
}

/**
 * User Sign up controller
 * @param req Node HTTP Request
 * @param res Node HTTP Response
 * @returns HTTP Response
 */
export const signUp = async (req: Request, res: Response) => {
    try{
        // Validate user input
        const value: IUser = await signUpValidation.validateAsync(req.body)

        const {email} = value;

        const user = await User.findOne({email})

        // If user already registered
        if(user){
            console.log('[server]: ERR! email-already-registered')
            return res.status(401).send({
                error: true,
                status: 401,
                type: 'SignUpError',
                data: {
                    message: 'User with corresponding email already registered.'
                }
            })
        }

        // Saving new user to database
        await new User(value).save()

        // Success response
        console.log(`[server]: OK! ${value.email}-signed-up!`)
        return res.status(300).send({
            success:true,
            status: 300,
            data: {
                message: 'Successfully signed up, please login to continue.',
            }
        })
    }
    catch(error){
        // Error handler if something went wrong while signing up user
        console.error('sign-up-error', error)
        return res.status(500).send({
            error: true,
            status: 500,
            type: 'SignUpError',
            data: {
                message: 'Something went wrong while trying to sign up, please try again.'
            }
        })
    }
}

/**
 * User Sign out controller
 * @param req Node HTTP Request
 * @param res Node HTTP Response
 * @returns HTTP Response
 */
export const signOut = async (req: Request, res: Response) => {
    try {
        if(!req.session.user) {
            console.log('[server]: ERR! no-session-id-provided-by-the-client!')
            return res.status(401).send({
                error: true,
                status: 401,
                type: 'SignOutError',
                data: {
                    message: 'No session id provided.'
                }
            })
        }

        const {email} = req.session.user

        req.session.destroy((error: Error) => {
            if(error) throw error;

            res.clearCookie(config.SESSION_COLLECTION_NAME)

            // Success response
            console.log(`[server]: OK! ${email}-successfully-signed-out!`)
            return res.status(300).send({
                success:true,
                status: 300,
                data: {
                    message: 'See you later.'
                }
            })
        })
    } catch (error) {
        // Error handler if something went wrong while signing out user
        console.log('[server]: ERR! User sign out error!', error)
        return res.status(500).send({
            error: true,
            status: 500,
            type: 'SignOutError',
            data: {
                message: 'Something went wrong while trying to sign out, please try again.'
            }
        })
    }
}