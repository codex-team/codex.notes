let express = require('express');
let router = express.Router();

let Crypto = require('crypto');
let fs = require('fs');

router.post('/upload', function (req, res) {

  if (!req.files || !req.files.file) {
    return res.status(400).json({
      'success': 0,
      'message': 'No files were uploaded'
    });
  }

  let uploadedFile = req.files.file;

  let fileExt = uploadedFile.name.split('.').pop();

  let newName = Crypto.createHash('md5').update(uploadedFile + new Date(), 'utf8').digest('hex') + '.' + fileExt;

  let uploadsDir = ROOT_DIR + '/public/uploads';

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  uploadedFile.mv(uploadsDir + '/' + newName, (err) => {

    if (err) return res.status(500).json({
      'success': 0,
      'message': 'Server error'
    });

    return res.status(200).json({
      'success': 1,
      'name': newName,
      'message': 'File was uploaded'
    });
  });

})

module.exports = router;