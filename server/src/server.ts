import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";



connectDB().then(()=>{
    app.listen(env.PORT,()=>{
        console.log(`Server running at http://localhost:${env.PORT}`)
    })
})
.catch((err)=>{
    console.log("failed to start server:", err)
})