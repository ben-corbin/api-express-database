const express = require('express');
const db = require('../utils/database');
const petsRouter = express.Router();

petsRouter.get('/', (req, res) => {

    let selectAllPetsQuery = "SELECT * FROM pets"
    const selectValues = [];
    const queries = []
    if (req.query.type) {
        queries.push({col:'type', value: req.query.type})
    }
    if (req.query.microchip) {
        queries.push({col:'microchip', value: req.query.microchip})
    }
    if (queries.length > 0) {
        let whereClauses = []

        queries.forEach( (query, index) => {
            whereClauses.push(`${query.col} =$${index + 1}`)         
            selectValues.push(query.value)
        })
        selectAllPetsQuery += ' WHERE ' + whereClauses.join(' AND ')
    }

	db.query(selectAllPetsQuery, selectValues)
    .then((dbResult) => {
		res.json({ pets: dbResult.rows });
	})
    .catch((error) => {
        res.status(500)
        res.json({error: "unexpected error"})
    });
});

petsRouter.get('/:id', (req, res) => {
	db.query('SELECT * FROM pets WHERE id = $1', [req.params.id])
		.then((dbResult) => {
			if (dbResult.rowCount === 0) {
				res.status(404);
				res.json({ error: 'pet not found!' });
			} else
			res.json({ pet: dbResult.rows[0] });
		})
		.catch((err) => {
			res.status(500);
			res.json({ error: 'unexpected error!' });
		});
});

petsRouter.post('/', (req, res) => {
	const insertPetQuery = `
    INSERT INTO pets(
    name,
    age,
    type,
    breed,
    microchip)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
	const insertPetQueryValues = [
		req.body.name,
		req.body.age,
		req.body.type,
		req.body.breed,
		req.body.microchip,
	];
	db.query(insertPetQuery, insertPetQueryValues)
		.then((dbResult) => {
			res.json({ pet: dbResult.rows[0] });
		})
		.catch((err) => {
			res.status(500);
			res.json({ error: 'unexpected error!' });
		});
});

petsRouter.delete('/:id', (req, res) => {
	db.query('DELETE FROM pets WHERE id = $1 RETURNING *', [req.params.id])
		.then((dbResult) => {
			if (dbResult.rowCount === 0) {
				res.status(404);
				res.json({ error: 'pet not found' });
			} else
				res.json({ pet: dbResult.rows[0] });
		})
		.catch((err) => {
			res.status(500);
			res.json({ error: 'unexpected error!' });
			console.log(err);
		});
});

petsRouter.put('/:id', (req, res) => {
	const updatePetsQuery = `
	UPDATE pets
	SET
	name = $1,
	age = $2,
	type = $3,
	breed = $4,
	microchip = $5
	WHERE id = $6
	RETURNING *`

	const updatePetsQueryValues = [
		req.body.name,
		req.body.age,
		req.body.type,
		req.body.breed,
		req.body.microchip,
		req.params.id
	]

	db.query(updatePetsQuery, updatePetsQueryValues)
	.then((dbResult) => {
		if (dbResult.rowCount === 0) {
			res.status(404)
			res.json({error: 'pet not found'})
		} else
		res.json({pet: dbResult.rows[0]})
	})
	.catch((err) => {
		res.status(500)
		res.json({error: 'unexpected error'})
	})
})

module.exports = petsRouter;