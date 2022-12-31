const { MongoClient } = require('mongodb');

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = "mongodb+srv://MalinduRK:e0r2SWjof7Yh8e98@rpg-cluster.nb4qi3z.mongodb.net/Node_RPG?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Add data
        //await client.db('RPG-Database').collection('Players').insertOne({
        //    username: 'user',
        //    password: 'pass'
        //});

    } catch (e) {
        console.error(e);

    } finally {
        await client.close();
    }
}

main().catch(console.error);