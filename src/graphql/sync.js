/**
 * Sync Query
 * @type {string}
 */
module.exports = `query {
  notes(userId: 1, folderId: 1){
    title
  },
  folders(userId: 1){
    id,
    title,
    owner {
      name
    }
  }
}`;