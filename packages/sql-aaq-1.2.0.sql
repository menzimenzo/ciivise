-- Début de la procédure de déploiement automatisé : 
-- Création de la version
DO $$
BEGIN 
   call AAQ_CreerVersion('1.2.0');
END
$$ language plpgsql;

-- Mise à jour du schéma de base de données
DO $$
DECLARE
	FaireMAJSchema BOOLEAN;
BEGIN 
	SELECT AAQ_DeployerVersion('1.2.0','schema') INTO FaireMAJSchema;
	IF FaireMAJSchema THEN
        CREATE TABLE IF NOT EXISTS piscine_privee (
            pis_id INTEGER REFERENCES piscine ON DELETE CASCADE,
            pp_date_operation TIMESTAMP,
            pp_mail VARCHAR(40),
			pp_bassins INTEGER,
            pp_telephone VARCHAR(12),
			pp_siteweb VARCHAR(50),
			pp_ouverture_annuelle BOOLEAN,
			pp_date_ouverture VARCHAR(100),
			pp_profondeur VARCHAR(50),
			pp_dimension VARCHAR(50),
			pp_type VARCHAR(12),
			pp_chauffage BOOLEAN,
			pp_vestiaire BOOLEAN,
			pp_toilettes BOOLEAN,
			pp_salles BOOLEAN,
			pp_parking BOOLEAN
        );

		ALTER table piscine ADD COLUMN piscine_privee BOOLEAN;
		ALTER table piscine ADD COLUMN export BOOLEAN;

		-- Ajout du profil Proprietaire
		INSERT INTO PROFIL (rol_id, rol_libelle, rol_ordre) VALUES (7, 'Professionnel de l''hébergement', 7);
		-- Ajout de traees sur les utilisateurs et leur profil
		ALTER table intervention ADD COLUMN uti_createur_id bigint;
		ALTER table intervention ADD COLUMN rol_createur_id integer;
		ALTER table uti_int ADD COLUMN rol_initial_id integer;

		-- 20220111_document_profil_link
		CREATE TABLE IF NOT EXISTS document_profil_link (
			doc_id INTEGER,
			rol_id BIGINT,
			CONSTRAINT fk_doc FOREIGN KEY(doc_id) REFERENCES document(doc_id) ON DELETE CASCADE,
			CONSTRAINT rol_id FOREIGN KEY(rol_id) REFERENCES profil(rol_id)
		);

        -- Déploiement du Schéma effectué
        call AAQ_VersionDeployee('1.2.0','schema');
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
	SELECT AAQ_DeployerVersion('1.2.0','data') INTO FaireMAJData;
	IF FaireMAJData THEN

		UPDATE piscine set piscine_privee = FALSE;
		UPDATE piscine set export = TRUE;

		-- Ajout du parametre de délais sur les interventions
		INSERT INTO parametres (par_id,par_code,par_description,par_valeur) VALUES(5,'NBJOURAVANT','Nombre de jours pré-saisie intervention possible','-6');
		INSERT INTO parametres (par_id,par_code,par_description,par_valeur) VALUES(6,'NBJOURAPRES','Nombre de jours modification à posteriori intervention possible','90');
	    -- Ajout d'un paramètre pour l'activation désactivation de la possibilité de saisie d'intervention pour les MNS sans avoir la valance AAQ
	    INSERT INTO PARAMETRES (par_id,par_code,par_description,par_valeur) VALUES (7,'AUT_INTER_MNS','Autorise ou non la saisie d''intervention pour les MNS (0/1)',0);
		

        call AAQ_VersionDeployee('1.2.0','data');
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
	SELECT AAQ_DeployerVersion('1.2.0','droit') INTO FaireMAJDroit;
	IF FaireMAJDroit THEN
      CALL AAQ_AjouteDroitsObjets();
		raise notice '%','Mise à jour des droits';
	ELSE
		raise notice '%','Pas de mise à jour des droits à faire';
	END IF;
END
$$ language plpgsql;

