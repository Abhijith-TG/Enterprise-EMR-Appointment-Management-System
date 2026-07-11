import { User } from "../models/user.model.js";

export const authRepository = {

    findUserByEmail: async (email: string) => {

        return User.findOne({ email })
            .select("+password");

    }

};