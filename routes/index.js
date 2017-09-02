let express = require('express');
let router = express.Router();

let fs = require('fs');

let uploadsDir = '../public/notes';

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('editor', { title: 'Codex Editor' });
});

module.exports = router;
