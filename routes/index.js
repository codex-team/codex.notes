let express = require('express');
let router = express.Router();

let fs = require('fs');

let uploadsDir = '../public/notes';

/* GET home page. */
router.get('/:id?', function (req, res, next) {
  if (!fs.existsSync(__dirname + '/' + uploadsDir)) {
    fs.mkdirSync(__dirname + '/' + uploadsDir);
  }

  let id = req.params.id;
  let articles = fs.readdirSync(__dirname + '/' + uploadsDir);
  let data = JSON.stringify({items: []});

  articles = articles.map(function (article) {
    let content = fs.readFileSync(__dirname + '/' + uploadsDir + '/' + article);
    let json = JSON.parse(content);
    let firstBlock = !!json.items.length ? json.items[0].data.text : null;

    if (id && article.split('.')[0] === id) {
      data = content;
    }

    return {title: firstBlock, url: article.split('.')[0]};
  });

  res.render('editor', { title: 'Codex Editor', data: data, titles: articles, id: id  });
});

module.exports = router;
