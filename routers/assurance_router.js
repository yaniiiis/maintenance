import express from 'express';
import Prisma from '@prisma/client';
import { isAuth } from '../utils.js';

const { PrismaClient } = Prisma;

const assuranceRouter = express.Router();
const { assurance, vehicule } = new PrismaClient();

//toute les assurance
assuranceRouter.get('/', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const assurances = await assurance.findMany({
      where: {
        user_id,
      },
    });
    res.status(200).send(assurances);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//une seule assurance
assuranceRouter.get('/:id', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { id } = req.params;
    const gettedAssurance = await assurance.findMany({
      where: {
        AND: {
          user_id,
          id: Number(id),
        },
      },
    });
    res.status(200).send(gettedAssurance);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Ajouter une assurance
assuranceRouter.post('/', isAuth, async (req, res) => {
  console.log('now : ');
  try {
    const user_id = req.user_id;
    const { numero_police, date_debut, date_fin, vehicule_id } = req.body;

    const vehiculeExist = await vehicule.findFirst({
      where: {
        AND: {
          id: Number(vehicule_id),
          user_id,
        },
      },
    });
    if (!vehiculeExist) {
      return res.status(404).send('Vehicule not exist');
    }
    const createdAssurance = await assurance.create({
      data: {
        user_id,
        numero_police,
        date_debut,
        date_fin,
        vehicule_id,
      },
    });
    res.status(201).send(createdAssurance);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//modifier une assurance
assuranceRouter.put('/:id', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { id } = req.params;
    const { numero_police, date_debut, date_fin, vehicule_id } = req.body;
    const assuranceExist = await assurance.findFirst({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
    });
    if (!assuranceExist) {
      return res.status(404).send('Assurance not found');
    }
    const updatedAssurance = await assurance.updateMany({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
      data: {
        numero_police,
        date_debut,
        date_fin,
        vehicule_id,
      },
    });
    res.status(200).send(updatedAssurance);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//supprimer une assurance
assuranceRouter.delete('/:id', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { id } = req.params;
    const deletedAssurance = await assurance.deleteMany({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
    });
    res.status(200).send('Assurance deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//filtrer les assurances
assuranceRouter.post('/filtrer', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    let data = req.body;
    data.user_id = user_id;
    console.log('data', data);
    const filtredAssurances = await assurance.findMany({
      where: data,
    });
    res.status(200).send(filtredAssurances);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default assuranceRouter;
