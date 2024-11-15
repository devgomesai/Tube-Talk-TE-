/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1xayawrbmlsyubp")

  // remove
  collection.schema.removeField("tkcmvsln")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1xayawrbmlsyubp")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tkcmvsln",
    "name": "response",
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
})
