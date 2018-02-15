/**
 * Sync Query
 * @type {string}
 */
module.exports = `mutation User(
    $id: ID!,
    $name: String!,
    $photo: String!,
    $email: String!,
    $dt_sync: int!,
    $dt_reg: int!,
    $dt_modify: int!,
    $google_id: String!
  ){
  user(
    id: $id,
    name: $name,
    photo: $photo,
    email: $email,
    dt_sync: $dt_sync,
    dt_reg: $dt_reg,
    dt_modify: $dt_modify,
    google_id: $google_id
   ){
    id,
    name,
    photo,
    email,
    dt_sync,
    dt_reg,
    dt_modify,
    google_id
  }
}`;
