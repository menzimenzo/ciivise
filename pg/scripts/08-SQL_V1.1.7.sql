
-- Début de la procédure de déploiement automatisé : 
-- Création de la version
DO $$
BEGIN 
   call AAQ_CreerVersion('1.1.7');
END
$$ language plpgsql;

-- Mise à jour du schéma de base de données
DO $$
DECLARE
	FaireMAJSchema BOOLEAN;
BEGIN 
	SELECT AAQ_DeployerVersion('1.1.7','schema') INTO FaireMAJSchema;
	IF FaireMAJSchema THEN
        ALTER table demande_aaq rename dem_dateformation to dem_datedebutformation;
        ALTER table demande_aaq add column dem_datefinformation date;

        CREATE TABLE IF NOT EXISTS log_suppression (
            user_id INTEGER,
            date_operation TIMESTAMP,
            target_object_type VARCHAR(20),
            target_object_id INTEGER,
            target_object_info TEXT,
            message TEXT
        );

        -- Déploiement du Schéma effectué
        call AAQ_VersionDeployee('1.1.7','schema');
		raise notice '%','Mise à jour du schéma effectué';
	ELSE
		raise notice '%','Pas de mise à jour schéma à faire';
	END IF;
END
$$ language plpgsql;


-- Mise à jour des données
DO $$
DECLARE
	FaireMAJData BOOLEAN;
BEGIN 
	SELECT AAQ_DeployerVersion('1.1.7','data') INTO FaireMAJData;
	IF FaireMAJData THEN
        -- Ajout d'un paramètre pour l'activation désactivation du bouton france connect
        INSERT INTO PARAMETRES VALUES (4,'TUTOINSCRIPTION','Lien vers tutotiel Inscription','https://vimeo.com/656042329?embedded=true&source=vimeo_logo&owner=97694283');
        -- Déploiement du Schéma effectué
        call AAQ_VersionDeployee('1.1.7','data');
	   raise notice '%','Mise à jour des datas effectué';
	ELSE
		raise notice '%','Pas de mise à jour de datas à faire';
	END IF;
END
$$ language plpgsql;

DO $$
DECLARE
	FaireMAJDroit BOOLEAN;
BEGIN 
	SELECT AAQ_DeployerVersion('1.1.7','droit') INTO FaireMAJDroit;
	IF FaireMAJDroit THEN
      CALL AAQ_AjouteDroitsObjets();
		raise notice '%','Mise à jour des droits';
	ELSE
		raise notice '%','Pas de mise à jour des droits à faire';
	END IF;
END
$$ language plpgsql;

