/**
 * Sync Query
 * @type {string}
 */
module.exports = `mutation CollaboratorJoin(
    $userId: ID!,
    $token: String!
    $ownerId: ID!,
    $folderId: ID!,
  ){
  join(
    userId: $userId,
    ownerId: $ownerId,
    folderId: $folderId,
    token: $token
   ){
    token,
    email
  }
}`;