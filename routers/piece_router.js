import express from 'express';
import Prisma from '@prisma/client';
import { isAuth } from '../utils.js';

const { PrismaClient } = Prisma;

const pieceRouter = express.Router();
const { piece, fournisseur, maintenance_Piece } = new PrismaClient();

//toute les piéces
pieceRouter.get('/', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const pieces = await piece.findMany({
      where: {
        user_id,
      },
      include: {
        fournisseur: true,
      },
    });
    res.status(200).send(pieces);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Ajouter un piece
pieceRouter.post('/', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { nom, quantite, fournisseur_id } = req.body;
    const fournisseurExist = await fournisseur.findFirst({
      where: {
        AND: {
          id: Number(fournisseur_id),
          user_id,
        },
      },
    });

    if (!fournisseurExist) {
      return res.status(404).send('Fournisseur not found');
    }
    const createdPiece = await piece.createMany({
      data: [
        {
          user_id,
          nom,
          quantite,
          fournisseur_id,
        },
      ],
    });
    res.status(201).send(createdPiece);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//modifier une piece
pieceRouter.put('/:id', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { id } = req.params;

    const { nom, quantite, fournisseur_id } = req.body;
    const pieceExist = await piece.findFirst({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
    });
    if (pieceExist) {
      const updatedFournisseur = await piece.updateMany({
        where: {
          AND: {
            id: Number(id),
            user_id,
          },
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
pieceRouter.delete('/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user_id;

    const pieceExist = await piece.findFirst({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
    });
    if (pieceExist) {
      const deletedPiece = await piece.deleteMany({
        where: {
          AND: {
            id: Number(id),
            user_id,
          },
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
pieceRouter.post('/filtrer', isAuth, async (req, res) => {
  try {
    const user_id = req.user_id;

    const data = req.body;
    data.user_id = user_id;

    const filtredPieces = await piece.findMany({
      where: data,
    });
    res.status(200).send(filtredPieces);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//trouver plusieurs pieces avec leurs id

pieceRouter.post('/byids', async (req, res) => {
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

//pieces plus uitlisés ,pieces ordonnée selon leurs quantité utilisé dans les maintenance par ordre décroissant
pieceRouter.get('/plusutilise', async (req, res) => {
  try {
    const p = await maintenance_Piece.groupBy({
      by: ['piece_id'],
      orderBy: {
        _sum: {
          quantite: 'desc',
        },
      },
    });
    res.send(p);
  } catch (error) {
    res.send(error.message);
  }
});

// une seule piece
pieceRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user_id;
    const result = await piece.findFirst({
      where: {
        AND: {
          id: Number(id),
          user_id,
        },
      },
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default pieceRouter;
