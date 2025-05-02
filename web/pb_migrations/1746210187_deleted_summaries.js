/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("iy1whj0bkeo9936");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "iy1whj0bkeo9936",
    "created": "2024-10-26 14:55:27.126Z",
    "updated": "2025-04-14 13:55:23.492Z",
    "name": "summaries",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "kb1hmcvq",
        "name": "platform_name",
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
        "id": "zberz0vi",
        "name": "video_id",
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
        "id": "lwtkq8wj",
        "name": "video_summary",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_VzbSS75` ON `summaries` (\n  `platform_name`,\n  `video_id`\n)"
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
})
