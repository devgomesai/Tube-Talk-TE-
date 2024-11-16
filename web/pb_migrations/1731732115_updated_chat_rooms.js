/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hd359v6cctt4mqz")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kiaone8a",
    "name": "title",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hd359v6cctt4mqz")

  // remove
  collection.schema.removeField("kiaone8a")

  return dao.saveCollection(collection)
})
