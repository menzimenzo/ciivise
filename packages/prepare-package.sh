#!/bin/bash

# Shell de préparation du package de déploiement pour livraison
echo "Pensez à changer le numéro de version dans les fichiers package.json du frontend ET backend et la version dans le fichier footer.vue du front-end/components"

cp -r ../front-end ./
#rm -r ./front-end/node_modules
rm ./front-end/pm2.integ.json

cp -r ../back-end ./
#rm -r ./back-end/node_modules
rm ./back-end/pm2.integ.json

cp -r ../mail-server ./
#rm -r ./mail-server/node_modules
rm ./mail-server/pm2.integ.json

tar -zcvf aaq-1.2.0.tar.gz  front-end back-end mail-server

rm -r ./front-end
rm -r ./back-end
rm -r ./mail-server

