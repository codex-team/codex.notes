var app = function () {

  var saveArticle = function (id) {

    codex.editor.saver.saveBlocks();

    setTimeout(sendRequest.bind(null, id), 1000);

  }

  var sendRequest = function (id) {

    var form = new FormData();

    form.append('json', JSON.stringify({items: codex.editor.state.jsonOutput}));
    if (id) form.append('id', id);

    codex.editor.core.ajax({
      url: '/save',
      data: form,
      type: 'POST',
      success: console.log,
      error: console.log
    });

  }

  return  {
    saveArticle: saveArticle
  }

}();