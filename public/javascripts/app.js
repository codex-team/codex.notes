module.exports = function () {

    'use strict';

    let editor = codex.editor;

    // load CSS
    require('../stylesheets/base.css');

    function saveArticle(id) {

        editor.saver.saveBlocks();
        window.setTimeout(sendRequest.bind(null, id), 1000);

    }

    function sendRequest(id) {

        let form = new FormData();

        form.append('json', JSON.stringify( { items: editor.state.jsonOutput } ) );

        if (id) {

            form.append('id', id);

        }

        editor.core.ajax({
            url: '/save',
            data: form,
            type: 'POST',
            success: function () { },
            error: function () { }
        });

    }

    return {
        saveArticle
    };

}();