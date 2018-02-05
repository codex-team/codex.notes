/**
 * Sync Query
 * @type {string}
 */
module.exports = `query Sync($userId: ID!) {
  user(id: $userId){
    name,
    folders {
      id,
      title,
      owner {
        name,
        id
      },
      isRoot,
      dtModify,
      dtCreate,
      isRemoved,
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
