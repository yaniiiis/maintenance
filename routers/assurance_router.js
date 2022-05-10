import express from 'express';
import Prisma from '@prisma/client';

const { PrismaClient } = Prisma;

const assuranceRouter = express.Router();
const { assurance, vehicule } = new PrismaClient();

//toute les assurance
assuranceRouter.get('/', async (req, res) => {
  try {
    const assurances = await assurance.findMany();
    res.status(200).send(assurances);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Ajouter une assurance
assuranceRouter.post('/', async (req, res) => {
  console.log('now : ');
  try {
    const { numero_police, date_debut, date_fin, vehicule_id } = req.body;

    const vehiculeExist = await vehicule.findFirst({
      where: {
        id: Number(vehicule_id),
      },
    });
    if (vehiculeExist) {
      const createdAssurance = await assurance.create({
        data: {
          numero_police,
          date_debut,
          date_fin,
          vehicule_id,
        },
      });
      res.status(201).send(createdAssurance);
    } else {
      res.status(404).send('Vehicule not exist');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//modifier une assurance
assuranceRouter.put('/', async (req, res) => {
  try {
    const { id, numero_police, date_debut, date_fin, vehicule_id } = req.body;
    const assuranceExist = await assurance.findUnique({
      where: {
        id,
      },
    });
    if (assuranceExist) {
      const updatedAssurance = await assurance.update({
        where: {
          id,
        },
        data: {
          numero_police,
          date_debut,
          date_fin,
          vehicule_id,
        },
      });
      res.status(200).send(updatedAssurance);
    } else {
      res.status(404).send('Assurance not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//supprimer une assurance
assuranceRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAssurance = await assurance.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).send('Assurance deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//filtrer les assurances
assuranceRouter.post('/filtrer', async (req, res) => {
  try {
    const data = req.body;
    const filtredAssurances = await assurance.findMany({
      where: data,
    });
    res.status(200).send(filtredAssurances);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default assuranceRouter;
