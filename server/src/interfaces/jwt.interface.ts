import { UserRole } from "../constants/roles.js";

export interface IJwtPayload {
    id: string;
    role: UserRole;
}