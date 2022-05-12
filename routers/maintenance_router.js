import express from 'express';
import Prisma from '@prisma/client';

const { PrismaClient } = Prisma;

const maintenanceRouter = express.Router();
const {
    maintenance,
    vehicule,
    typeMaintenance,
    maintenance_Piece,
    piece,
    mecanicien,
} = new PrismaClient();

//toute les maintenances
maintenanceRouter.get('/', async(req, res) => {
    try {
        const maintenances = await maintenance.findMany({
            include: {
                type: true,
                mecanicien: true,
                vehicule: true

            },
        });
        res.status(200).send(maintenances);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Ajouter un maintenance

maintenanceRouter.post('/', async(req, res) => {
    let idsOfnotExistingPieces = [];
    const getPieces = async(id, qte) => {
        const pInfos = await piece.findFirst({
            where: {
                AND: {
                    id: id,
                    quantite: {
                        gte: qte,
                    },
                },
            },
            select: {
                id: true,
            },
        });
        if (!pInfos) {
            idsOfnotExistingPieces.push(id);
        }
    };

    try {
        const {
            nom,
            vehicule_id,
            mecanicien_id,
            type_id,
            description,
            cout,
            fichier,
            piecesIdQte,
            date,
        } = req.body;

        for (const p of piecesIdQte) {
            await getPieces(p.id, p.quantite);
        }

        if (idsOfnotExistingPieces.length > 0) {
            return res
                .status(201)
                .send({ message: 'pieces ' + idsOfnotExistingPieces });
        } else {
            const vehiculeExist = await vehicule.findUnique({
                where: {
                    id: Number(vehicule_id),
                },
                select: {
                    id: true,
                },
            });

            if (vehiculeExist) {
                const mecanicienExist = await mecanicien.findUnique({
                    where: {
                        id: Number(mecanicien_id),
                    },
                    select: {
                        id: true,
                    },
                });

                if (mecanicienExist) {
                    const typeExist = await typeMaintenance.findUnique({
                        where: {
                            id: Number(type_id),
                        },
                        select: {
                            id: true,
                        },
                    });
                    if (typeExist) {
                        const createdMaintenance = await maintenance.create({
                            data: {
                                nom,
                                vehicule_id,
                                type_id,
                                description,
                                cout,
                                fichier,
                                mecanicien_id,
                                date,
                            },
                        });
                        if (createdMaintenance) {
                            let data = [];

                            for (const piece of piecesIdQte) {
                                await data.push({
                                    piece_id: piece.id,
                                    maintenance_id: createdMaintenance.id,
                                });
                            }

                            const maintenance_piece = await maintenance_Piece.createMany({
                                data: data,
                            });

                            const decrease = async(id, qte) => {
                                const decreased = await piece.update({
                                    where: {
                                        id,
                                    },
                                    data: {
                                        quantite: {
                                            decrement: qte,
                                        },
                                    },
                                });
                            };

                            for (const piece of piecesIdQte) {
                                await decrease(piece.id, piece.quantite);
                            }

                            res.status(201).send(createdMaintenance);
                        }
                    } else {
                        res.status(404).send({ message: 'type' });
                    }
                } else {
                    res.status(404).send({ message: 'mecanicien' });
                }
            } else {
                res.status(404).send({ message: 'vehicule' });
            }
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//modifier un véhicule
maintenanceRouter.put('/', async(req, res) => {
    try {
        const { id, nom, vehicule_id, type_id, description, cout, fichier } =
        req.body;
        const maintenanceExist = await maintenance.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (maintenanceExist) {
            const vehiculeExist = await vehicule.findUnique({
                where: {
                    id: Number(vehicule_id),
                },
            });

            if (vehiculeExist) {
                const typeExist = await typeMaintenance.findUnique({
                    where: {
                        id: Number(type_id),
                    },
                });
                if (typeExist) {
                    const updatedMaintenance = await maintenance.update({
                        where: {
                            id,
                        },
                        data: {
                            nom,
                            vehicule_id,
                            type_id,
                            description,
                            cout,
                            fichier,
                        },
                    });
                    res.status(200).send(updatedMaintenance);
                } else {
                    res.status(404).send('Type not exist');
                }
            } else {
                res.status(404).send('Vehicule not exist');
            }
        } else {
            res.status(404).send('maintenance not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//supprimer une maintenance
maintenanceRouter.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const maintenanceExist = await maintenance.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (maintenanceExist) {
            const deletedMaintenance = await maintenance.delete({
                where: {
                    id: Number(id),
                },
            });
            res.status(200).send('maintenance deleted');
        } else {
            res.status(404).send('maintenance not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//filtrer les maintenances
maintenanceRouter.post('/filtrer', async(req, res) => {
    try {
        const data = req.body;
        const filtredMaintenances = await maintenance.findMany({
            where: data,
        });
        res.status(200).send(filtredMaintenances);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//to review---------

// const gettedPieces = await piece.findMany({
//     where: {
//       OR: piecesIdQte,
//     },
//     select: {
//       id: true,
//     },
//   });
//   if (gettedPieces.length < piecesIdQte.length) {
//     let ids = [];
//     gettedPieces.forEach((element) => {
//       ids.push(element.id);
//     });
//     const filtred = piecesIdQte.filter((piece) => !ids.includes(piece.id));
//     let filtredIds = [];
//     filtred.forEach((element) => {
//       filtredIds.push(element.id);
//     });
//     return res.status(404).send({ message: 'pieces ' + filtred });
//   }

export default maintenanceRouter;