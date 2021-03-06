import express from 'express';
import assuranceRouter from './routers/assurance_router.js';
import fournisseurRouter from './routers/fournisseur_router.js';
import maintenanceRouter from './routers/maintenance_router.js';
import mecanicienRouter from './routers/mecanicien_router.js';
import pieceRouter from './routers/piece_router.js';
import typeMaintenanceRouter from './routers/type_maintenance_router.js';
import userRouter from './routers/user_router.js';
import vehiculeRouter from './routers/vehicule_router.js';
import notificationRouter from './routers/notification_router.js';

const app = express();
import cors from 'cors';
import maintenanceVehiculeRouter from './routers/maintenance_vehicule_router.js';

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});
app.use(cors())


app.use('/api/vehicule', vehiculeRouter);
app.use('/api/fournisseur', fournisseurRouter);
app.use('/api/piece', pieceRouter);
app.use('/api/mecanicien', mecanicienRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/maintenancetype', typeMaintenanceRouter);
app.use('/api/assurance', assuranceRouter);
app.use('/api/user', userRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/maintenances_vehicule', maintenanceVehiculeRouter);


app.listen(5000, () => {
    console.log('listening at port 5000...');
});