import express from 'express';
import Prisma from '@prisma/client';
import { isAuth } from '../utils.js';
import moment from 'moment';
import axios from 'axios';
const { PrismaClient } = Prisma;

const notificationRouter = express.Router();
const { maintenance, vehicule, user } = new PrismaClient();

notificationRouter.get('/', isAuth, async (req, res) => {
  const user_id = req.user_id;
  const hash = req.hash;

  try {
    const maintenances = await maintenance.findMany({
      where: {
        type2: 'Preventive',
        etat: 'Avant',
        user_id,
      },
      include: {
        vehicule: true,
      },
    });

    let alerts = [];
    let trackerIdsToCheckMileage = [];
    //fetch all maintenance preventives
    maintenances.forEach((m) => {
      //check if maintenance date arrived than add it to alert
      if (m.alerte_date) {
        if (moment().diff(moment(m.alerte_date)) > 0)
          alerts.push(generateDateAlert(m));
      }
      //check if maintenance has mileage notification than add its trackerId to check list
      if (m.alerte_km) {
        trackerIdsToCheckMileage.push(m.vehicule.trackerId);
      }
    });

    if (trackerIdsToCheckMileage.length < 1)
      return res.status(200).send(alerts);

    const { data } = await axios.post(
      'https://mrigel.dz/api/tracker/counter/value/list?hash=' + hash,
      { trackers: trackerIdsToCheckMileage, type: 'odometer' }
    );

    maintenances.forEach((m) => {
      if (
        data.value.hasOwnProperty(m.vehicule.trackerId) &&
        m.alerte_km &&
        data.value[m.vehicule.trackerId] > m.alerte_km
      ) {
        alerts.push(generateMileageAlert(m));
      }
    });

    res.status(200).send(alerts);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//get number of not inserted vehicul
notificationRouter.post('/vehicules', isAuth, async (req, res) => {
  try {
    const hash = req.hash;

    const getVehiculesFromNavixy = await axios.post(
      'https://www.mrigel.dz/api/vehicle/list',
      {
        hash,
      }
    );
    const vehiculeFromNavixy = getVehiculesFromNavixy.data.list;
    const filtredVehiculeFromNavixy = vehiculeFromNavixy.filter(
      (v) => v.tracker_id != null
    );

    const getVIdsFromBdd = await vehicule.findMany({
      where: {
        user_id: Number(req.user_id),
      },
      select: {
        trackerId: true,
      },
    });

    if (filtredVehiculeFromNavixy.length > getVIdsFromBdd.length) {
      return res.send({
        not_inserted: filtredVehiculeFromNavixy.length - getVIdsFromBdd.length,
      });
    }

    return res.send({
      not_inserted: 0,
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

//max depense
notificationRouter.post('/depense', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const gotMaxDepnse = await user.findFirst({
      where: {
        id: Number(user_id),
      },
      select: {
        maxDepenseAlert: true,
      },
    });
    const maxDepenseToFloat = Number(gotMaxDepnse.maxDepenseAlert);

    const depenseByVehicule = await maintenance.groupBy({
      by: ['vehicule_id'],
      _sum: {
        cout: true,
      },
      where: {
        user_id: Number(user_id),
      },
    });
    //  return res.send(depenseByVehicule);
    const ids = depenseByVehicule.map((m) => {
      return m.vehicule_id;
    });
    const vehicules = await vehicule.findMany({
      where: {
        id: { in: ids },
      },
    });
    let data = [];
    depenseByVehicule.forEach((m) => {
      const foundVehicul = vehicules.find((v) => v.id == m.vehicule_id);
      if (m._sum.cout > maxDepenseToFloat) {
        data.push({
          cout: m._sum.cout,
          vehicule_id: foundVehicul.id,
          vehicule_name: foundVehicul.nom,
        });
      }
    });

    res.send(data);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

function generateDateAlert(maintenance) {
  return {
    maintenanceId: maintenance.id,
    description:
      'La date de la maintenance ' +
      maintenance.nom +
      ' est arrivée pour le véhicule ' +
      maintenance.vehicule.nom,
    type: 'date',
  };
}

function generateMileageAlert(maintenance) {
  return {
    maintenanceId: maintenance.id,
    description:
      'Le véhicule ' +
      maintenance.vehicule.nom +
      ' a atteind le kilométrage ' +
      maintenance.alerte_km +
      ' pour effectuer la maintenance ' +
      maintenance.nom,
    type: 'km',
  };
}

export default notificationRouter;
