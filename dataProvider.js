const { Pool } = require('pg')
const auth = require("./auth.json");
const jsonMan = require("./jsonMan.js");
const test = require("./testingMethods.js");

const pool = new Pool({
  host: 'localhost',
  database: auth.db,
  user: auth.dbuser,
  password: auth.dbpass,
  port:5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})


module.exports = {

  test: async function(){
    let client = await pool.connect();
    let res = await client.query('SELECT NOW()');
    client.release();
    console.log(res);
  },

  add: async function(table, information){
    try{
      let query = `SELECT * FROM information_schema.columns WHERE TABLE_NAME = '${table}';`;

      let client = await pool.connect();
      let res = await client.query(query);

      let values = "";

      for(let row of information){
        values = jsonMan.valueConverter(row);
        query = `INSERT INTO ${table} VALUES(${values})`;
        await client.query(query);
      }

      client.release();
    }catch(e){
      test.errorLog(e);
      test.errorLog(query);
    }
  },

  retrieve: async function(table, pk, key){
    try{
      let query = `SELECT * FROM ${table} WHERE ${pk} = '${key}';`;
      let client = await pool.connect();
      let res = await client.query(query);
      client.release();

      return res;
    }catch(e){
          test.errorLog(e);
          test.errorLog(query);
        }
  },

  custom: async function(query){
    try{
      let client = await pool.connect();
      let res = await client.query(query);

      client.release();

      return res;
    }catch(e){
      test.errorLog(e);
      test.errorLog(query);
    }
  }
}
