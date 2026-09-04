/* eslint-disable-next-line @typescript-eslint/no-require-imports */
const { Client } = require('pg');
/* eslint-disable-next-line @typescript-eslint/no-require-imports */
const fs = require('fs');

async function runMigration() {
  const connectionString = 'postgresql://postgres:Suyash%4011052006@db.egxppszpwmkofavkzuvg.supabase.co:5432/postgres';
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to DB');

    const sql = fs.readFileSync('supabase/migrations/0010_student_approval_notifications.sql', 'utf8');
    
    await client.query(sql);
    console.log('Migration executed successfully!');
  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await client.end();
  }
}

runMigration();
