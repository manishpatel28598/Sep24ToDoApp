const todoDataValidation = ({todo})=>{
    return new Promise((resolve, reject)=>{
        if(!todo) return reject("todo is missing");

            if(typeof todo !== 'string') return reject("todo is not a text")

                if(todo.length<3 || todo.length>50)
                    return reject("todo length should be 3-50 chars");
                resolve();
    });
};

module.exports = todoDataValidation;
