/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hd359v6cctt4mqz")

  collection.indexes = [
    "CREATE INDEX `idx_NTBb3Gz` ON `chat_rooms` (\n  `platform`,\n  `video_id`,\n  `user`\n)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hd359v6cctt4mqz")

  collection.indexes = []

  return dao.saveCollection(collection)
})
