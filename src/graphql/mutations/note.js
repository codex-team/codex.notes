/**
 * Sync Query
 * @type {string}
 */
module.exports = `mutation Note(
    $id: ID!,
    $title: String!, 
    $content: String!,
    $authorId: ID!,  
    $folderId: ID!,
    $dtModify: Int,
    $dtCreate: Int,
    $isRemoved: Boolean
  ){
  note(
    id: $id,
    title: $title,
    content: $content,
    folderId: $folderId, 
    authorId: $authorId,
    dtModify: $dtModify,
    dtCreate: $dtCreate,
    isRemoved: $isRemoved
   ){
    id,
    title,
    content,
    dtModify,
    dtCreate,
    isRemoved,   
    author{
	    id
	    name
    }
  }
}`;
