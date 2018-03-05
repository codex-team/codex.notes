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
    $needSendEmail: Boolean = false
  ){
  invite(
    id: $id,
    email: $email,
    ownerId: $ownerId,
    folderId: $folderId,
    dtInvite: $dtInvite,
    needSendEmail: $needSendEmail
   ){
    token,
    email
  }
}`;
