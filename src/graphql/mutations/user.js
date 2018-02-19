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
  ){
  user(
    id: $id,
    name: $name,
    photo: $photo,
    email: $email,
    dtReg: $dtReg,
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
