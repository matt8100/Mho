// For initializing a database file
const Database = require('better-sqlite3');

const db = new Database('database.db');

// info table
db.prepare(
  `CREATE TABLE IF NOT EXISTS info (
      guild TEXT NOT NULL,
      key TEXT(32) NOT NULL,
      value TEXT(1000) NOT NULL
    );`,
).run();

// Trigger for limiting number of info key-value pairs saved per server
db.prepare('DROP TRIGGER IF EXISTS server_limit;').run();
db.prepare(
  `CREATE TRIGGER IF NOT EXISTS server_limit
      BEFORE INSERT ON info
    BEGIN
      SELECT
        CASE
          WHEN ((SELECT COUNT(guild) FROM info WHERE guild = NEW.guild) > 101)
          THEN
            RAISE (ABORT, 'Too many entries!')
        END;
    END;`,
).run();

// Trigger for replicating UNIQUE constraint, but per-server insteadd of per-column
db.prepare('DROP TRIGGER IF EXISTS per_server_unique_key;').run();
db.prepare(
  `CREATE TRIGGER IF NOT EXISTS per_server_unique_key
      BEFORE INSERT ON info
    BEGIN
      SELECT
        CASE
          WHEN ((SELECT COUNT(key) FROM info WHERE guild = NEW.guild AND key = NEW.key COLLATE NOCASE) > 0)
          THEN
            RAISE (ABORT, 'Entry already exists!')
        END;
      END;`,
).run();

module.exports = db;
