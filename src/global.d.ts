declare namespace Express {
    interface CustomSessionFields {
        user: any
    }

    export interface Request {
        session: Session & Partial<SessionData> & CustomSessionFields
    }
}