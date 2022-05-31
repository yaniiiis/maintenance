import express from 'express';
import Prisma from '@prisma/client';
import { isAuth } from '../utils.js';

const { PrismaClient } = Prisma;

const maintenanceVehiculeRouter = express.Router();
const {
    maintenance,
    vehicule,
    typeMaintenance,
    maintenance_Piece,
    piece,
    mecanicien,
} = new PrismaClient();



maintenanceVehiculeRouter.post('/:vehiculeId/', isAuth, async(req, res) => {
    const { vehiculeId } = req.params;

    const user_id = req.user_id;
    const { dateStart, dateEnd } = req.body;


    try {
        const user_id = req.user_id;
        const vehiculeResult = await vehicule.findFirst({
            where: {
                user_id,
                id: Number(vehiculeId),
            },

        });

        const maintenancesResult = await maintenance.findMany({
            where: {
                user_id,
                vehicule_id: Number(vehiculeId),
                date: {
                    lte: dateEnd,
                    gte: dateStart,
                },
            },
            include: {
                type: true,
            },
        });
        res.status(200).send({ vehicule: vehiculeResult, maintenances: maintenancesResult });
    } catch (error) {
        res.status(500).send(error.message);
    }
});


export default maintenanceVehiculeRouter;