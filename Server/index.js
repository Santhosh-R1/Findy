require('dotenv').config(); 
if (process.env.NODE_EXTRA_CA_CERTS) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'; 
  console.log('Using custom CA certificate...');
}
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT ;

const userRoutes = require('./routes/userRoutes');
const OrganisationRoutes = require('./routes/organaisationRoute'); 
const adminRoutes = require('./routes/adminRoute');
const contactRoute = require('./routes/contact');
const moderatorRoutes = require('./routes/moderatorroute');
const itemRoutes = require('./routes/itemroute');
const chatRoutes = require('./routes/chatroute');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
const Database = require('./DataBase'); 

app.use('/api/users', userRoutes);
app.use('/api/organaisation', OrganisationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoute);
app.use('/api/moderator', moderatorRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/chat', chatRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});