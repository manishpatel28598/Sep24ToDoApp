const isEmailValidate = ({ key }) => {
  const isEmail =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
      key
    );
  return isEmail;
};




const userDataValidate = ({name, email, username, password})=>{
    return new Promise((resolve, reject)=>{
        if(!name || !email || !username || !password)reject("all field are required");
        if(typeof name !== "string") reject("name is not a text");
        if(typeof email !== "string") reject("email is not text")
        if(typeof username !== "string") reject("username is not text")
        if(typeof password !== "string") reject("password is not text")
        
        if(username.length < 3 || username.length > 50)
            reject("username length should be 3-50 chars");
            resolve();
         if (!isEmailValidate({ key: email })) reject("Email format is incorrect");
    });
};

module.exports = { userDataValidate, isEmailValidate };


// Email validation
// const isEmailValidate = ({key}) => {
//   const isEmail =
//       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(key);
//   return isEmail;
// }

// const trimData = (data) => ({
//   name: data.name.trim(),
//   email: data.email.trim(),
//   username: data.username.trim(),
//   password: data.password.trim()
// });

// const userDataValidate = ({name, email, username, password}) => {
//   return new Promise((resolve, reject) => {
//       // Trim the data
//       const userData = trimData({name, email, username, password});
//       name = userData.name;
//       email = userData.email;
//       username = userData.username;
//       password = userData.password;

//       // Basic checks
//       if (!name || !email || !username || !password) reject("Missing user data");

//       if (typeof name !== "string") reject("Name is not a text");
//       if (typeof email !== "string") reject("Email is not a text");
//       if (typeof username !== "string") reject("Username is not a text");
//       if (typeof password !== "string") reject("Password is not a text");

//       // Email validation
//       if (!isEmailValidate({key: email})) reject("Email format is incorrect");

// /* Extra Validation , Add these after the whole project is complete.

//       // Name validation
//       if (!/^[a-zA-Z\s]+$/.test(name)) reject("Name should only contain letters and spaces");
//       if (name.length < 2 || name.length > 100) reject("Name should be between 2 and 100 characters");

//       // Username validation
//       if (username.length < 3 || username.length > 50) reject("Username length should be 3-50 characters");
//       if (!/^[a-zA-Z0-9._]+$/.test(username)) reject("Username can only contain letters, numbers, dots, and underscores");
      



//       // Password validation
//       if (password.length < 8) reject("Password must be at least 8 characters long");
//       if (!/[A-Z]/.test(password)) reject("Password must contain at least one uppercase letter");
//       if (!/[a-z]/.test(password)) reject("Password must contain at least one lowercase letter");
//       if (!/[0-9]/.test(password)) reject("Password must contain at least one number");
//       if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) reject("Password must contain at least one special character");
// */

//       resolve();
//   });
// }

// module.exports = {userDataValidate, isEmailValidate};