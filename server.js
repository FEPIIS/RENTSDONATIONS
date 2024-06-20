if (process.env.NODE_ENV === 'development'){
    require('dotenv').config();
}

// Importa los módulos necesarios
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./src/database/config'); 
const bodyParser = require('body-parser');
const routerCustomer = require('./src/customer/customerRoutes');
const routerRent = require('./src/rent/rentRouter') 
const routerItem = require('./src/item/itemRouter') 
const donorRouter = require('./src/donor/donorRouter')
const donationRouter = require('./src/donation/donationRouter')
const routerCategory = require('./src/category/categoryRoutes');

// Configuración de middlewares
const app = express();
app.use(bodyParser.json()); // Parsea las solicitudes JSON
app.use(morgan('dev'));
app.use(cors()); // Habilita CORS para permitir solicitudes desde cualquier origen
connectDB(); // Conecta con la base de datos

// Puerto del servidor obtenido desde las variables de entorno o por defecto 3000
const PORT = process.env.PORT || 10000;

// Ruta raíz
app.get('/', (req, res) => {
    res.send('¡Bienvenido a mi microservicio de alquileres y donaciones!');
});

// Rutas para cada recurso
app.use('/fepi', donorRouter);
app.use('/fepi', donationRouter);
app.use('/fepi', routerCustomer);
app.use('/fepi', routerRent);
app.use('/fepi', routerItem);
app.use('/fepi', routerCategory);

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express en funcionamiento en el puerto ${PORT}`);
});