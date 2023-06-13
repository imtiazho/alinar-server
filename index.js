const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');

// Middleware
app.use(cors());
app.use(express.json());

// Custom function to verify jwt token
// const verifyJwt = (token) => {
//   let email;
//   jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//     if (err) {
//       res.status(401).send({ message: "Invalid Token" });
//     }
//     else if (decoded) {
//       email = decoded;
//     }
//   });

//   return email;
// }

const verifyJwt = (req, res, next) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) {
    res.status(401).send({ message: "Unauthorize Access" });
  }
  const [email, token] = authHeaders?.split(" ");
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      res.status(403).send({ message: "Forbidden" });
    }
    if (decoded) {
      req.decoded = decoded;
      next();
    }
  });
}

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

    const ordersCollection = client.db("alinar_fashion").collection("orders");
    const usersCollection = client.db("alinar_fashion").collection("users");

    // Access Token Generator
    app.post('/jwtTokenGenerator', (req, res) => {
      const user = req.body;
      if (user) {
        var token = jwt.sign({ email: user.emailToToken }, process.env.ACCESS_TOKEN, { expiresIn: '5h' });
        res.send({
          success: true,
          token
        });
      }
      else {
        res.send({
          success: false
        });
      }
    })

    // Get All Products
    app.get("/allProducts", async (req, res) => {
      const query = {};
      const allProduct = ProductsCollection.find(query).sort({ $natural: -1 });
      const cursor = await allProduct.toArray();
      res.send(cursor);
    });

    // Upload Product
    app.post("/allProducts", verifyJwt, async (req, res) => {
      const requestedProduct = req.body;
      const result = await ProductsCollection.insertOne(requestedProduct);
      res.send(result);
    })

    // Get All Orders
    app.get("/allOrders", verifyJwt, async (req, res) => {
      const query = {};
      const orders = ordersCollection.find(query);
      const cursor = await orders.toArray();
      res.send(cursor);
    });

    // Get specific user info(Testing)
    app.get('/user', async (req, res) => {
      const userMail = req.query.userEmail;
      const query = { email: userMail };
      const users = await usersCollection.findOne(query);
      res.send(users);
    })

    // Get Only Sharee
    app.get("/sharees/:handCodedId", async (req, res) => {
      const productId = req.params.handCodedId;
      const query = { handCodedId: productId };
      const allProduct = ProductsCollection.find(query).sort({ $natural: -1 });
      const cursor = await allProduct.toArray();
      res.send(cursor);
    });

    // Get Only Abaya
    app.get("/abayas/:handCodedId", async (req, res) => {
      const productId = req.params.handCodedId;
      const query = { handCodedId: productId };
      const allProduct = ProductsCollection.find(query).sort({ $natural: -1 });
      const cursor = await allProduct.toArray();
      res.send(cursor);
    });

    // Get Only Three Pis
    app.get("/threePises/:handCodedId", async (req, res) => {
      const productId = req.params.handCodedId;
      const query = { handCodedId: productId };
      const allProduct = ProductsCollection.find(query).sort({ $natural: -1 });
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
    app.get("/orders", verifyJwt, async (req, res) => {
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

    // Post order to Order Collection
    app.post("/order", async (req, res) => {
      const newProductInCart = req.body;
      const result = await ordersCollection.insertOne(newProductInCart);
      res.send(result);
    });

    // Delete order data by one and one
    app.delete('/order/:id', verifyJwt, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    })

    // Accept Order Method
    app.put("/order/:id", verifyJwt, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { orderStatus: true },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    })

    // Deliver Counter
    app.put('/productDeliverCounter/:productName', async (req, res) => {
      const productName = req.params.productName;
      const delivered = req.body;
      const filter = { name: productName };
      const options = { upsert: true };
      const updateDoc = {
        $set: delivered,
      };
      const result = await ProductsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    })

    // Get all user to admin panel
    app.get('/users', verifyJwt, async (req, res) => {
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

    // Delete exist product
    app.delete('/allproduct/:id', verifyJwt, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ProductsCollection.deleteOne(query);
      res.send(result);
    })

    // Delete user
    app.delete('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })

    // handle moderator
    app.put('/userTomoderator/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const options = { upsert: true }
      const updateDoc = {
        $set: { role: "moderator" },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    })

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
