const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('./models/Users');

router.post('/register', (req, res) => {
  // validate the inputs
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(403).json({ message: 'All Inputs Must Be Filled' });
  }
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
          return res.status(200).json({ message: 'User Created', user });
        })
        .catch(err => res.status(400).json({ message: 'User not saved', err }));
    })
    .catch(err => res.status(418).json({ message: 'We messed up', err }));
});

module.exports = router;
