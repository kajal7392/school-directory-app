import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      port: Number(process.env.MYSQL_PORT),
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function query<T = any>({
  query,
  values = [],
}: {
  query: string;
  values?: any[];
}): Promise<T> {
  const pool = getPool();
  const [results] = await pool.execute<mysql.RowDataPacket[] | mysql.OkPacket>(query, values);
  return results as unknown as T;
}
  