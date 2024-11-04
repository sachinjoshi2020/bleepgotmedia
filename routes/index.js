var express = require("express");
var router = express.Router();
const userSchema = require("../model/userSchema");
const upload = require("../middleware/multer");
const passport = require("passport");
const postSchema = require("../model/postSchema");
const passportLocal = require("passport-local").Strategy;
passport.use(new passportLocal(userSchema.authenticate()));
const dotenv = require("dotenv");
dotenv.config();
const clientSecret = process.env.STRIPE_SECRET;

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "login account", nav: false, chatbot: false });
});
router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "create account", nav: false, chatbot: false });
});
router.get("/profile", isLoggedIn, async function (req, res, next) {
  const posts = (await postSchema.find().populate("user")).reverse();
  res.render("profile", {
    title: `${req.user.username} 'profile`,
    nav: true,
    chatbot: true,
    posts,
    user: req.user,
  });
});

router.get("/myPosts", isLoggedIn, async function (req, res, next) {
  const userP = await userSchema.findById(req.user._id).populate("posts");

  res.render("myPosts", {
    title: "My Stuff",
    nav: true,
    chatbot: true,
    userP,
    user: req.user,
  });
});

router.get("/reels", isLoggedIn, async function (req, res, next) {
  const userP = await userSchema.findById(req.user._id).populate("posts");
  console.log(userP.posts);
  res.render("reels", {
    title: "Reels",
    nav: true,
    chatbot: true,
    userP,
    user: req.user,
  });
});

router.get("/edit", isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findById(req.user._id);
  res.render("edit", { title: "edit profile", nav: true, chatbot: true, user });
});

router.get("/updatePost", isLoggedIn, async function (req, res, next) {
  try {
    const user = await userSchema.findById(req.user._id);
    res.render("updatePost", {
      user,
      nav: true,
      chatbot: true,
      title: "createPost",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.get("/updateReel", isLoggedIn, async function (req, res, next) {
  res.render("updateReel", {
    title: "Upload Video",
    nav: true,
    chatbot: true,
    user: req.user,
  });
});

router.get("/payment", isLoggedIn, async function (req, res, next) {
  res.render("payment", {
    title: "Payment",
    nav: true,
    chatbot: true,
    user: req.user,
  });
});
router.get("/searchresult", isLoggedIn, async function (req, res, next) {
  res.render("searchresult", {
    title: "searchresult",
    nav: true,
    chatbot: true,
    user: req.user,
  });
});
router.get("/setting", isLoggedIn, async function (req, res, next) {
  res.render("setting", {
    title: "setting",
    nav: false,
    chatbot: true,
    user: req.user,
  });
});
router.get("/myprofile", isLoggedIn, async function (req, res, next) {
  try {
    const userAll = await userSchema.find();
    const currentUser = await userSchema.findById(req.user.id);
    res.render("myprofile", {
      title: "user's profile",
      nav: false,
      chatbot: true,
      user: req.user,
      userAll,
      currentUser,
    });
  } catch (error) {
    res.status(500).send("Server error");
    next(error);
  }
});

router.get("/searchProfileuser", isLoggedIn, async function (req, res, next) {
  res.render("searchProfileuser", {
    title: "searchresult-user",
    nav: false,
    chatbot: false,
    user: req.user,
  });
});
router.get("/userProfiledata", isLoggedIn, async function (req, res, next) {
  res.render("userProfiledata", {
    title: "Detail-user",
    nav: false,
    chatbot: false,
    user: req.user,
  });
});

// router.get('/search', isLoggedIn, async (req, res) => {
//   const searchQuerie = req.query.quries

//   try {
//     const result = await postSchema.find({
//       title: { $regex: searchQuerie, $options: "i" }
//     });
//     const user = await userSchema
//       .findOne({ username: req.session.passport.user })
//       .populate("posts");
//       console.log(user);

//     res.render('searchResult', {
//       title: "Search",
//       nav: true,
//       user,
//       posts: result
//     })

//   } catch (error) {
//     console.log(error);

//   }

// })
router.get("/search", isLoggedIn, async (req, res) => {
  const searchQuerie = req.query.quries;

  try {
    const result = await postSchema
      .find({ title: { $regex: searchQuerie, $options: "i" } })
      .populate("user"); // Ensure user field is populated

    const user = await userSchema
      .findOne({ username: req.session.passport.user })
      .populate("posts");

    res.render("searchResult", {
      title: "Search",
      nav: true,
      chatbot: true,
      user,
      posts: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while searching.");
  }
});

router.get("/searchResultuser", isLoggedIn, async (req, res) => {
  const searchQuery = req.query.searchq;

  try {
    // Use regex to search for usernames that match the search query (case-insensitive)
    const result = await userSchema.find({
      username: { $regex: searchQuery, $options: "i" }, // Ensure you are using the correct model
    });

    res.render("searchProfileuser", {
      title: "Search Results",
      nav: false,
      chatbot: false,
      user: req.user,
      result, // Pass the search results to the view
      searchQuery,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while searching.");
  }
});

router.get("/editSelfProfile", isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findById(req.user._id);
  res.render("editSelfProfile", {
    title: `${user.username}'s Profile`,
    nav: false,
    chatbot: false,
    user,
  });
});

router.post("/follow/:id", isLoggedIn, async function (req, res, next) {
  try {
    const userToFollow = await userSchema.findById(req.params.id);
    const currentUser = await userSchema.findById(req.user.id);

    if(!userToFollow || !currentUser){
      return res.status(500).send('User not found');
    }
    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
      await currentUser.save();
      await userToFollow.save();
  }
    res.redirect('/myprofile')
  } catch (error) {
    console.log(error);
  }
});

router.post('/unfollow/:id', async (req, res) => {
  try {
      const userToUnfollow = await userSchema.findById(req.params.id);
      const currentUser = await userSchema.findById(req.user.id); // Assuming req.user is set

      if (!userToUnfollow || !currentUser) {
          return res.status(404).send('User not found');
      }

      currentUser.following.pull(userToUnfollow._id);
      userToUnfollow.followers.pull(currentUser._id);
      await currentUser.save();
      await userToUnfollow.save();

      res.redirect('/myprofile'); // Redirect to users page
  } catch (error) {
      res.status(500).send('Server error');
  }
});

router.post("/likePost/:id", isLoggedIn, async function (req, res) {
  try {
    const post = await postSchema.findById(req.params.id);

    // Check if user already liked the post
    if (!post.likesData.includes(req.user._id)) {
      post.likesData.push(req.user._id);
      await post.save();
    }

    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while liking the post."); // User feedback
  }
});

router.post(
  "/create-payment-intent",
  isLoggedIn,
  async function (req, res, next) {
    try {
      const { amount } = req.body; // Amount should be in cents

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
      });

      res.status(200).send({
        clientSecret: paymentIntent.clientSecret,
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

router.post(
  "/profileUpdate",
  isLoggedIn,
  upload.single("userprofile"),
  async function (req, res, next) {
    const { filename } = req.file;

    try {
      const user = await userSchema.findById(req.user._id);

      user.profileImage = filename;

      await user.save();

      res.redirect("/profile");
    } catch (error) {
      console.log(error);
    }
  }
);

router.post(
  "/createPost",
  isLoggedIn,
  upload.single("postImage"),
  async function (req, res, next) {
    try {
      const user = await userSchema.findById(req.user._id);
      const { title, description } = req.body;

      const post = await postSchema.create({
        title,
        description,
        user: user._id,
        postImage: req.file.filename,
      });

      user.posts.push(post._id);

      await user.save();

      res.redirect("/profile");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal Server Error", message: error.message });
      return;
    }
  }
);

router.post(
  "/createReel",
  isLoggedIn,
  upload.single("postReel"),
  async function (req, res, next) {
    try {
      const user = await userSchema.findById(req.user._id);
      const { title, description } = req.body;

      const reel = await postSchema.create({
        title,
        description,
        user: user._id,
        postReel: req.file.filename,
      });

      user.posts.push(reel._id);

      await user.save();

      res.redirect("/reels");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal Server Error", message: error.message });
      return;
    }
  }
);

router.post(
  "/editProfile",
  isLoggedIn,
  upload.single("image"),
  async function (req, res, next) {
    try {
      const { username, name } = req.body;
      const user = await userSchema.findById(req.user._id);

      user.username = username || user.username;
      user.name = name || user.name;

      if (req.file) {
        user.profileImage = req.file.filename;
      }

      await user.save();

      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("/profile");
      });
    } catch (error) {
      console.log(error);
      res.redirect("/profile");
    }
  }
);

router.post("/register", async function (req, res) {
  const { username, email, password } = req.body;

  const user = await userSchema({
    username: username,
    email: email,
  });

  userSchema.register(user, password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.set("Cache-Control", "no-store");
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  try {
    if (req.isAuthenticated()) {
      res.set("Cache-Control", "no-store");
      return next();
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = router;
