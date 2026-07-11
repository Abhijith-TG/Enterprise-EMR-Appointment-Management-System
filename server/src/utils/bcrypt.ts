import bycrpt from 'bcrypt'

const SALT_ROUNDS = 10;


export const hashPassword = async (password: string)=>{
    return bycrpt.hash(password,SALT_ROUNDS);
}

export const comparePassword = async (password: string, hashedPassword: string) =>{
    return bycrpt.compare(password,hashedPassword);
}