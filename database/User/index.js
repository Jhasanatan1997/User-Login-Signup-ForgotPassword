import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullname: {type: String},
    username: {type: String, required: true},
    password: {type: String, required: true},
},
{
    timeStamps: true
}
)

export const UserModel = mongoose.model("User", UserSchema);