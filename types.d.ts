
import {JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
declare namespace Express {
    export interface Request {
        jwtPayload?: string | JwtPayload | undefined
    }
 }