import express from 'express';
import Prisma from '@prisma/client';
import { isAuth } from '../utils.js';
import moment from 'moment';
import axios from 'axios';

const { PrismaClient } = Prisma;

const vehiculeRouter = express.Router();
const { vehicule, maintenance } = new PrismaClient();

//tout les véhicules
vehiculeRouter.get('/', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const vehicules = await vehicule.findMany({
      where: {
        user_id,
        maintenances: {},
      },
      include: {
        assurance: true,
        maintenances: true,
      },
    });

    vehicules.forEach((v) => {
      v.operationnel =
        v.maintenances.filter((m) => {
          return m.etat == 'EnCours';
        }).length == 0;
      delete v.maintenances;
    });
    res.status(200).send(vehicules);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Ajouter un véhicule
vehiculeRouter.post('/', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const {
      traqueur,
      trackerId,
      sourceId,
      nom,
      immatriculation,
      numero_chassis,
      carburant,
      photo,
    } = req.body;
    const createdVehicule = await vehicule.create({
      data: {
        user_id,
        traqueur,
        trackerId,
        sourceId,
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
vehiculeRouter.put('/:id', isAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const user_id = req.user_id;
    const {
      traqueur,
      trackerId,
      sourceId,
      nom,
      immatriculation,
      numero_chassis,
      carburant,
      photo,
    } = req.body;
    const vehiculeExist = await vehicule.findFirst({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
    });
    if (vehiculeExist) {
      const updatedVehicule = await vehicule.updateMany({
        where: {
          AND: {
            id: Number(id),
            user_id,
          },
        },
        data: {
          traqueur,
          trackerId,
          sourceId,
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
vehiculeRouter.delete('/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user_id;
    const deletedVehicule = await vehicule.deleteMany({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
    });
    res.status(200).send('Vehicule deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//filtrer les véhicules
vehiculeRouter.post('/filtrer', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    let data = req.body;
    data.user_id = user_id;
    const filtredVehecules = await vehicule.findMany({
      where: data,
    });
    res.status(200).send(filtredVehecules);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//nombre de vehicule totale
vehiculeRouter.get('/count', async (req, res) => {
  try {
    const nbVehicules = await vehicule.count();
    res.status(200).send(nbVehicules.toString());
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//les vehicules normal
vehiculeRouter.get('/normal', isAuth, async (req, res) => {
  const user_id = req.user_id;

  try {
    const vehicules = await vehicule.findMany({
      where: {
        AND: {
          user_id,
          maintenances: {
            none: {
              etat: 'EnCours',
            },
          },
        },
      },
    });
    res.status(200).send(vehicules);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// les vehicules en maintenance
vehiculeRouter.get('/panne', isAuth, async (req, res) => {
  const user_id = req.user_id;

  try {
    const vehicules = await vehicule.findMany({
      where: {
        user_id,
        maintenances: {
          some: {
            AND: {
              etat: 'EnCours',
            },
          },
        },
      },
      include: {
        maintenances: true,
      },
    });
    res.status(200).send(vehicules);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//les vehicules en maintenance moins d'un mois
vehiculeRouter.get('/orange', isAuth, async (req, res) => {
  const user_id = req.user_id;

  try {
    let date = new Date();
    date.setMonth(date.getMonth() - 1);
    console.log(date);
    const vehicules = await vehicule.findMany({
      where: {
        user_id,
        AND: {
          maintenances: {
            some: {
              AND: {
                // date: {
                //     gte: date,
                // },
                etat: 'EnCours',
              },
            },
          },
          NOT: {
            maintenances: {
              none: {},
            },
          },
        },
      },
      include: {
        maintenances: true,
      },
    });
    res.status(200).send(vehicules);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//les vehicules en maintenance plus d'un mois
vehiculeRouter.get('/rouge/:days', isAuth, async (req, res) => {
  const user_id = req.user_id;
  const { days } = req.params;

  try {
    const date =
      moment().subtract(days, 'day').format('YYYY-MM-DDTHH:mm:ss') + 'Z';

    const vehicules = await vehicule.findMany({
      where: {
        AND: {
          user_id,
          maintenances: {
            some: {
              AND: {
                date: {
                  lt: date,
                },
                etat: 'EnCours',
              },
            },
          },
        },
      },
      include: {
        maintenances: true,
      },
    });
    res.status(200).send(vehicules);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//seed vehicule from navixy
vehiculeRouter.post('/seed', isAuth, async (req, res) => {
  try {
    const { hash } = req.body;
    const getVehiculesFromNavixy = await axios.post(
      'https://www.mrigel.dz/api/vehicle/list',
      {
        hash,
      }
    );

    const vehiculeFromNavixy = getVehiculesFromNavixy.data.list;

    const getTrackerList = await axios.post(
      'https://www.mrigel.dz/api/tracker/list',
      {
        hash,
      }
    );

    const tracketList = getTrackerList.data.list;

    const getTrackerIdsFromBdd = await vehicule.findMany({
      where: {
        user_id: Number(req.user_id),
      },
      select: {
        trackerId: true,
      },
    });

    let trackerIdsFromBdd = [];

    getTrackerIdsFromBdd.forEach((v) => {
      trackerIdsFromBdd.push(v.trackerId);
    });

    const filtredVehiculeFromNavixy = vehiculeFromNavixy.filter(
      (v) => !trackerIdsFromBdd.includes(v.tracker_id)
    );

    let data = [];
    filtredVehiculeFromNavixy.forEach((v) => {
      tracketList.forEach((t) => {
        if (v.tracker_id == t.id) {
          data.push({
            user_id: req.user_id,
            traqueur: v.tracker_label ?? '',
            trackerId: v.tracker_id ?? 0,
            sourceId: t.source.id ?? 0,
            nom: v.label ?? '',
            immatriculation: v.reg_number ?? '',
            numero_chassis: v.chassis_number ?? '',
            carburant: v.fuel_type ?? '',
            photo: v.avatar_file_name ?? '',
          });
        }
      });
    });

    if (data.length > 0) {
      const seedVehicules = await vehicule.createMany({
        data,
      });
      return res.send('inserted ' + seedVehicules.count.toString());
    }
    return res.send('all vehicules already exist in database');
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// un seul vehicule
vehiculeRouter.get('/:id', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { id } = req.params;
    const gettedVehicule = await vehicule.findFirst({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
    });
    res.status(200).send(gettedVehicule);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default vehiculeRouter;
