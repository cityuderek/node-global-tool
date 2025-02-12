import pg from 'pg';

export const testPg = (connectionString: string) => {
  console.log(`test-pg, connectionString=${connectionString}`);

  // testPostgres.js
  const { Client } = pg;

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  client
    .connect()
    .then(() => {
      console.log('Connected to PostgreSQL successfully!');
      return client.query('SELECT NOW(), version()');
      // return client.query('SELECT NOW()');
    })
    .then((result: any) => {
      console.log('Current time:', result.rows[0]);
    })
    .catch((err: any) => {
      console.error('Connection error:', err.stack);
    })
    .finally(() => {
      client.end();
    });
};
