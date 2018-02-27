/**
 * Sync Query
 * @type {string}
 */
module.exports = `mutation InviteCollaborator(
    $id: ID!,
    $email: String!,
    $folderId: ID!,
    $ownerId: ID!,
    $dtInvite: Int,
    $isNew: Boolean = false
  ){
  invite(
    id: $id,
    email: $email,
    ownerId: $ownerId,
    folderId: $folderId,
    dtInvite: $dtInvite,
    isNew: $isNew
   ){
    token,
    email
  }
}`;
