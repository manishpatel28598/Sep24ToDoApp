const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);

//file-imports
const { userDataValidate, isEmailValidate } = require("./utils/authUtils");
const userModel = require("./models/userModel");
const isAuth = require("./middlewares/isAuthMiddleware");
const todoModel = require("./models/todoModel");
const todoDataValidation = require("./utils/todoUtils");

//constants
const app = express();
const PORT = process.env.PORT || 8000;
const store = new mongodbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// db connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("mongo is connected successfully"))
  .catch((err) => console.log(err));

//middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // parse the data
app.use(
  session({
    secret: process.env.SECRET_KEY,
    store: store,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static("public"))

//api's
app.get("/", (req, res) => {
  return res.send("server is up and running");
});

app.get("/register", (req, res) => {
  return res.render("registerPage");
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, email, username, password } = req.body;

  //data validation
  try {
    await userDataValidate({ name, username, email, password });
  } catch (error) {
    return res.status(400).json(error);
  }

  try {
    //check for email is exist then throw a msg "user email already exist"
    const userEmailExist = await userModel.findOne({ email });
    console.log(userEmailExist);
    if (userEmailExist) {
      return res.status(400).json("user email already exist");
    }

    //check for email is exist then throw a msg "username already exist"
    const userusernameExist = await userModel.findOne({ username });
    console.log(userusernameExist);
    if (userusernameExist) {
      return res.status(400).json("username already exist");
    }

    //hashing the password

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT)
    );

    //create userModel instance
    const userObj = new userModel({
      name: name,
      email: email,
      username: username,
      password: hashedPassword,
    });

    const userDb = await userObj.save();
    return res.redirect("/login");
    // return res.status(201).json({
    //     message: 'register successfull',
    //     data: userDb,
    // })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
});

app.get("/login", (req, res) => {
  return res.render("loginPage");
});

app.post("/login", async (req, res) => {
  console.log("request. body", req.body);

  const { loginId, password } = req.body;
  console.log("isEmailValidate", isEmailValidate({ key: loginId }));
  if (!loginId || !password) {
    // console.log(loginId);
    // console.log(password);
    return res.status(400).json("user's credential are missing");
  }

  try {
    let userDb;
    // find the user from db with loginId
    if (isEmailValidate({ key: loginId })) {
      userDb = await userModel.findOne({ email: loginId });
      console.log("founded using email");
    } else {
      userDb = await userModel.findOne({ username: loginId });
      console.log("founded using username");
    }
    if (!userDb)
      return res.status(400).json("User not found, please register first.");

    //comparing the password
    const isMatched = await bcrypt.compare(password, userDb.password);
    if (!isMatched) return res.status(400).json("Incorrect password");
    console.log(userDb);

    req.session.isAuth = true;
    req.session.user = {
      userId: userDb._id,
      username: userDb.username,
      email: userDb.email,
    };

    return res.redirect("/dashboard");
  } catch (error) {
    return res.status(500).json(error);
  }
});
app.get("/dashboard", isAuth, (req, res) => {
  return res.render("Dashboard");
});

app.post("/logout", isAuth, (req, res) => {
  console.log(req.session.id);

  req.session.destroy((err) => {
    if (err) return res.status(400).json("Logout unsuccessfull");

    return res.status(200).json("Logout successfull");
  });
});

app.post("/logout-out-from-all", isAuth, async (req, res) => {
  // return req.send(req.session.user.username);
  const username = req.session.user.username;
  console.log(username);
  //create a schema
  const sessionSchema = new mongoose.Schema({ _id: String }, { strict: false });
  //convert into model
  const sessionModel =
    mongoose.models.session || mongoose.model("session", sessionSchema);
  //db query  to delete sessions
  try {
    const deleteDb = await sessionModel.deleteMany({
      "session.user.username": username,
    });
    console.log(deleteDb);
    return res.redirect("/login");
  } catch (error) {
    return res.status(500).json("");
  }
});

//todos api
app.post("/create-item", isAuth, async (req, res) => {
  const username = req.session.user.username;
  const todo = req.body.todo;

  console.log(req.body);

  try {
    const result = await todoDataValidation({ todo });
    console.log(result);
  } catch (error) {
    return res.send({
      status: 400,
      message: error,
    });
  }

  const todoObj = new todoModel({
    todo,
    username,
  });

  try {
    const todoDb = await todoObj.save();
    console.log("todoDb : ", todoDb);

    return res.send({
      status: 201,
      message: "todo created successfully",
      data: todoDb,
    });
  } catch (error) {
    return res.send({
      status: 400,
      error: error,
    });
  }
});

//read the todo
app.get("/read-item", isAuth, async (req, res) => {
  const username = req.session.user.username;
  console.log(req.query);
  const SKIP = Number(req.query.skip) || 0;
  const LIMIT = 5;
  try {
    // const tododb = await todoModel.find({ username: username });
    // match, skip,  limit
    const tododb = await todoModel.aggregate([
      {$match : {username : username}},
      {
        $skip : SKIP
      },
      {
        $limit : LIMIT
      },
    ]);


    // todo is not present
    if(tododb.length ===0){
        return res.send({
            status : 204,
            message : "No todo found",
        })
    }
    return res.send({
      status: 200,
      message: "Read success",
      data: tododb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "internal  server error",
    });
  }
});

//update and edit the todo
app.post("/edit-item", isAuth, async (req, res) => {
  const { todoId, newData } = req.body;
  const username = req.session.user.username;
  console.log(req.body);

  try {
    await todoDataValidation({ todo: newData });
  } catch (error) {
    return res.send({
      status: 400,
      message: error,
    });
  }

  //find todos

  try {

    //ownership check
    const todoDb = await todoModel.findOne({ _id: todoId });

    if (username !== todoDb.username) {
      return res.send({
        status: 403,
        message: "not allow to edit this todo",
      });
    }
    //update the todo
    const todoDbNew = await todoModel.findOneAndUpdate(
      { _id: todoId },
      { todo: newData },
      { new: true }
    );
    return res.send({
      status: 200,
      message: "Todo updated successfully",
      data: todoDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});


//delete api
app.post("/delete-item", isAuth, async (req, res) => {
    const { todoId} = req.body;
    const username = req.session.user.username;
    console.log(req.session);
  
    //find todos
  
    try {
  
      //ownership check
      const todoDb = await todoModel.findOne({ _id: todoId });
      if (username !== todoDb.username) {
        return res.send({
          status: 403,
          message: "not allow to delete this todo",
        });
      }
  
      const todoDeletedDb = await todoModel.findByIdAndDelete({ _id: todoId });
      
      return res.send({
        status: 200,
        message: "Todo deleted successfully",
        data : todoDeletedDb,
      });
    } catch (error) {
      return res.send({
        status: 500,
        message: "Internal server error",
        error: error,
      });
    }
  });


app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
