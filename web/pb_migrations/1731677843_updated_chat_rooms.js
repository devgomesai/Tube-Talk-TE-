/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hd359v6cctt4mqz")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "oqikfeh9",
    "name": "isPinned",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hd359v6cctt4mqz")

  // remove
  collection.schema.removeField("oqikfeh9")

  return dao.saveCollection(collection)
})
