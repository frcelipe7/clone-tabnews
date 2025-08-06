import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const responseVerson = await database.query("SHOW server_version;");
  const version = responseVerson.rows[0].server_version;

  const responseMaxConnections = await database.query("SHOW max_connections;");
  const maxConnections = responseMaxConnections.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const responseOpenedConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const openedConnections = responseOpenedConnections.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version,
        max_connections: parseInt(maxConnections),
        opened_connections: openedConnections,
      },
    },
  });
}

export default status;
