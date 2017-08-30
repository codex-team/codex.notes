let express = require('express');
let router = express.Router();

let Crypto = require('crypto');
let fs = require('fs');

let save = function (req, res) {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, X-Requested-With');

  let articleJSON = req.body.json;
  let id = req.body.id;

  console.log(id);

  /**
   * TODO: data validation
   */

  if (articleJSON instanceof Object) {
    articleJSON = JSON.stringify(articleJSON);
  }

  if (!isValidJson(articleJSON)) {
    return res.status(400).json({
      'success': 0,
      'message': 'Json is invalid'
    })
  }

  let tmstp = +new Date();

  let newName;
  if (!id) {
    newName = Crypto.createHash('sha256').update(tmstp.toString(), 'utf8').digest('hex') + '.json';
  } else {
    newName = id + '.json';
  }

  let uploadsDir = ROOT_DIR + '/public/articles';

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  fs.writeFileSync(uploadsDir + '/' + newName, articleJSON);

  return res.status(200).json({
    'success': 1,
    'message': 'Note was saved',
    'name': newName
  });
};

let isValidJson = function (json) {
  try {
    JSON.parse(json);
  } catch (e) {
    return false;
  }

  return true;
}

router.options('/save', save)
router.post('/save', save)


module.exports = router;