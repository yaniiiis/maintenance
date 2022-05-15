import express from 'express';
import Prisma from '@prisma/client';
import { isAuth } from '../utils.js';

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
maintenanceRouter.get('/', isAuth, async(req, res) => {
    try {
        const user_id = req.user_id;
        const maintenances = await maintenance.findMany({
            where: {
                user_id,
            },
            include: {
                type: true,
                mecanicien: true,
                vehicule: true,
                pieces: true,


            },
        });
        res.status(200).send(maintenances);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// une seul maintenance
maintenanceRouter.get('/:id', isAuth, async(req, res) => {
    try {
        const user_id = req.user_id;
        const { id } = req.params;

        const maintenances = await maintenance.findFirst({
            where: {
                user_id,
                id: Number(id)
            },
            include: {
                type: true,
                mecanicien: true,
                vehicule: true,
                pieces: true,

            },
        });
        res.status(200).send(maintenances);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Ajouter un maintenance
maintenanceRouter.post('/', isAuth, async(req, res) => {
    const user_id = req.user_id;
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
            type2,
            cout,
            fichier,
            piecesIdQte,
            date,
        } = req.body;

        if (piecesIdQte == null || piecesIdQte.length < 1) {
            return res.status(400).send('Pieces not found');
        }

        for (const p of piecesIdQte) {
            await getPieces(p.id, p.quantite);
        }

        if (idsOfnotExistingPieces.length > 0) {
            return res
                .status(201)
                .send('pieces ' + idsOfnotExistingPieces + ' quantité non disponbile');
        } else {
            const vehiculeExist = await vehicule.findUnique({
                where: {
                    id: Number(vehicule_id),
                },
                select: {
                    id: true,
                },
            });

            if (!vehiculeExist) {
                return res.status(404).send('Vehicule not found');
            }
            const mecanicienExist = await mecanicien.findUnique({
                where: {
                    id: Number(mecanicien_id),
                },
                select: {
                    id: true,
                },
            });

            if (!mecanicienExist) {
                return res.status(404).send('mecanicien');
            }
            const typeExist = await typeMaintenance.findUnique({
                where: {
                    id: Number(type_id),
                },
                select: {
                    id: true,
                },
            });
            if (!typeExist) {
                return res.status(404).send('Type not found');
            }
            const createdMaintenance = await maintenance.create({
                data: {
                    user_id,
                    nom,
                    vehicule_id,
                    type_id,
                    description,
                    type2,
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
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//modifier une maintenance
maintenanceRouter.put('/:id', isAuth, async(req, res) => {
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
        const user_id = req.user_id;
        const { id } = req.params;
        const {
            nom,
            vehicule_id,
            newPiecesIdQte,
            type_id,
            description,
            cout,
            type2,
            fichier,
            oldPiecesIdQte,
        } = req.body;

        if (newPiecesIdQte == null || newPiecesIdQte.length < 1) {
            return res.status(400).send('Pieces not found');
        }

        for (const p of newPiecesIdQte) {
            await getPieces(p.id, p.quantite);
        }

        if (idsOfnotExistingPieces.length > 0) {
            return res
                .status(201)
                .send('pieces ' + idsOfnotExistingPieces + ' quantité non disponbile');
        }

        const maintenanceExist = await maintenance.findFirst({
            where: {
                id: Number(id),
                user_id,
            },
            include: {
                pieces: {
                    include: {
                        piece: true,
                    },
                },
            },
        });
        if (!maintenanceExist) {
            return res.status(404).send('maintenance not found');
        }

        const vehiculeExist = await vehicule.findFirst({
            where: {
                id: Number(vehicule_id),
                user_id,
            },
        });

        if (!vehiculeExist) {
            return res.status(404).send('Vehicule not found');
        }
        const typeExist = await typeMaintenance.findFirst({
            where: {
                id: Number(type_id),
            },
        });
        if (!typeExist) {
            return res.status(404).send('Type not exist');
        }

        const updatedMaintenance = await maintenance.updateMany({
            where: {
                AND: {
                    id: Number(id),
                    user_id,
                },
            },
            data: {
                nom,
                vehicule_id,
                type_id,
                description,
                type2,
                cout,
                fichier,
            },
        });
        // supprimer les MAintenace_Pieces qui existent pour cette maintenance
        const deleteMaintenancePiece = await maintenance_Piece.deleteMany({
            where: {
                user_id,
                maintenance_id: updatedMaintenance.id,
            },
        });
        // Inserer des nouvelles maintenance pieces avec les nouveaux id des pieces
        let maintenancePiecesData = [];
        for (const p of newPiecesIdQte) {
            await maintenancePiecesData.push({
                piece_id: p.id,
                maintenance_id: maintenanceExist.id,
            });
        }
        const newMaintenancePieces = await maintenance_Piece.createMany({
            data: maintenancePiecesData,
        });
        let oldPiecesIds = [];
        for (const p of oldPiecesIdQte) {
            oldPiecesIds.push(p.id);
        }
        let newPiecesIds = [];
        for (const p of newPiecesIdQte) {
            newPiecesIds.push(p.id);
        }

        // mettre à jour la quantité des pieces présentes dans la novellle et l'ancienne modification
        for (const newPiece of newPiecesIdQte) {
            for (const oldPiece of oldPiecesIdQte) {
                if (newPiece.id == oldPiece.id) {
                    if (oldPiece.quantite > newPiece.quantite) {
                        const updatePiece = await piece.updateMany({
                            where: {
                                AND: {
                                    user_id,
                                    id: oldPiece.id,
                                },
                            },
                            data: {
                                quantite: {
                                    increment: oldPiece.quantite - newPiece.quantite,
                                },
                            },
                        });
                    } else if (oldPiece.quantite < newPiece.quantite) {
                        const updatePiece = await piece.updateMany({
                            where: {
                                AND: {
                                    user_id,
                                    id: oldPiece.id,
                                },
                            },
                            data: {
                                quantite: {
                                    decrement: newPiece.quantite - oldPiece.quantite,
                                },
                            },
                        });
                    }
                }
            }
        }

        // déminuer la quantité des piece qui sont présente dans la nouvelle modification et non pas dans lancienne

        for (const p of newPiecesIdQte) {
            if (!oldPiecesIds.includes(p.id)) {
                const updatedPiece = await piece.updateMany({
                    where: {
                        AND: {
                            user_id,
                            id: p.id,
                        },
                    },
                    data: {
                        quantite: {
                            decrement: p.quantite,
                        },
                    },
                });
            }
        }

        //retrouver la quantité initial des pieces qui sont pas présente de la nouvelle modification

        for (const p of oldPiecesIdQte) {
            if (!newPiecesIds.includes(p.id)) {
                const updatedPiece = await piece.updateMany({
                    where: {
                        AND: {
                            user_id,
                            id: p.id,
                        },
                    },
                    data: {
                        quantite: {
                            increment: p.quantite,
                        },
                    },
                });
            }
        }

        res.status(200).send('success');
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});

//supprimer une maintenance
maintenanceRouter.delete('/:id', isAuth, async(req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user_id;

        const maintenanceExist = await maintenance.findFirst({
            where: {
                id: Number(id),
                user_id,
            },
        });
        if (maintenanceExist) {
            const deletedMaintenance = await maintenance.deleteMany({
                where: {
                    AND: {
                        id: Number(id),
                        user_id,
                    },
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
maintenanceRouter.post('/filtrer', isAuth, async(req, res) => {
    try {
        const data = req.body;
        data.user_id = req.user_id;
        delete data.hash;
        const filtredMaintenances = await maintenance.findMany({
            where: data,
        });
        res.status(200).send(filtredMaintenances);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


export default maintenanceRouter;