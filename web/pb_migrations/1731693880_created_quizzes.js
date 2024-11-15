/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "do6xsstmupnptuo",
    "created": "2024-11-15 18:04:40.696Z",
    "updated": "2024-11-15 18:04:40.696Z",
    "name": "quizzes",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "t19yffct",
        "name": "platform",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "6i3nprao",
        "name": "video",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "funcvew7",
        "name": "quiz",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("do6xsstmupnptuo");

  return dao.deleteCollection(collection);
})
