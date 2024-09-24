const mongoose = require('mongoose')
const todoSchema = mongoose.Schema({
    todo: {
        type : String,
        reqired : true,
        minLength : 3,
        maxLength : 100,
        trim : true
    },
    username: {
        type: "String",
        reqired : true,
    },
    creationDateTime : {
        type : Date,
        default : Date.now()
    },
},
{
    timeStamps: true,
}
);

module.exports = mongoose.model("todo", todoSchema);
