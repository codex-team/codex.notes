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
    $isRemoved: Boolean = false
  ){
  folder(
    id: $id,
    title: $title,
    ownerId: $ownerId,
    dtModify: $dtModify,
    dtCreate: $dtCreate,
    isRoot: $isRoot,
    isRemoved: $isRemoved
   ){
    id,
    title,
    dtModify,
    dtCreate,
    isRemoved,
    isRoot,
    owner{
      name,
      id
    }
  }
}`;
