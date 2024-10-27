/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "iy1whj0bkeo9936",
    "created": "2024-10-26 14:55:27.126Z",
    "updated": "2024-10-26 14:55:27.126Z",
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
        "id": "jhfbbjf6",
        "name": "video_summary",
        "type": "editor",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "convertUrls": false
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_VzbSS75` ON `summaries` (\n  `platform_name`,\n  `video_id`\n)"
    ],
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
  const collection = dao.findCollectionByNameOrId("iy1whj0bkeo9936");

  return dao.deleteCollection(collection);
})
