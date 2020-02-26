const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('./models/Users');
require('../../lib/passport');

//find all users
router.get('/', (req, res) => {
  //empty object allows us to fill with users
  User.find({})
    .then(users => {
      return res.status(200).json({ message: 'Success', users });
    })
    .catch(err => res.status(500).json({ message: 'Server Error' }));
});

router.get('/success', (req, res) => {
  return res.render('success');
});

router.get('/fail', (req, res) => {
  return res.render('fail');
});

//Validation Middleware
const myValidation = (req, res, next) => {
  // validate the inputs
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(403).json({ message: 'All Inputs Must Be Filled' });
  }
  next();
};
//Register WITH Passport
router.post('/register', myValidation, (req, res) => {
  // check if user exists
  User.findOne({ email: req.body.email })
    .then(user => {
      //check to see if there is a user value
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
      // create a new user from the User model
      const newUser = new User();

      // salt password...place extra characters in password to make harder to guess
      const salt = bcrypt.genSaltSync(10);
      // hash password
      const hash = bcrypt.hashSync(req.body.password, salt);
      // set values for the user to model keys
      newUser.name = req.body.name;
      newUser.email = req.body.email;
      newUser.password = hash;
      // save the user
      newUser
        .save()
        .then(user => {
          return req.login(user, err => {
            if (err) {
              return res.status(500).json({ message: 'Server Error', err });
            } else {
              console.log('register...', req.session);
              res.redirect('/users/success');
            }
          });
        })
        .catch(err => res.status(400).json({ message: 'User not saved', err }));
    })
    .catch(err => res.status(418).json({ message: 'We messed up', err }));
});

// Register Without Passport
// router.post('/register', (req, res) => {
//   // validate the inputs
//   if (!req.body.name || !req.body.email || !req.body.password) {
//     return res.status(403).json({ message: 'All Inputs Must Be Filled' });
//   }
//   // check if user exists
//   User.findOne({ email: req.body.email })
//     .then(user => {
//       //check to see if there is a user value
//       if (user) {
//         return res.status(400).json({ message: 'User already exists' });
//       }
//       // create a new user from the User model
//       const newUser = new User();

//       // salt password...place extra characters in password to make harder to guess
//       const salt = bcrypt.genSaltSync(10);
//       // hash password
//       const hash = bcrypt.hashSync(req.body.password, salt);
//       // set values for the user to model keys
//       newUser.name = req.body.name;
//       newUser.email = req.body.email;
//       newUser.password = hash;
//       // save the user
//       newUser
//         .save()
//         .then(user => {
//           return res.status(200).json({ message: 'User Created', user });
//         })
//         .catch(err => res.status(400).json({ message: 'User not saved', err }));
//     })
//     .catch(err => res.status(418).json({ message: 'We messed up', err }));
// });

// Login with Passport
router.post(
  '/login',
  //authenticate using local login from passport file
  passport.authenticate('local-login', {
    successRedirect: '/users/success',
    failureRedirect: '/users/fail',
    failureFlash: true
  })
);

//Login without passport
// router.post('/login', (req, res) => {
//   //validate input
//   if (req.body.email && req.body.password) {
//     //find user
//     User.findOne({ email: req.body.email })
//       .then(user => {
//         //compare the password
//         // bcrypt returns a true or false as you result
//         bcrypt
//           .compare(req.body.password, user.password)
//           .then(result => {
//             if (!result) {
//               return res.status(403).json({ message: 'Incorrect credentials' });
//             } else {
//               return res
//                 .status(200)
//                 .json({ message: 'You are now loggedin', user });
//             }
//           })
//           .catch(err =>
//             res.status(403).json({ message: 'Incorrect credentials' })
//           );
//       })
//       .catch(err => res.status(418).json({ message: 'We messed Up' }));
//   } else {
//     return res.status(403).json({ message: 'All Inputs Must Be Filled' });
//   }
// });

router.put('/update/:id', (req, res) => {
  // search for user in the database based on parameters
  User.findById(req.params.id)
    .then(user => {
      if (user) {
        //fill in values for inputs or leave value if no input
        user.name = req.body.name ? req.body.name : user.name;
        user.email = req.body.email ? req.body.email : user.email;
        //save user
        user
          .save()
          .then(user => {
            return res.status(200).json({ message: 'User Updates', user });
          })
          .catch(err =>
            res.status(400).json({ message: 'Cannot reuse credentials', err })
          );
      }
    })
    .catch(err => res.status(500).json({ message: 'User Not Found', err }));
});

//Logout User
router.get('/logout', (req, res) => {
  req.session.destroy();
  console.log('logout...', req.session);
  req.logout();
  return res.redirect('/');
});

module.exports = router;
