const express = require('express');
const app = express();
const crypto = require('crypto');
const userModel = require('./models/user');
const postModel = require('./models/post')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {    // cb is a callback function so it has a argument of error,filename,destination.

    cb(null, './public/images/uploads')// null because there is no error in cb.

  },

  //Using the crypto helps in security and it helps in buffering so that we can easily convert the binary digit number into a hex,binary or any alphabet.

  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, bytes) => {

      const fn = bytes.toString('hex') + path.extname(file.originalname);
      cb(null, fn);



    })

  }
})

const upload = multer({ storage: storage })


app.get('/', (req, res) => {
  res.render('index');
})


app.post('/register', async (req, res) => {
  let { name, username, email, password, age } = req.body;




  let user = await userModel.findOne({
    email
  })
  if (user) return res.status(500).send('user already registered');

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        name,
        age,
        password: hash,
        email
      })
      let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
      res.cookie("token", token);

      res.redirect('/login')
    })
  })




})


app.get('/login', (req, res) => {
  res.render('login')
})


app.post('/login', async (req, res) => {

  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went wrong");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
      res.cookie("token", token);
      res.status(200).redirect('profile')
    }
    else res.redirect("/login");

  })


})


app.get('/logout', (req, res) => {
  res.cookie("token", "");
  res.redirect('/login')

})

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") res.redirect('/login');
  else {
    let data = jwt.verify(req.cookies.token, "shhhh");
    req.user = data;
    next();
  }
}

app.get('/profile', isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email }).populate("posts")

  res.render('profile', { user });
})



app.post('/post', isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email })
  let { content } = req.body;

  let post = await postModel.create({
    user: user._id,
    content

  })
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile')

})

app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate('user');

  if (post.likes.indexOf(req.user.userid) === -1) {       // indexOf will be -1 if the userid not found in likes array.
    post.likes.push(req.user.userid)
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }
  await post.save()
  res.redirect('/profile')

})



app.get('/edit/:id', isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate('user')
  res.render('edit', { post })
})


app.post('/update/:id', isLoggedIn, async (req, res) => {
  await postModel.findByIdAndUpdate({ _id: req.params.id }, { content: req.body.content });
  res.redirect('/profile');
});


app.get('/profile/uploadprofile', (req, res) => {
  res.render('uploadprofile');
})


app.post("/upload", isLoggedIn, upload.single('image'), async (req, res) => {
  let profileuser = await userModel.findOne({ email: req.user.email })
  profileuser.profilepic = req.file.filename;
  await profileuser.save();
  res.redirect('/profile')

})




app.listen(3000)