/**
 * Sync Query
 * @type {string}
 */
module.exports = `mutation Folder(
    $id: ID!,
    $title: String!,
    $ownerId: ID!,
    $dtModify: Int,
    $dtCreate: Int
  ){
  folder(
    id: $id,
    title: $title,
    ownerId: $ownerId,
    dtModify: $dtModify,
    dtCreate: $dtCreate
   ){
    id,
    title,
    owner{
      name,
      id
    }
  }
}`;