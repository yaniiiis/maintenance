import express from 'express';
import Prisma from '@prisma/client';

const { PrismaClient } = Prisma;

const typeMaintenanceRouter = express.Router();
const { typeMaintenance } = new PrismaClient();

//tout les types de maintenance
typeMaintenanceRouter.get('/', async(req, res) => {
    try {
        const typeMaintenances = await typeMaintenance.findMany({
            orderBy: {
                type: 'asc',
            }
        }, );
        res.status(200).send(typeMaintenances);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Ajouter un typemaintenance
typeMaintenanceRouter.post('/', async(req, res) => {
    try {
        const { type } = req.body;

        const createdTypeMaintenance = await typeMaintenance.createMany({
            data: [{
                type,
            }, ],
        });
        res.status(201).send(createdTypeMaintenance);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//modifier un type
typeMaintenanceRouter.put('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const { type } = req.body;
        const typeMaintenceExist = await typeMaintenance.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (typeMaintenceExist) {
            const updatedTypeMaintenance = await typeMaintenance.update({
                where: {
                    id: Number(id),

                },
                data: {
                    type,
                },
            });
            res.status(200).send(updatedTypeMaintenance);
        } else {
            res.status(404).send('typemaintenance not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//supprimer une typemaintenance
typeMaintenanceRouter.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const typeMaintenanceExist = await typeMaintenance.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (typeMaintenanceExist) {
            const deletedTypeMaintenance = await typeMaintenance.delete({
                where: {
                    id: Number(id),
                },
            });
            res.status(200).send('typemaintenance deleted');
        } else {
            res.status(404).send('typemaintenance not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default typeMaintenanceRouter;