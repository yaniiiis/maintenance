import express from 'express';
import Prisma from '@prisma/client';
import { isAuth } from '../utils.js';

const { PrismaClient } = Prisma;

const fournisseurRouter = express.Router();
const { fournisseur } = new PrismaClient();

//tout les fournisseurs
fournisseurRouter.get('/', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const fournisseurs = await fournisseur.findMany({
      where: {
        user_id,
      },
    });
    res.status(200).send(fournisseurs);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// un seul fournisseur

fournisseurRouter.get('/:id', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { id } = req.params;
    const result = await fournisseur.findFirst({
      where: {
        user_id,
        id: Number(id),
      },
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Ajouter un fournisseur
fournisseurRouter.post('/', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { nom, prenom, nom_entreprise, numero_tel, adresse, description } =
      req.body;
    const createdFournisseur = await fournisseur.create({
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
    res.status(201).send(createdFournisseur);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//modifier un fournisseur
fournisseurRouter.put('/:id', isAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const user_id = req.user_id;
    const { id } = req.params;
    const { nom, prenom, nom_entreprise, numero_tel, adresse, description } =
      req.body;
    const fournisseurExist = await fournisseur.findFirst({
      where: {
        id: Number(id),
        user_id,
      },
    });
    if (fournisseurExist) {
      const updatedFournisseur = await fournisseur.updateMany({
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
      res.status(200).send(updatedFournisseur);
    } else {
      res.status(404).send('Fournisseur not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//supprimer un fournisseur
fournisseurRouter.delete('/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user_id;

    const fournisseurExist = await fournisseur.findFirst({
      where: {
        id: Number(id),
        user_id,
      },
    });
    if (fournisseurExist) {
      const deletedFournisseur = await fournisseur.deleteMany({
        where: {
          AND: {
            id: Number(id),
            user_id,
          },
        },
      });
      res.status(200).send('Fournisseur deleted');
    } else {
      res.status(404).send('Fournisseur not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//filtrer les fournisseurs
fournisseurRouter.post('/filtrer', isAuth, async (req, res) => {
  try {
    let data = req.body;
    data.user_id = req.user_id;

    const filtredFournisseurs = await fournisseur.findMany({
      where: data,
    });
    res.status(200).send(filtredFournisseurs);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default fournisseurRouter;
