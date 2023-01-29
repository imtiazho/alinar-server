const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

// Mongo Db Important Links
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@alinar.azrvfe1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const ProductsCollection = client
      .db("alinar_fashion")
      .collection("products");

    const bestSellingProductsCollection = client
      .db("alinar_fashion")
      .collection("bestSellingProductCollection");

    const ordersCollection = client.db("alinar_fashion").collection("orders");
    const usersCollection = client.db("alinar_fashion").collection("users");

    // Get All Products
    app.get("/allProducts", async (req, res) => {
      const query = {};
      const allProduct = ProductsCollection.find(query);
      const cursor = await allProduct.toArray();
      res.send(cursor);
    });

    // Upload Product
    app.post("/allProducts", async (req, res) => {
      const requestedProduct = req.body;
      const result = await ProductsCollection.insertOne(requestedProduct);
      res.send(result);
    })

    // Get All Orders
    app.get("/allOrders", async (req, res) => {
      const query = {};
      const orders = ordersCollection.find(query);
      const cursor = await orders.toArray();
      res.send(cursor);
    });

    // Get specific user info(Testing)
    app.get('/user', async (req, res) => {
      const userMail = req.query.userEmail;
      const query = { userEmail: userMail };
      const users = await usersCollection.findOne(query);
      res.send(users);
    })

    // Get Only Sharee
    app.get("/sharees/:handCodedId", async (req, res) => {
      const productId = req.params.handCodedId;
      const query = { handCodedId: productId };
      const allProduct = ProductsCollection.find(query);
      const cursor = await allProduct.toArray();
      res.send(cursor);
    });

    // Get Only Abaya
    app.get("/abayas/:handCodedId", async (req, res) => {
      const productId = req.params.handCodedId;
      const query = { handCodedId: productId };
      const allProduct = ProductsCollection.find(query);
      const cursor = await allProduct.toArray();
      res.send(cursor);
    });

    // Get Only Three Pis
    app.get("/threePises/:handCodedId", async (req, res) => {
      const productId = req.params.handCodedId;
      const query = { handCodedId: productId };
      const allProduct = ProductsCollection.find(query);
      const cursor = await allProduct.toArray();
      res.send(cursor);
    });

    // Get One Sharee
    app.get("/sharee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const specificSharee = await ProductsCollection.findOne(query);
      res.send(specificSharee);
    });

    // Get Orders for targetd user
    app.get("/orders", async (req, res) => {
      const userEmail = req.query.email;
      const query = { clientEmail: userEmail };
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Here start paricular data fetching
    // Get One Three Pis
    app.get("/threePis/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const specificThreePis = await ProductsCollection.findOne(query);
      res.send(specificThreePis);
    });
    // Get One Abaya
    app.get("/abaya/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const specificAbaya = await ProductsCollection.findOne(query);
      res.send(specificAbaya);
    });

    // Get Best selling all product
    app.get("/bestSellingProducts", async (req, res) => {
      const query = {};
      const allProduct = bestSellingProductsCollection.find(query);
      const cursor = await allProduct.toArray();
      res.send(cursor);
    });

    // Get One Product of Shop
    app.get("/bestSellingProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const specificBestSellingProduct =
        await bestSellingProductsCollection.findOne(query);
      res.send(specificBestSellingProduct);
    });

    // Post order to Order Collection
    app.post("/order", async (req, res) => {
      const newProductInCart = req.body;
      const result = await ordersCollection.insertOne(newProductInCart);
      res.send(result);
    });

    // Delete order data by one and one
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    })

    // Get all user to admin panel
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      res.send(result)
    })

    // Store user
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // handle moderator
    // app.put('/user/admin/:email', async (req, res) => {
    //   const email = req.params.email;
    //   const requester = await usersCollection.findOne({ userEmail: email });
    //   if(requester?.role === 'admin'){

    //   }
    // })

    // Check Admin
    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ userEmail: email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin });
    })

  } finally {
    // await client.close()
  }
}

// Call the main function
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World from Alinar Server!");
});

app.listen(port, () => {
  console.log(`ALinar server is running on port ${port}`);
});
