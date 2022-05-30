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
            etat,
            alerte_date,
            alerte_km,
        } = req.body;

        if (piecesIdQte == null) {
            return res.status(401).send('Pieces not found');
        }

        for (const p of piecesIdQte) {
            await getPieces(p.id, p.quantite);
        }

        if (idsOfnotExistingPieces.length > 0) {
            return res
                .status(401)
                .send("Quantité des piéces non disponible");
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
                    etat,
                    alerte_date,
                    alerte_km,
                },
            });
            if (createdMaintenance) {
                let data = [];

                for (const p of piecesIdQte) {
                    await data.push({
                        piece_id: p.id,
                        maintenance_id: createdMaintenance.id,
                        quantite: p.quantite,
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
            piecesIdQte,
            type_id,
            description,
            cout,
            type2,
            fichier,
            oldPiecesIdQte,
            etat,
            alerte_date,
            alerte_km,
        } = req.body;

        if (piecesIdQte == null) {
            return res.status(401).send('Pieces not found');
        }

        for (const p of piecesIdQte) {
            await getPieces(p.id, p.quantite);
        }

        if (idsOfnotExistingPieces.length > 0) {
            return res
                .status(401)
                .send('Quantitées des piéces non disponible');
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
                etat,
                alerte_date,
                alerte_km,

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
        for (const p of piecesIdQte) {
            await maintenancePiecesData.push({
                piece_id: p.id,
                maintenance_id: maintenanceExist.id,
                quantite: p.quantite,
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
        for (const p of piecesIdQte) {
            newPiecesIds.push(p.id);
        }

        // mettre à jour la quantité des pieces présentes dans la novellle et l'ancienne modification
        for (const newPiece of piecesIdQte) {
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

        for (const p of piecesIdQte) {
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
                AND: {
                    id: Number(id),
                    user_id,
                },
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

//maintenance par dates
maintenanceRouter.post('/pardates', isAuth, async(req, res) => {
    try {
        const { dateStart, dateEnd } = req.body;
        const user_id = req.user_id;
        const maintenances = await maintenance.findMany({
            where: {
                AND: {
                    user_id,
                    date: {
                        lte: dateEnd,
                        gte: dateStart,
                    },
                },
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

//nombre des maintenance curatives
maintenanceRouter.post('/curativenb', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const maintenances = await maintenance.aggregate({
            _count: {
                _all: true,
            },
            where: {
                AND: {
                    type2: 'Curative',
                    user_id,
                },
            },
        });
        res.status(200).send({ count: maintenances._count._all });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//nombre des maintenance curatives par dates
maintenanceRouter.post('/curativenbbydates', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const { dateStart, dateEnd } = req.body;
        const maintenances = await maintenance.count({
            where: {
                AND: {
                    type2: 'Curative',
                    user_id,
                    date: {
                        lte: dateEnd,
                        gte: dateStart,
                    },
                },
            },
        });
        res.status(200).send({ count: maintenances });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// maintenance curatives
maintenanceRouter.get('/curative', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const maintenances = await maintenance.findMany({
            where: {
                AND: {
                    type2: 'Curative',
                    user_id,
                },
            },
        });
        res.status(200).send(maintenances);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//nombre des maintenance prevéventives
maintenanceRouter.post('/preventivenb', isAuth, async(req, res) => {
    const user_id = req.user_id;
    try {
        const maintenances = await maintenance.aggregate({
            _count: {
                _all: true,
            },
            where: {
                AND: {
                    type2: 'Preventive',
                    user_id,
                },
            },
        });
        res.status(200).send({ count: maintenances._count._all });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//nombre des maintenance préventives  par dates
maintenanceRouter.post('/preventivenbbydates', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const { dateStart, dateEnd } = req.body;
        const maintenances = await maintenance.count({
            where: {
                AND: {
                    type2: 'Preventive',
                    user_id,
                    date: {
                        lte: dateEnd,
                        gte: dateStart,
                    },
                },
            },
        });
        res.status(200).send({ count: maintenances });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// maintenance préventives
maintenanceRouter.get('/preventive', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const maintenances = await maintenance.findMany({
            where: {
                type2: 'Preventive',
                user_id,
            },
        });
        res.status(200).send(maintenances);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//total dépense maintenance
maintenanceRouter.post('/total', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const total = await maintenance.aggregate({
            _sum: {
                cout: true,
            },
            where: {
                user_id,
            },
        });
        res.status(200).send(total._sum);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//total dépense maintenance par dates
maintenanceRouter.post('/totalpardates', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const { dateStart, dateEnd } = req.body;
        const total = await maintenance.aggregate({
            _sum: {
                cout: true,
            },
            where: {
                AND: {
                    user_id,
                    date: {
                        gte: dateStart,
                        lte: dateEnd,
                    },
                },
            },
        });
        res.status(200).send(total._sum);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//somme des maintenance de chaque vehicule 
maintenanceRouter.post('/depenseparvehicule', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const { dateStart, dateEnd } = req.body;
        const gettedMaintenance = await maintenance.groupBy({
            by: ['vehicule_id'],

            _sum: {
                cout: true,
            },
            where: {
                user_id,

            },
        });

        const ids = gettedMaintenance.map((m) => {
            return m.vehicule_id;
        });
        const vehicules = await vehicule.findMany({
            where: {
                id: { in: ids },
            },
        });

        let data = [];
        gettedMaintenance.forEach((m) => {
            data.push({
                cout: m._sum.cout,
                vehicule: vehicules.find((v) => {
                    return v.id == m.vehicule_id;
                }).nom,
            });
        });
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


//somme des maintenance de chaque vehicule pour une periode
maintenanceRouter.post('/depenseparvehiculepardates', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const { dateStart, dateEnd } = req.body;
        const gettedMaintenance = await maintenance.groupBy({
            by: ['vehicule_id'],

            _sum: {
                cout: true,
            },
            where: {
                user_id,
                date: {
                    lte: dateEnd,
                    gte: dateStart,
                },
            },
        });

        const ids = gettedMaintenance.map((m) => {
            return m.vehicule_id;
        });
        const vehicules = await vehicule.findMany({
            where: {
                id: { in: ids },
            },
        });

        let data = [];
        gettedMaintenance.forEach((m) => {
            data.push({
                cout: m._sum.cout,
                vehicule: vehicules.find((v) => {
                    return v.id == m.vehicule_id;
                }).nom,
            });
        });
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


//somme des maintenance de chaque vehicule (de plus cher en terme de maintenance...)
maintenanceRouter.post('/sommeparvehicule', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const gettedMaintenance = await maintenance.groupBy({
            by: ['vehicule_id'],

            _sum: {
                cout: true,
            },
            orderBy: {
                _sum: {
                    cout: 'desc',
                },
            },

            where: {
                user_id,
            },
        });
        const ids = gettedMaintenance.map((m) => {
            return m.vehicule_id;
        });
        const vehicules = await vehicule.findMany({
            where: {
                id: { in: ids },
            },
        });

        let data = [];
        gettedMaintenance.forEach((m) => {
            data.push({
                cout: m._sum.cout,
                vehicule_id: m.vehicule_id,
                vehicule: vehicules.find((v) => {
                    return v.id == m.vehicule_id;
                }).nom,
            });
        });
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//somme des maintenance de chaque vehicule  (de plus cher en terme de maintenance...) par dates
maintenanceRouter.post(
    '/sommeparvehiculepardates',
    isAuth,
    async(req, res) => {
        const user_id = req.user_id;

        try {
            const { dateStart, dateEnd } = req.body;
            const gettedMaintenance = await maintenance.groupBy({
                by: ['vehicule_id'],

                _sum: {
                    cout: true,
                },
                orderBy: {
                    _sum: {
                        cout: 'desc',
                    },
                },

                where: {
                    AND: {
                        user_id,
                        date: {
                            gte: dateStart,
                            lte: dateEnd,
                        },
                    },
                },
            });
            const ids = gettedMaintenance.map((m) => {
                return m.vehicule_id;
            });
            const vehicules = await vehicule.findMany({
                where: {
                    id: { in: ids },
                },
            });

            let data = [];
            gettedMaintenance.forEach((m) => {
                data.push({
                    cout: m._sum.cout,
                    vehicule_id: m.vehicule_id,
                    vehicule: vehicules.find((v) => {
                        return v.id == m.vehicule_id;
                    }).nom,
                });
            });
            res.status(200).send(data);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
);

// list des dernieres maintennaces triées par date

maintenanceRouter.post('/dernierscoups', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const gettedMaintenance = await maintenance.findMany({

            orderBy: {
                date: 'desc',
            },

            where: {
                user_id,
            },
        });
        const ids = gettedMaintenance.map((m) => {
            return m.vehicule_id;
        });
        const vehicules = await vehicule.findMany({
            where: {
                id: { in: ids },
            },
        });

        let data = [];
        gettedMaintenance.forEach((m) => {
            data.push({
                cout: m.cout,
                vehicule_id: m.vehicule_id,
                vehicule: vehicules.find((v) => {
                    return v.id == m.vehicule_id;
                }).nom,
                maintenanceId: m.id,
                maintenanceNom: m.nom
            });
        });
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// list des dernieres maintennaces triées par date pendant une periode

maintenanceRouter.post('/dernierscoupspardate', isAuth, async(req, res) => {
    const user_id = req.user_id;
    const { dateStart, dateEnd } = req.body;

    try {
        const gettedMaintenance = await maintenance.findMany({

            orderBy: {
                date: 'desc',
            },

            where: {
                AND: {
                    user_id,

                    date: {
                        gte: dateStart,
                        lte: dateEnd,
                    },
                }
            },
        });
        const ids = gettedMaintenance.map((m) => {
            return m.vehicule_id;
        });
        const vehicules = await vehicule.findMany({
            where: {
                id: { in: ids },
            },
        });

        let data = [];
        gettedMaintenance.forEach((m) => {
            data.push({
                cout: m.cout,
                vehicule_id: m.vehicule_id,
                vehicule: vehicules.find((v) => {
                    return v.id == m.vehicule_id;
                }).nom,
            });
        });
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//cout des trois derniere maintenance
maintenanceRouter.get('/cout3', isAuth, async(req, res) => {
    const user_id = req.user_id;

    try {
        const couts = await maintenance.findMany({
            orderBy: {
                date: 'desc',
            },
            select: {
                id: true,
                cout: true,
            },
            where: {
                user_id,
            },
            take: 3,
        });
        res.status(200).send(couts);
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
                id: Number(id),
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

export default maintenanceRouter;