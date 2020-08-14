const client = require('../lib/client');
// import our seed data:
const regattas = require('./regattas.js');
const raceTypes = require('./raceTypes.js');
// const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    // const users = await Promise.all(
    //   usersData.map(user => {
    //     return client.query(`
    //                   INSERT INTO users (email, hash)
    //                   VALUES ($1, $2)
    //                   RETURNING *;
    //               `,
    //     [user.email, user.hash]);
    //   })
    // );
      
    // const user = [users[0].rows[0];]
    
    await Promise.all(
      raceTypes.map(type => {
        return client.query(`
                      INSERT INTO types (type)
                      VALUES ($1)
                      `,
        [type.type]);
      })
    );

    await Promise.all(
      regattas.map(regatta => {
        return client.query(`
                    INSERT INTO regattas (name, type_id, city, length_km, recommend, id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [regatta.name, regatta.type_id, regatta.city, regatta.length_km, regatta.recommend, regatta.id]);
      })
    );

    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
