import express from 'express';
import Prisma from '@prisma/client';
import { isAuth } from '../utils.js';

const { PrismaClient } = Prisma;

const mecanicienRouter = express.Router();
const { mecanicien } = new PrismaClient();

//tout les mécanicien
mecanicienRouter.get('/', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const mecaniciens = await mecanicien.findMany({
      where: {
        user_id,
      },
    });
    res.status(200).send(mecaniciens);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// un seul mecanicien

mecanicienRouter.get('/:id', async (req, res) => {
  try {
    const user_id = req.user_id;
    const { id } = req.params;
    const result = await mecanicien.findFirst({
      where: {
        AND: {
          user_id,
          id: Number(id),
        },
      },
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Ajouter un mecanicien
mecanicienRouter.post('/', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { nom, prenom, nom_entreprise, numero_tel, adresse, description } =
      req.body;
    const createdMecanicien = await mecanicien.create({
      data: {
        user_id,
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
mecanicienRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user_id;

    const { nom, prenom, nom_entreprise, numero_tel, adresse, description } =
      req.body;
    const MecanicienExist = await mecanicien.findFirst({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
    });
    if (MecanicienExist) {
      const updatedMecanicien = await mecanicien.updateMany({
        where: {
          AND: {
            id: Number(id),
            user_id,
          },
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
    const user_id = req.user_id;

    const MecanicienExist = await mecanicien.findFirst({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
    });
    if (MecanicienExist) {
      const deletedMecanicien = await mecanicien.deleteMany({
        where: {
          AND: {
            id: Number(id),
            user_id,
          },
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
mecanicienRouter.post('/filtrer', isAuth, async (req, res) => {
  try {
    const data = req.body;
    data.user_id = req.user_id;
    const filtredMecaniciens = await mecanicien.findMany({
      where: data,
    });
    res.status(200).send(filtredMecaniciens);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default mecanicienRouter;
