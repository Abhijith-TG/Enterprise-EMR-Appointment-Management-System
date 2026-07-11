import { UserRole } from "../constants/roles.js";

export interface IUser {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
}


