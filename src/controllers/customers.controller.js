import { db } from "../database/database.connection.js";

export async function getCustomers(_, res) {
  try {
    const customersDataQuery = await db.query("SELECT *, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers;");
    res.send(customersDataQuery.rows);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function getCustomerById(req, res) {
  const { id } = req.params;

  try {
    const customerByIdQuery = await db.query(
      `
      SELECT *, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers WHERE id = $1;
      `,
      [id]
    );

    if (customerByIdQuery.rowCount === 0) return res.sendStatus(404);

    return res.send(customerByIdQuery.rows[0]);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function postCustomer(req, res) {
  const { name, phone, cpf, birthday } = req.body;

  try {
    const cpfQuery = await db.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf]);

    if (cpfQuery.rows.length > 0) return res.sendStatus(409);

    await db.query(
      `
    INSERT INTO customers ("name", "phone", "cpf", "birthday")
    VALUES($1, $2, $3, $4)
    `,
      [name, phone, cpf, birthday]
    );

    res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function updateCustomer(req, res) {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;

  try {
    const idQuery = await db.query(`SELECT * FROM customers WHERE id = $1;`, [id]);

    if (idQuery.rows.length === 0) return res.sendStatus(404);

    const cpfQuery = await db.query(`SELECT * FROM customers WHERE cpf = $1 AND id <> $2;`, [cpf, id]);

    if (cpfQuery.rows.length > 0) return res.sendStatus(409);

    await db.query(`UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5`, [name, phone, cpf, birthday, id]);
    res.sendStatus(200);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
