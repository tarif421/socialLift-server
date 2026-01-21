const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://socialLift-db:sTjp9E0VeKXbWjs5@cluster0.9aos02c.mongodb.net/?appName=Cluster0";

// mongoDB

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    // collection
    const db = client.db("socialLift");
    const upcomingEvents = db.collection("upcomingEvents");
    const joinEvents = db.collection("joinEvents");

    // create
    app.post("/socialLift", async (req, res) => {
      const newEvent = req.body;
      const result = await upcomingEvents.insertOne(newEvent);
      res.send(result);
    });

    // upcoming events
    app.get("/socialLift", async (req, res) => {
      const result = await upcomingEvents.find().toArray();
      console.log(result);

      res.send(result);
    });

    //  details
    app.get("/details/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await upcomingEvents.findOne(query);
      res.send(result);
    });
    // join event
    app.post("/join-event", async (req, res) => {
      const joinData = req.body;

      //
      const exists = await joinEvents.findOne({
        eventId: joinData.eventId,
        userEmail: joinData.userEmail,
      });
      if (exists) {
        return res.status(400).send({ message: "Already joined" });
      }

      const result = await joinEvents.insertOne(joinData);
      res.send(result);
    });

    // my joined event
    app.get("/my-event", async (req, res) => {
      const email = req.query.email;

      const result = await joinEvents.find({ userEmail: email }).toArray();
      res.send(result);
    });

    //  all created event by user
    app.get("/users-events", async (req, res) => {
      const email = req.query.email;
      const result = await upcomingEvents.find({ createdBy: email }).toArray();
      res.send(result);
    });
    //   delete ManageEvents
    app.delete("/delete-event/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;

      const result = await upcomingEvents.deleteOne({
        _id: new ObjectId(id),
        createdBy: email,
      });

      res.send(result);
    });
    // cancel event
    app.delete("/cancel-event/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;

      const result = await joinEvents.deleteOne({
        eventId: id,
        userEmail: email,
      });

      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running fine");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
