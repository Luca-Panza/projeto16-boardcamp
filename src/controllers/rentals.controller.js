import { db } from "../database/database.connection.js";
import dayjs from "dayjs";

export async function getRentals(_, res) {
  try {
    const rentalsQuery = await db.query(`
        SELECT 
            r.id,
            r."customerId",
            r."gameId",
            r."rentDate",
            r."daysRented",
            r."returnDate",
            r."originalPrice",
            r."delayFee",
            c.id AS "customer.id",
            c.name AS "customer.name",
            g.id AS "game.id",
            g.name AS "game.name"
        FROM 
            rentals r
        JOIN
            customers c ON r."customerId" = c.id
        JOIN
            games g ON r."gameId" = g.id;
    `);

    const formattedRentals = rentalsQuery.rows.map((rental) => ({
      id: rental.id,
      customerId: rental.customerId,
      gameId: rental.gameId,
      rentDate: rental.rentDate,
      daysRented: rental.daysRented,
      returnDate: rental.returnDate,
      originalPrice: rental.originalPrice,
      delayFee: rental.delayFee,
      customer: {
        id: rental["customer.id"],
        name: rental["customer.name"],
      },
      game: {
        id: rental["game.id"],
        name: rental["game.name"],
      },
    }));

    res.send(formattedRentals);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function postRental(req, res) {
  const { customerId, gameId, daysRented } = req.body;

  try {
    if (!daysRented || daysRented <= 0) return res.sendStatus(400);

    const customerQuery = await db.query(`SELECT * FROM customers WHERE id = $1;`, [customerId]);
    if (customerQuery.rows.length === 0) return res.sendStatus(400);

    const gameQuery = await db.query(`SELECT * FROM games WHERE id = $1;`, [gameId]);
    if (gameQuery.rows.length === 0) return res.sendStatus(400);

    const stockTotal = gameQuery.rows[0].stockTotal;
    const pricePerDay = gameQuery.rows[0].pricePerDay;
    const originalPrice = daysRented * pricePerDay;

    const rentalsQuery = await db.query(`SELECT * FROM rentals WHERE "gameId" = $1;`, [gameId]);
    if (rentalsQuery.rows.length >= stockTotal) return res.sendStatus(400);

    req.body.returnDate = null;
    req.body.delayFee = null;
    req.body.rentDate = dayjs().format("YYYY-MM-DD");
    req.body.originalPrice = originalPrice;

    await db.query(
      `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [customerId, gameId, req.body.rentDate, daysRented, req.body.returnDate, req.body.originalPrice, req.body.delayFee]
    );

    res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function closeRental(req, res) {
  const { id } = req.params;

  try {
    const rentalQuery = await db.query(`SELECT r.*, g."pricePerDay" FROM rentals r JOIN games g ON r."gameId" = g.id WHERE r.id = $1;`, [
      id,
    ]);

    if (rentalQuery.rows.length === 0) return res.sendStatus(404);

    const rental = rentalQuery.rows[0];

    if (rental.returnDate !== null) return res.sendStatus(400);

    const dateReturn = new Date();
    const dateSend = new Date(rental.rentDate);

    const differenceDays = Math.abs(dateReturn - dateSend);
    const diffInDays = Math.ceil(differenceDays / (1000 * 60 * 60 * 24));

    const delayFee = Math.max(diffInDays - rental.daysRented - 1, 0) * rental.pricePerDay;

    await db.query(`UPDATE rentals SET "returnDate" = Now(), "delayFee" = $1 WHERE id = $2;`, [delayFee, id]);

    await db.query(`UPDATE games SET "stockTotal" = "stockTotal" + 1 WHERE id = $1;`, [rental.gameId]);

    res.sendStatus(200);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function deleteRental(req, res) {
  const { id } = req.params;

  try {
    const rentalQuery = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id]);

    if (rentalQuery.rows.length === 0) return res.sendStatus(404);

    if (rentalQuery.rows[0].returnDate === null) return res.sendStatus(400);

    await db.query(`DELETE FROM rentals WHERE id = $1;`, [id]);

    res.sendStatus(200);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
