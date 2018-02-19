/**
 * Sync Query
 * @type {string}
 */
module.exports = `mutation User(
    $id: ID!,
    $name: String!,
    $photo: String!,
    $email: String!,
    $dtReg: int!,
    $dtModify: int!,
    $googleId: String!
  ){
  user(
    id: $id,
    name: $name,
    photo: $photo,
    email: $email,
    dtReg: $dtReg,
    dtModify: $dtModify,
    googleId: $googleId
   ){
    id,
    name,
    photo,
    email,
    dtReg,
    dtModify,
    googleId
  }
}`;
