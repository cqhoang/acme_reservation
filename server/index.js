const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    next(error);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    next(error);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    next(error);
  }
});

app.delete(
  "/api/customers/:customer_id/reservation/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);

app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        customer_id: req.params.customer_id,
        restaurant_id: req.body.restaurant_id,
        reservation_date: req.body.reservation_date,
        party_count: req.body.party_count,
      })
    );
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");

  await createTables();
  console.log("tables created");

  const [moe, lucy, larry, sushi, ramen, burgers] = await Promise.all([
    createCustomer({ name: "moe" }),
    createCustomer({ name: "lucy" }),
    createCustomer({ name: "larry" }),
    createRestaurant({ name: "sushi" }),
    createRestaurant({ name: "ramen" }),
    createRestaurant({ name: "burgers" }),
  ]);

  console.log("data seeded");

  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      customer_id: moe.id,
      restaurant_id: sushi.id,
      reservation_date: "05/05/2024",
      party_count: 5,
    }),
    createReservation({
      customer_id: moe.id,
      restaurant_id: sushi.id,
      reservation_date: "05/15/2024",
      party_count: 5,
    }),
  ]);
  console.log("reservations created");
  console.log(await fetchReservations());

  await destroyReservation({
    id: reservation.id,
    customer_id: reservation.customer_id,
  });

  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

init();
