// src/lib/db.ts
import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    initializePool();
  }
  return pool!;
}


function initializePool(): void {
  // DATABASE_URL
  if (process.env.DATABASE_URL) {
    const connectionUrl = process.env.DATABASE_URL;
    const urlPattern = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = connectionUrl.match(urlPattern);
    
    if (match) {
      const [, user, password, host, port, database] = match;
      pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port: parseInt(port),
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      console.log('Using DATABASE_URL connection');
      return;
    } else {
      console.warn('Invalid DATABASE_URL format, falling back to individual variables');
    }
  }
  
  // Individual environment variables 
  if (process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD && process.env.MYSQL_DATABASE) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      port: Number(process.env.MYSQL_PORT) || 3306,
      ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('Using individual environment variables connection');
    return;
  }
  
  throw new Error('Database connection configuration not found');
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


export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Get connection for transactions
export async function getConnection(): Promise<mysql.PoolConnection> {
  const pool = getPool();
  return await pool.getConnection();
}


export { pool };