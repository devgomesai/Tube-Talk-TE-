/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1xayawrbmlsyubp")

  collection.indexes = [
    "CREATE INDEX `idx_dZ2XQK9` ON `chats` (`chat_room`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1xayawrbmlsyubp")

  collection.indexes = []

  return dao.saveCollection(collection)
})
