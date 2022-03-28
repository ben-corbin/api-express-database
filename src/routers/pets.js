const express = require('express');

const petsRouter = express.Router();

const db = require('../utils/database');

petsRouter.get('/', (req, res) => {

    const selectAllPetsQuery = 'SELECT * FROM pets'

	db.query(selectAllPetsQuery)
    .then((dbResult) => {
	    res.json({ pets: dbResult.rows });
	});
});

petsRouter.get('/:id', (req, res) => {

    const selectSinglePetQuery = 'SELECT * FROM pets WHERE id = $1'

    const queryValues = [req.params.id]

	db.query(selectSinglePetQuery, queryValues)
		.then((dbResult) => {
			if (dbResult.rowCount === 0) {
				res.status(404);
				res.json({ error: 'Pet not found' });
			}
			res.json({ pet: dbResult.rows[0] });
		})
		.catch(error => {
			res.status(500);
			res.json({ error: 'unexpected error' });
		});
});

petsRouter.post('/', (req, res) => {

	const postPetQuery = `
    INSERT INTO pets(
        name,
        age,
        type,
        breed,
        microchip)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const postPetQueryValues = [
    req.body.name,
    req.body.age,
    req.body.type,
    req.body.breed,
    req.body.microchip
  ];
  db.query(postPetQuery, postPetQueryValues)
    .then(dbResult => {
      res.json({pet: dbResult.rows[0]})
    })
    .catch(error => {
      res.status(500)
      res.json({error: 'unexpected error'})
    })
});

module.exports = petsRouter;