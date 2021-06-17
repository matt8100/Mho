// For initializing a database file
const Database = require('better-sqlite3');

const db = new Database('database.db');

{ // info table
  const infoTable = db.prepare(
    `CREATE TABLE IF NOT EXISTS info (
      guild TEXT NOT NULL,
      key TEXT(32) NOT NULL,
      value TEXT(1000) NOT NULL
    );`,
  );

  const serverLimitTrigger = db.prepare(
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
  );

  const perServerUniqueKeyTrigger = db.prepare(
    `CREATE TRIGGER IF NOT EXISTS per_server_unique_key
      BEFORE INSERT ON info
    BEGIN
      SELECT
        CASE
          WHEN ((SELECT COUNT(key) FROM info WHERE guild = NEW.guild AND key = NEW.key) > 0)
          THEN
            RAISE (ABORT, 'Entry already exists!')
        END;
      END;`,
  );

  db.transaction(() => {
    try {
      infoTable.run();
      serverLimitTrigger.run();
      perServerUniqueKeyTrigger.run();
    } catch (err) {
      throw (err.message);
    }
  });
}

module.exports = db;
