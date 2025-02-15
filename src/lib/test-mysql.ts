// src/db.ts
import 'dotenv/config';
import knex, { Knex } from 'knex';

// const envPath = `./env-files/${process.env.NODE_ENV || 'development'}.env`;
// require('dotenv').config({ path: envPath });

interface ConnectionObject {
  host: string;
  user: string;
  port: number;
  password: string;
  database: string;
}

export const testMysql = async (connectionString: string): Promise<void> => {
  try {
    const db = knex({
      client: 'mysql2',
      connection: connectionString,
    });
    const rs = await db.raw('SELECT VERSION() as version, NOW() as now');
    console.log(`mysql ready; ver=${rs[0][0].version}, now=${rs[0][0].now}`);
    await db.destroy();
  } catch (err) {
    console.error(err);
  }
  // console.log('testMysql END');
};
// export const testMysql = (connectionString: string): void => {
//   const db = getConn(connectionString);
//   db.raw('SELECT VERSION() as version, NOW() as now ')
//     .then((rs) => {
//       console.log('mysql ready; ver=', rs[0][0].version, 'now', rs[0][0].now);
//     })
//     .catch((err) => {
//       console.error(err);
//       process.exit(1);
//     });
// };

export const getConn = (connObj: string | null = null): Knex => {
  const connection: ConnectionObject | string = connObj || {
    host: process.env.DATABASE_HOST ?? '127.0.0.1',
    user: process.env.DATABASE_USER ?? 'root',
    port: Number(process.env.DATABASE_PORT) ?? 3306,
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? '',
  };
  return knex({
    client: 'mysql2',
    connection,
  });
};
