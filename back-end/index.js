const express = require('express');
const app     = express();
var   cors    = require('cors')


const session   = require('express-session');
const pgSession = require('connect-pg-simple')(session)
const pgPool    = require('./pgpool').getPool();

var config     = require('./config');
app.locals.FCUrl = config.franceConnect.fcURL
var bodyParser = require('body-parser');
app.use(cors({
    credentials: true,
    origin: new RegExp(config.FRONT_DOMAIN.replace('.', '\\.') + "$") 
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/**
 * Session config
 * About the warning on connect.session()
 * @see {@link https://github.com/expressjs/session/issues/556}
 * @see {@link https://github.com/expressjs/session/blob/master/README.md#compatible-session-stores}
 */
app.use(session({
    store : new pgSession({
        pool     : pgPool,          // Connection pool
        tableName: 'user_sessions'  // Use another table-name than the default "session" one
    }),
    secret: config.sessionSecret,
    cookie: {
        // Session est valide 2 jours
        //maxAge  : 2 * 24 * 60 * 60 * 1000,
        // Session maintenue pour 10 heures
        maxAge  : 8 * 60 * 60 * 1000,
        domain  : config.FRONT_DOMAIN,
        secure  : false,
        httpOnly: false
    },
    saveUninitialized: false,
    resave           : true,
    proxy            : true
}));

const connexion     = require('./routes/connexion');
const interventions = require('./routes/interventions');
const listecommune  = require('./routes/listecommune');
const listedepartement  = require('./routes/listedepartement');
const listepci  = require('./routes/listepci');
const piscine  = require('./routes/piscine');
const enfant  = require('./routes/enfant');
const attestations  = require('./routes/attestations');
const structures    = require('./routes/structures');
const pdf           = require('./routes/pdf');
const user          = require('./routes/user');
const documents     = require('./routes/documents');
const parametres         = require('./routes/parametres');
const exp         = require('./routes/export');
const demandeaaq         = require('./routes/demandeaaq');
const insee     = require('./routes/insee');
const ecole     = require('./routes/ecole');
const structureref         = require('./routes/structureref');
const temoignage         = require('./routes/temoignage');
const referentiel         = require('./routes/referentiel');

// Route vers la page de connexion
app.use(config.URL_PREFIX + '/connexion', connexion);

//app.use(config.URL_PREFIX + '/interventions', interventions);
app.use(config.URL_PREFIX + '/interventions', interventions);


app.use(config.URL_PREFIX + '/listecommune', listecommune);

app.use(config.URL_PREFIX + '/listedepartement', listedepartement);

app.use(config.URL_PREFIX + '/listepci', listepci);

app.use(config.URL_PREFIX + '/piscine', piscine);

app.use(config.URL_PREFIX + '/enfant', enfant);

app.use(config.URL_PREFIX + '/attestations', attestations);

app.use(config.URL_PREFIX + '/structures', structures);

app.use(config.URL_PREFIX + '/ecole', ecole);

app.use(config.URL_PREFIX + '/documents', documents);

app.use(config.URL_PREFIX + '/insee', insee);

app.use(config.URL_PREFIX + '/pdf', pdf);

app.use(config.URL_PREFIX + '/user', user);

app.use(config.URL_PREFIX + '/demandeaaq', demandeaaq);

app.use(config.URL_PREFIX + '/structureref', structureref);

app.use(config.URL_PREFIX + '/temoignage', temoignage);

app.use(config.URL_PREFIX + '/referentiel', referentiel);


app.get(config.URL_PREFIX + '', function (req, res) {
    res.send('Bienvenue sur le backend de la Ciivise');
});

app.use(config.URL_PREFIX + '/parametres', parametres);

app.use(config.URL_PREFIX + '/export', exp);

app.listen(3001, function () {
    console.log('Example app listening on port 3001!')
})