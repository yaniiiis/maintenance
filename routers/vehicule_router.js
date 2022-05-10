import express from 'express';
import Prisma from '@prisma/client';

const { PrismaClient } = Prisma;

const vehiculeRouter = express.Router();
const { vehicule } = new PrismaClient();

//tout les véhicules
vehiculeRouter.get('/', async (req, res) => {
  try {
    const vehicules = await vehicule.findMany();
    res.status(200).send(vehicules);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Ajouter un véhicule
vehiculeRouter.post('/', async (req, res) => {
  try {
    const { traqueur, nom, immatriculation, numero_chassis, carburant, photo } =
      req.body;
    const createdVehicule = await vehicule.create({
      data: {
        traqueur,
        nom,
        immatriculation,
        numero_chassis,
        carburant,
        photo,
      },
    });
    res.status(201).send(createdVehicule);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//modifier un véhicule
vehiculeRouter.put('/', async (req, res) => {
  try {
    const {
      id,
      traqueur,
      nom,
      immatriculation,
      numero_chassis,
      carburant,
      photo,
    } = req.body;
    const vehiculeExist = await vehicule.findUnique({
      where: {
        id,
      },
    });
    if (vehiculeExist) {
      const updatedVehicule = await vehicule.update({
        where: {
          id,
        },
        data: {
          traqueur,
          nom,
          immatriculation,
          numero_chassis,
          carburant,
          photo,
        },
      });
      res.status(200).send(updatedVehicule);
    } else {
      res.status(404).send('Vehicule not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//supprimer un véhicule
vehiculeRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVehicule = await vehicule.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).send('Vehicule deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//test filter
vehiculeRouter.post('/test', async (req, res) => {
  try {
    const { nom } = req.body;
    const test = await vehicule.findMany({
      where: {
        nom,
      },
    });
    res.status(200).send(test);
  } catch (error) {
    res.send(error.message);
  }
});

//filtrer les véhicules
vehiculeRouter.post('/filtrer', async (req, res) => {
  try {
    const data = req.body;
    const filtredVehecules = await vehicule.findMany({
      where: data,
    });
    res.status(200).send(filtredVehecules);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default vehiculeRouter;
