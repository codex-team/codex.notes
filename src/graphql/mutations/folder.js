/**
 * Sync Query
 * @type {string}
 */
module.exports = `mutation Folder(
    $id: ID!,
    $title: String!,
    $ownerId: ID!,
    $dtModify: Int,
    $dtCreate: Int,
    $isRoot: Boolean = false,
  ){
  folder(
    id: $id,
    title: $title,
    ownerId: $ownerId,
    dtModify: $dtModify,
    dtCreate: $dtCreate,
    isRoot: $isRoot
   ){
    id,
    title,
    dtModify,
    owner{
      name,
      id
    }
  }
}`;