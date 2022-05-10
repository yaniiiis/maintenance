import express from 'express';
import Prisma from '@prisma/client';

const { PrismaClient } = Prisma;

const maintenanceRouter = express.Router();
const { maintenance, vehicule, typeMaintenance, maintenance_Piece, piece } =
  new PrismaClient();

//toute les maintenances
maintenanceRouter.get('/', async (req, res) => {
  try {
    const maintenances = await maintenance.findMany();
    res.status(200).send(maintenances);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Ajouter un maintenance
maintenanceRouter.post('/', async (req, res) => {
  try {
    const { nom, vehicule_id, type_id, description, cout, fichier, piece_ids } =
      req.body;

    const vehiculeExist = await vehicule.findUnique({
      where: {
        id: Number(vehicule_id),
      },
    });

    if (vehiculeExist) {
      let pieceIds = [];
      piece_ids.forEach((pieceId) => {
        pieceIds.push({ id: pieceId });
      });
      const pieceExist = await piece.findMany({
        where: {
          OR: pieceIds,
        },
      });
      if (pieceExist) {
        pieceExist.forEach((piece) => {
          if (piece.quantite < 30) {
            res
              .status(401)
              .send('piece "' + piece.nom + '" introuvable en stock');
          }
        });
        const typeExist = await typeMaintenance.findUnique({
          where: {
            id: Number(type_id),
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
            },
          });
          if (createdMaintenance) {
            let data = [];
            pieceIds.forEach((piece) => {
              data.push({
                piece_id: piece.id,
                maintenance_id: createdMaintenance.id,
              });
            });
            const maintenance_piece = await maintenance_Piece.createMany({
              data: data,
            });
            const decreasePiece = await piece.updateMany({
              where: {
                id: {
                  in: piece_ids,
                },
              },
              data: {
                quantite: {
                  decrement: 1,
                },
              },
            });

            res.status(201).send(createdMaintenance);
          }
        } else {
          res.status(404).send('type maintenance not exist');
        }
      } else {
        res.status(404).send('piece not exist');
      }
    } else {
      res.status(404).send('Vehicule not exist');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//modifier un véhicule
maintenanceRouter.put('/', async (req, res) => {
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
maintenanceRouter.delete('/:id', async (req, res) => {
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
maintenanceRouter.post('/filtrer', async (req, res) => {
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

export default maintenanceRouter;
