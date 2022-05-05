-- Début de la procédure de déploiement automatisé : 
-- Création de la version
DO $$
BEGIN 
   call AAQ_CreerVersion('1.1.4');
END
$$ language plpgsql;

-- Mise à jour du schéma de base de données
DO $$
DECLARE
	FaireMAJSchema BOOLEAN;
BEGIN 
	SELECT AAQ_DeployerVersion('1.1.4','schema') INTO FaireMAJSchema;
	IF FaireMAJSchema THEN

		-- Ajout de l'information pour la carto sur le fait de donner ou pas des leçons particulières
		ALTER TABLE UTILISATEUR ADD COLUMN uti_donneleconsparticulieres BOOLEAN  default false;
		-- Déploiement du Schéma effectué
		call AAQ_VersionDeployee('1.1.4','schema');
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
	SELECT AAQ_DeployerVersion('1.1.4','data') INTO FaireMAJData;
	IF FaireMAJData THEN
     
	    -- Ajout d'un paramètre pour l'activation désactivation du bouton france connect
	    INSERT INTO PARAMETRES VALUES (3,'AFFICHE_INTER','Active ou désactive l''affichage des interventions (0/1)',1);

        -- Déploiement du Schéma effectué
        call AAQ_VersionDeployee('1.1.4','data');
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
	SELECT AAQ_DeployerVersion('1.1.4','droit') INTO FaireMAJDroit;
	IF FaireMAJDroit THEN
      CALL AAQ_AjouteDroitsObjets();
		raise notice '%','Mise à jour des droits';
	ELSE
		raise notice '%','Pas de mise à jour des droits à faire';
	END IF;
END
$$ language plpgsql;