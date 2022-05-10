import express from 'express';
import Prisma from '@prisma/client';

const { PrismaClient } = Prisma;

const mecanicienRouter = express.Router();
const { mecanicien } = new PrismaClient();

//tout les mécanicien
mecanicienRouter.get('/', async (req, res) => {
  try {
    const mecaniciens = await mecanicien.findMany();
    res.status(200).send(mecaniciens);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Ajouter un mecanicien
mecanicienRouter.post('/', async (req, res) => {
  try {
    const { nom, prenom, nom_entreprise, numero_tel, adresse, description } =
      req.body;
    const createdMecanicien = await mecanicien.create({
      data: {
        nom,
        prenom,
        nom_entreprise,
        numero_tel,
        adresse,
        description,
      },
    });
    res.status(201).send(createdMecanicien);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//modifier un mecanicien
mecanicienRouter.put('/', async (req, res) => {
  try {
    const {
      id,
      nom,
      prenom,
      nom_entreprise,
      numero_tel,
      adresse,
      description,
    } = req.body;
    const MecanicienExist = await mecanicien.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (MecanicienExist) {
      const updatedMecanicien = await mecanicien.update({
        where: {
          id,
        },
        data: {
          nom,
          prenom,
          nom_entreprise,
          numero_tel,
          adresse,
          description,
        },
      });
      res.status(200).send(updatedMecanicien);
    } else {
      res.status(404).send('mecanicien not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//supprimer un mecanicien
mecanicienRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const MecanicienExist = await mecanicien.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (MecanicienExist) {
      const deletedMecanicien = await mecanicien.delete({
        where: {
          id: Number(id),
        },
      });
      res.status(200).send('mecanicien deleted');
    } else {
      res.status(404).send('mecanicien not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//filtrer les Mecaniciens
mecanicienRouter.post('/filtrer', async (req, res) => {
  try {
    const data = req.body;
    const filtredMecaniciens = await mecanicien.findMany({
      where: data,
    });
    res.status(200).send(filtredMecaniciens);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default mecanicienRouter;
