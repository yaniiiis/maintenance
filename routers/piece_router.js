import express from 'express';
import Prisma from '@prisma/client';

const { PrismaClient } = Prisma;

const pieceRouter = express.Router();
const { piece, fournisseur } = new PrismaClient();

//toute les piéces
pieceRouter.get('/', async(req, res) => {
    try {
        const pieces = await piece.findMany({
            include: {
                fournisseur: true
            }
        });
        res.status(200).send(pieces);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// une seule piece

pieceRouter.get('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const result = await piece.findUnique({
            where: {
                id: Number(id),
            },
        });
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Ajouter un piece
pieceRouter.post('/', async(req, res) => {
    try {
        const { nom, quantite, fournisseur_id } = req.body;
        const fournisseurExist = await fournisseur.findUnique({
            where: {
                id: Number(fournisseur_id),
            },
        });

        if (fournisseurExist) {
            const createdPiece = await piece.createMany({
                data: [{
                    nom,
                    quantite,
                    fournisseur_id,
                }, ],
            });
            res.status(201).send(createdPiece);
        } else {
            res.status(404).send('Fournisseur not exist');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//modifier une piece
pieceRouter.put('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const { nom, quantite, fournisseur_id } = req.body;
        const pieceExist = await piece.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (pieceExist) {
            const updatedFournisseur = await piece.update({
                where: {
                    id: Number(id),
                },
                data: {
                    nom,
                    quantite,
                    fournisseur_id,
                },
            });
            res.status(200).send(updatedFournisseur);
        } else {
            res.status(404).send('piece not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//supprimer une piece
pieceRouter.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const pieceExist = await piece.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (pieceExist) {
            const deletedPiece = await piece.delete({
                where: {
                    id: Number(id),
                },
            });
            res.status(200).send('piece deleted');
        } else {
            res.status(404).send('piece not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//filtrer les pieces
pieceRouter.post('/filtrer', async(req, res) => {
    try {
        const data = req.body;
        const filtredPieces = await piece.findMany({
            where: data,
        });
        res.status(200).send(filtredPieces);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//trouver plusieurs pieces avec leurs id

pieceRouter.post('/byids', async(req, res) => {
    try {
        const { piecesIds } = req.body;
        let ids = [];
        piecesIds.forEach((pieceId) => {
            ids.push({ id: pieceId });
        });

        const pieces = await piece.findMany({
            where: {
                OR: ids,
            },
        });
        pieces.forEach((piece) => {
            if (piece.quantite < 26) {
                res.send('piece ' + piece.nom + ' introuvable en stock');
                return;
            }
        });
        res.send(pieces);
    } catch (error) {
        res.send(error.message);
    }
});

export default pieceRouter;