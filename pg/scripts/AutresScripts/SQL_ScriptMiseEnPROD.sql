truncate table demande_aaq;
delete from utilisateur where uti_id not in (30);
update utilisateur set uti_id = 1 where uti_id = 30;
SELECT SETVAL('utilisateur_uti_id_seq', (SELECT MAX(uti_id) FROM utilisateur));
SELECT SETVAL('demande_aaq_dem_id_seq', 1);
