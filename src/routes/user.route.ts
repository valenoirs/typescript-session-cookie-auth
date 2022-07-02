import express from 'express'
import { signIn, signUp, signOut } from '../controllers/user.controller'

export const router = express.Router()

router.route('/signin').post(signIn)

router.route('/signup').post(signUp)

router.route('/signout').get(signOut)