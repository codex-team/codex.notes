/**
 * Sync Query
 * @type {string}
 */
module.exports = `mutation User(
    $id: ID!,
    $name: String!,
    $photo: String!,
    $email: String!,
    $dtModify: Int!,
  ){
  user(
    id: $id,
    name: $name,
    photo: $photo,
    email: $email,
    dtModify: $dtModify,
   ){
    id,
    name,
    photo,
    email,
    dtReg,
    dtModify
  }
}`;
