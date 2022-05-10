import express from 'express';
import Prisma from '@prisma/client';

const { PrismaClient } = Prisma;

const fournisseurRouter = express.Router();
const { fournisseur } = new PrismaClient();

//tout les fournisseurs
fournisseurRouter.get('/', async(req, res) => {
    try {
        const fournisseurs = await fournisseur.findMany();
        res.status(200).send(fournisseurs);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// un seul fournisseur

fournisseurRouter.get('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const result = await fournisseur.findUnique({
            where: {
                id: Number(id),
            },
        });
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Ajouter un fournisseur
fournisseurRouter.post('/', async(req, res) => {
    try {
        const { nom, prenom, nom_entreprise, numero_tel, adresse, description } =
        req.body;
        const createdFournisseur = await fournisseur.create({
            data: {
                nom,
                prenom,
                nom_entreprise,
                numero_tel,
                adresse,
                description,
            },
        });
        res.status(201).send(createdFournisseur);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//modifier un véhicule
fournisseurRouter.put('/:id', async(req, res) => {

    const { id } = req.params;

    try {
        const {

            nom,
            prenom,
            nom_entreprise,
            numero_tel,
            adresse,
            description,
        } = req.body;
        const fournisseurExist = await fournisseur.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (fournisseurExist) {
            const updatedFournisseur = await fournisseur.update({
                where: {
                    id: Number(id),

                },
                data: {
                    nom,
                    prenom,
                    nom_entreprise,
                    numero_tel,
                    adresse,
                    description,
                },
            });
            res.status(200).send(updatedFournisseur);
        } else {
            res.status(404).send('Fournisseur not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//supprimer un fournisseur
fournisseurRouter.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const fournisseurExist = await fournisseur.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (fournisseurExist) {
            const deletedFournisseur = await fournisseur.delete({
                where: {
                    id: Number(id),
                },
            });
            res.status(200).send('Fournisseur deleted');
        } else {
            res.status(404).send('Fournisseur not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//filtrer les fournisseurs
fournisseurRouter.post('/filtrer', async(req, res) => {
    try {
        const data = req.body;
        const filtredFournisseurs = await fournisseur.findMany({
            where: data,
        });
        res.status(200).send(filtredFournisseurs);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default fournisseurRouter;