import express from 'express';
import Prisma from '@prisma/client';
import { isAuth } from '../utils.js';

const { PrismaClient } = Prisma;

const vehiculeRouter = express.Router();
const { vehicule, maintenance } = new PrismaClient();

//tout les véhicules
vehiculeRouter.get('/', isAuth, async(req, res) => {
    try {
        const user_id = req.user_id;
        const vehicules = await vehicule.findMany({
            where: {
                user_id,
            },
            include: {
                assurance: true,
            },
        });
        res.status(200).send(vehicules);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Ajouter un véhicule
vehiculeRouter.post('/', isAuth, async(req, res) => {
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
            photo
        } =
        req.body;
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
vehiculeRouter.put('/:id', isAuth, async(req, res) => {
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
            photo
        } =
        req.body;
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
vehiculeRouter.delete('/:id', isAuth, async(req, res) => {
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
vehiculeRouter.post('/filtrer', isAuth, async(req, res) => {
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
vehiculeRouter.get('/count', async(req, res) => {
    try {
        const nbVehicules = await vehicule.count();
        res.status(200).send(nbVehicules.toString());
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//les vehicules normal
vehiculeRouter.get('/normal', async(req, res) => {
    try {
        const vehicules = await vehicule.findMany({
            where: {
                maintenances: {
                    none: {},
                },
            },
        });
        res.status(200).send(vehicules);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// les vehicules en maintenance
vehiculeRouter.get('/panne', async(req, res) => {
    try {
        const vehicules = await vehicule.findMany({
            where: {
                maintenances: {
                    some: {
                        AND: {
                            repare: false,
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
vehiculeRouter.get('/orange', async(req, res) => {
    try {
        let date = new Date();
        date.setMonth(date.getMonth() - 1);

        const vehicules = await vehicule.findMany({
            where: {
                AND: {
                    maintenances: {
                        every: {
                            AND: {
                                date: {
                                    gte: date,
                                },
                                repare: false,
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
vehiculeRouter.get('/rouge', async(req, res) => {
    try {
        let date = new Date();
        date.setMonth(date.getMonth() - 1);

        const vehicules = await vehicule.findMany({
            where: {
                maintenances: {
                    some: {
                        AND: {
                            date: {
                                lt: date,
                            },
                            repare: false,
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

// un seul vehicule
vehiculeRouter.get('/:id', isAuth, async(req, res) => {
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