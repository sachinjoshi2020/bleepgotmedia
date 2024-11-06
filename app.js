var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const passport = require("passport");
const expressSession = require("express-session");
var indexRouter = require("./routes/index");
var usersRouter = require("./model/userSchema");
const dbConnection = require("./utils/dbConnect");
const Stripe = require("stripe");
const socketIO = require("socket.io");
const http = require("http");
const mehtodOverride = require('method-override');
const dotenv = require("dotenv");
const { log } = require("console");
dotenv.config();
var app = express();
dbConnection();

const port = process.env.PORT;

const stripeKey = process.env.STRIPE_KEY;
const stripeSecret = process.env.STRIPE_SECRET;
const stripe = Stripe(stripeSecret);

const server = http.createServer(app);

const io = socketIO(server);

io.on("connection", function (socket) {
  console.log(`user connected - ${socket.id}`);
  socket.on("typing", function () {
    socket.broadcast.emit("typing");
  });

  socket.emit("your id", socket.id);

  socket.on("chat message", (msg) => {
    io.emit("chat message", { msg, userId: socket.id });
  });
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(err.status || 500);
  res.render("error", { message: err.message });
});

app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
  })
);


app.use(mehtodOverride('_method'))

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

server.listen(port, () => {
  console.log(`server is the running port at http://localhost:${port}`);
});
