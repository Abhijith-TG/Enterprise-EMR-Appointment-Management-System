import dotenv from 'dotenv'


dotenv.config()

export const env = {
    PORT: process.env.PORT || '8080',
    MONGO_URI: process.env.MONGO_URI!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!
}