var express = require('express');
var router = express.Router();

//Home page for Logout
// res.send sends a string
router.get('/', (req, res) => {
  return res.send('Welcome You must Log in to continue');
});

module.exports = router;
