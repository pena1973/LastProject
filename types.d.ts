
import {JwtPayload } from 'jsonwebtoken';
declare namespace Express {
    export interface Request {
        jwtPayload?: string | JwtPayload | undefined
    }
 }