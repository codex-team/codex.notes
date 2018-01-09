/**
 * Sync Query
 * @type {string}
 */
module.exports = `query Sync {
  user(id: "taly1"){
    name,
    folders {
      id,
      title,
      owner{
        name,
        id
      },
      notes {
        id,
        title,
        dtCreate,
        dtModify,
        content,
        author {
          id,
          name,
          email
        },
        isRemoved
      }
    }
  }
}`;