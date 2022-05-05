-- Début de la procédure de déploiement automatisé : 
-- Création de la version
DO $$
BEGIN 
   call AAQ_CreerVersion('1.1.6');
END
$$ language plpgsql;

-- Mise à jour du schéma de base de données
DO $$
DECLARE
	FaireMAJSchema BOOLEAN;
BEGIN 
	SELECT AAQ_DeployerVersion('1.1.6','schema') INTO FaireMAJSchema;
	IF FaireMAJSchema THEN
      -- Ajout colonnes table piscine
      alter table PISCINE ADD COLUMN temporaire BOOLEAN;
      alter table PISCINE ADD COLUMN datefin timestamp without time zone ;
	  alter table DEMANDE_AAQ ADD DEM_DATEFORMATION DATE;
	  alter table DEMANDE_AAQ ADD DEM_INSEEFORMATION VARCHAR(5);

      -- Déploiement du Schéma effectué
      call AAQ_VersionDeployee('1.1.6','schema');
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
	SELECT AAQ_DeployerVersion('1.1.6','data') INTO FaireMAJData;
	IF FaireMAJData THEN
      -- Mise à false du flag temporaire pour les piscines existantes
    	UPDATE PISCINE set temporaire = false;

      -- Déploiement du Schéma effectué
      call AAQ_VersionDeployee('1.1.6','data');
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
	SELECT AAQ_DeployerVersion('1.1.6','droit') INTO FaireMAJDroit;
	IF FaireMAJDroit THEN
      CALL AAQ_AjouteDroitsObjets();
		raise notice '%','Mise à jour des droits';
	ELSE
		raise notice '%','Pas de mise à jour des droits à faire';
	END IF;
END
$$ language plpgsql;