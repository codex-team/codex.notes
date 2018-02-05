/**
 * Sync Query
 * @type {string}
 */
module.exports = `mutation InviteCollaborator(
    $email: String!,
    $folderId: ID!
    $ownerId: ID!
  ){
  invite(
    email: $email,
    ownerId: $ownerId,
    folderId: $folderId,
   ){
    token,
    email,
    folder {
        id,
        title,
        owner {
          id
        }
    }
  }
}`;