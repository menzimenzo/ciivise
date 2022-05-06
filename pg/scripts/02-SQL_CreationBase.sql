/*==============================================================*/
/* Nom de SGBD :  PostgreSQL 11                                 */
/* Date de création :  15/03/2021                               */
/*==============================================================*/
drop table IF EXISTS ATTESTATION CASCADE;
drop table IF EXISTS CHECKING CASCADE;
drop index IF EXISTS IDX_CPI_CODEPOSTAL CASCADE;
drop index IF EXISTS IDX_CPI_CODEINSEE CASCADE;
drop table IF EXISTS CODEPOSTAL_INSEE CASCADE;
drop index IF EXISTS IDX_COM_DEP_NUM CASCADE;
drop table IF EXISTS COMMUNE CASCADE;
drop table IF EXISTS EPCI CASCADE;
drop table IF EXISTS IDX_EPCI_CODEINSE CASCADE;
drop index IF EXISTS DEP_REG_NUM CASCADE;
drop index IF EXISTS IDX_DEP_NUM CASCADE;
drop table IF EXISTS DEPARTEMENT CASCADE;
drop table IF EXISTS DOCUMENT CASCADE;
drop table IF EXISTS INTERVENTION CASCADE;
drop table IF EXISTS UTI_INT CASCADE;
drop table IF EXISTS PROFIL CASCADE;
drop table IF EXISTS REGION CASCADE;
drop table IF EXISTS STATUT_INTERVENTION CASCADE;
drop table IF EXISTS STATUT_UTILISATEUR CASCADE;
drop table IF EXISTS STRUCTURE CASCADE;
drop table IF EXISTS UTILISATEUR CASCADE;
drop table IF EXISTS UTI_STR CASCADE;
drop table IF EXISTS REF_EAPS CASCADE;
drop table IF EXISTS PISCINE CASCADE;
drop table IF EXISTS TYPE_PISCINE CASCADE;
drop table IF EXISTS UTI_PIS CASCADE;
drop table IF EXISTS ENFANT CASCADE;
drop table IF EXISTS INT_ENF CASCADE;
drop table IF EXISTS USER_SESSIONS CASCADE;

/*==============================================================*/
/* Table : TEMOIGNAGE                                           */
/*==============================================================*/
create table temoignage (
   ID                   SERIAL               not null,
   CODE_B               VARCHAR              not null,
   CODE_F               VARCHAR              not null,
   STATUT               INT                  not null,
   TYPOLOGIE            VARCHAR(20)          null,
   ANCIENNETE           VARCHAR(20)          null,
   constraint PK_TEMOIGNAGE primary key (ID)
);

/*==============================================================*/
/* Table : MESSAGES                                             */
/*==============================================================*/
create table messages (
   ID                   SERIAL               not null,
   TEM_ID               BIGINT               not null,
   DATE_CREATE          DATE                 not null,
   CONTENT              TEXT                 not null,
   IV                   BYTEA                not null,
   SENTBYADMIN          BOOLEAN              not null,
   constraint PK_MESSAGES primary key (ID)
);

/*==============================================================*/
/* Table : EVENTS                                                */
/*==============================================================*/
create table events (
   ID                   SERIAL               not null,
   DATE_CREATE          TEXT                 not null,
   USER_ID              INT                  not null,
   LIBELLE              TEXT                 not null,
   OBJET                JSON                not null,
   constraint PK_EVENTS primary key (ID)
);

/*==============================================================*/
/* Table : STATUT                                               */
/*==============================================================*/
create table STATUT (
   ID                   INT                  not null,
   LIBELLE              VARCHAR(10)          not null,
   constraint PK_STATUT primary key (ID)
);


/*==============================================================*/
/* Table : ATTESTATION                                          */
/*==============================================================*/
create table ATTESTATION (
   ATT_ID               SERIAL               not null,
   INT_ID               BIGINT               null,
   ATT_DATECREATION     DATE                 not null,
   ATT_NOMBRE           INT                  not null,
   ATT_SEQUENCEDEBUT    BIGINT               not null,
   ATT_SEQUENCEFIN      BIGINT               not null,
   constraint PK_ATTESTATION primary key (ATT_ID)
);

/*==============================================================*/
/* Table : CHECKING                                             */
/*==============================================================*/
create table CHECKING (
   CHK_ID               SERIAL               not null,
   CHK_DOCUMENT         BYTEA                null,
   CHK_DATE             DATE                 null,
   constraint PK_CHECKING primary key (CHK_ID)
);

/*==============================================================*/
/* Table : CODEPOSTAL_INSEE                                     */
/*==============================================================*/
create table CODEPOSTAL_INSEE (
   CPI_CODEINSEE        VARCHAR(5)           not null,
   CPI_CODEPOSTAL       VARCHAR(5)           not null
);

/*==============================================================*/
/* Table : COMMUNE                                              */
/*==============================================================*/
create table COMMUNE (
   COM_ID               BIGINT               not null,
   CPI_CODEINSEE        VARCHAR(5)           null,
   COM_ARTMAJ           VARCHAR(10)          null,
   COM_LIBELLEMAJ       VARCHAR(50)          null,
   COM_ART              VARCHAR(10)          null,
   COM_LIBELLE          VARCHAR(50)          null,
   DEP_NUM              VARCHAR(3)           null,
   constraint PK_COMMUNE primary key (COM_ID)
);


/*==============================================================*/
/* Table : EPCI                                              */
/*==============================================================*/
create table EPCI (
   EPCI_ID               BIGINT               not null,
   COM_CODEINSEE        VARCHAR(5)           null,
   EPCI_CODE           VARCHAR(9)          null,
   EPCI_LIBELLE       VARCHAR(90)          null,
   EPCI_DEP             VARCHAR(3)          null,
   EPCI_REG          VARCHAR(2)          null,
      constraint PK_EPCI primary key (EPCI_ID)
);

/*==============================================================*/
/* Table : DEPARTEMENT                                          */
/*==============================================================*/
create table DEPARTEMENT (
   DEP_ID               BIGINT               not null,
   DEP_LIBELLE          VARCHAR(50)          not null,
   DEP_NUM              VARCHAR(3)           not null,
   REG_NUM              VARCHAR(3)           null,
   constraint PK_DEPARTEMENT primary key (DEP_ID)
);

/*==============================================================*/
/* Table : DOCUMENT                                             */
/*==============================================================*/
create table DOCUMENT (
   DOC_ID               SERIAL               not null,
   DOC_TYPE             VARCHAR(20)          not null,
   DOC_LIBELLE          VARCHAR(50)          not null,
   DOC_FILENAME         VARCHAR(50)          not null,
   DOC_CONTENU          BYTEA                null,
   constraint PK_DOCUMENT primary key (DOC_ID)
);

/*==============================================================*/
/* Table : INTERVENTION                                         */
/*==============================================================*/
create table INTERVENTION (
   INT_ID               SERIAL               not null,
   PIS_ID               BIGINT               not null,
   STR_ID               BIGINT               not null,
   INT_NOMBREENFANT     INT                  not null,
   INT_DATEDEBUTINTERVENTION DATE            not null,
   INT_DATEFININTERVENTION DATE              not null,
   INT_NBSESSION        BIGINT               not null,
   INT_CAI              BIGINT               not null,
   INT_AGE              BIGINT               null,
   INT_DATECREATION     timestamp            not null,
   INT_DATEMAJ          timestamp            null,
   INT_COMMENTAIRE      TEXT                 null,
   constraint PK_INTERVENTION primary key (INT_ID)
);

/*==============================================================*/
/* Table : UTI_INT                                              */
/*==============================================================*/
create table UTI_INT (
   INT_ID               SERIAL               not null,
   UTI_ID               BIGINT               not null
);

/*==============================================================*/
/* Table : PROFIL                                         */
/*==============================================================*/
create table PROFIL (
   ROL_ID               BIGINT               not null,
   ROL_LIBELLE          VARCHAR(50)          not null,
   ROL_ORDRE            INT                  not null,
   constraint PK_ROLE primary key (ROL_ID)
);

/*==============================================================*/
/* Table : REGION                                               */
/*==============================================================*/
create table REGION (
   REG_ID               BIGINT               not null,
   REG_LIBELLE          VARCHAR(50)          not null,
   REG_NUM              VARCHAR(3)           null,
   constraint PK_REGION primary key (REG_ID)
);

/*==============================================================*/
/* Table : STATUT_UTILISATEUR                                   */
/*==============================================================*/
create table STATUT_UTILISATEUR (
   STU_ID               BIGINT               not null,
   STU_LIBELLE          VARCHAR(50)          not null,
   constraint PK_STATUT_UTILISATEUR primary key (STU_ID)
);

/*==============================================================*/
/* Table : STRUCTURE                                            */
/*==============================================================*/
create table STRUCTURE (
   STR_ID               SERIAL               not null,
   STR_SIRET            BIGINT               null,
   STR_LIBELLE          VARCHAR(150)         not null,
   STR_ADRESSE          VARCHAR(150)         not null,
   STR_COMMUNE          VARCHAR(5)         not null,
   STR_ACTIF            BOOLEAN              not null,
   constraint PK_STRUCTURE primary key (STR_ID)
);


/*==============================================================*/
/* Table : UTILISATEUR                                          */
/*==============================================================*/
create table UTILISATEUR (
   UTI_ID               SERIAL               not null,
   ROL_ID               BIGINT               not null,
   STU_ID               BIGINT               not null,
   UTI_VALIDATED        BOOLEAN              default false,
   PWD_VALIDATED        BOOLEAN              default false,
   UTI_MAIL             VARCHAR(50)          not null,
   UTI_PWD              VARCHAR(255)         null,
   UTI_NOM              VARCHAR(50)          null,
   UTI_PRENOM           VARCHAR(50)          null,
   UTI_AUTHID           VARCHAR(100)         null,
   UTI_TOCKENFRANCECONNECT VARCHAR(100)      null,
   UTI_EAPS             VARCHAR(15)   	      null,
   UTI_PUBLICONTACT     BOOLEAN              default false,
   UTI_MAILCONTACT      VARCHAR(50)          null,
   UTI_SITEWEBCONTACT   VARCHAR(500)          null,
   UTI_ADRCONTACT       VARCHAR(100)          null,
   UTI_COMPADRCONTACT   VARCHAR(100)          null,
   UTI_COM_CP_CONTACT       VARCHAR(5)       null,
   UTI_COM_CODEINSEECONTACT VARCHAR(5)       null,
   UTI_TELEPHONECONTACT VARCHAR(50)          null,
   constraint PK_UTILISATEUR primary key (UTI_ID)
);

/*==============================================================*/
/* Table : UTI_STR                                              */
/*==============================================================*/
create table UTI_STR (
   UTI_ID               BIGINT               not null,
   STR_ID               BIGINT               not null
);

/*==============================================================*/
/* Table : UTI_PIS                                              */
/*==============================================================*/
create table UTI_PIS (
   UTI_ID               BIGINT               not null,
   PIS_ID               BIGINT               not null,
   constraint PK_UTI_PIS primary key (uti_id,pis_id)
);

/*==============================================================*/
/* Table : REF_EAPS                                             */
/*==============================================================*/
create table REF_EAPS        (
   EAP_NUMERO           VARCHAR(12)               not null,
   EAP_DATEMAJ          timestamp            not null,
   constraint PK_EAP_NUMERO primary key (EAP_NUMERO)
);


/*==============================================================*/
/* Table : PISCINE                                              */
/*==============================================================*/
create table PISCINE (
   PIS_ID               SERIAL               not null,
   PIS_DATAES           VARCHAR(50)          null,               -- id DATAES
   PIS_NOM              VARCHAR(50)          null,
   PIS_X                VARCHAR(50)          null,
   PIS_Y                VARCHAR(50)          null,
   TYP_ID               BIGINT               not null,
   PIS_CP               BIGINT               not null,
   PIS_ADR              VARCHAR(50)          not null,
   constraint PK_PISCINE primary key (PIS_ID)
);

/*==============================================================*/
/* Table : TYPE_PISCINE                                         */
/*==============================================================*/
create table TYPE_PISCINE (
   TYP_ID               SERIAL               not null,
   TYP_LIBELLE          VARCHAR(50)          not null,
   constraint PK_TYPE_PISCINE primary key (TYP_ID)
);


/*==============================================================*/
/* Table : ENFANT                                               */
/*==============================================================*/
create table ENFANT (
   ENF_ID               SERIAL               not null,
   ENF_PRENOM           VARCHAR(50)          null,               
   ENF_NOM              VARCHAR(50)          null,
   constraint PK_ENF primary key (ENF_ID)
);

/*==============================================================*/
/* Table : INT_ENF                                              */
/*==============================================================*/
create table INT_ENF (
   ENF_ID               BIGINT               not null,
   INT_ID               BIGINT               not null,
   NIV_INI              BIGINT               null,
   NIV_FIN              BIGINT               null,
   constraint PK_INT_ENF primary key (enf_id,int_id)
);

/*==============================================================*/
/* Table : DEMANDE_AAQ                                          */
/* Table permettant à un MN de faire une demande auprès d'un    */
/* Formateur pour devenir MN AAQ                                */
/*==============================================================*/
create table DEMANDE_AAQ (
   DEM_ID                      SERIAL               not null,
   DEM_UTI_DEMANDEUR_ID        BIGINT               not null,
   DEM_UTI_FORMATEUR_ID        BIGINT               not null,
   DEM_TOCKENDEMANDEACCORD     VARCHAR(100)          null,
   DEM_TOCKENDEMANDEREFUS      VARCHAR(100)          null,
   DEM_DATEDEMANDE             DATE               not null,
   DEM_DATERELANCE             DATE               null,
   DEM_NBRELANCE               INT                    default 0,
   DEM_DATEACCORD              DATE               null,
   DEM_DATEREFUS               DATE               null,
   DEM_MOTIFREFUS              TEXT                  null,
   DEM_DMS_ID                  BIGINT            not null,  -- Statut de la demande
   constraint PK_DEMANDE_AAQ primary key (DEM_ID)
);

/*==============================================================*/
/* Table : DEMANDE_STATUT                                       */
/* Statut de la demande pour le formateur de la part du MN      */
/* Pour devenir MN AAQ à la place du MN                         */
/*==============================================================*/
create table DEMANDE_STATUT (
   DMS_ID                      BIGINT               not null,
   DMS_LIBELLE                 VARCHAR(50)          not null
);

/*==============================================================*/
/* Table : user_sessions                                        */
/* Stockage des sessions des utilisateurs                       */
/*==============================================================*/
CREATE TABLE USER_SESSIONS (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE USER_SESSIONS ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

alter table ATTESTATION
   add constraint FK_ATTESTAT_REFERENCE_INTERVEN foreign key (INT_ID)
      references INTERVENTION (INT_ID)
      on delete restrict on update restrict;

alter table UTI_INT
   add constraint FK_INTERVEN_REFERENCE_UTILISAT foreign key (UTI_ID)
      references UTILISATEUR (UTI_ID)
      on delete restrict on update restrict;

alter table UTI_INT  
  add constraint FK_INTERVEN_REFERENCE_INTERVENTION foreign key (INT_ID)
      references INTERVENTION (INT_ID)
      on delete CASCADE ;

alter table INT_ENF 
  add constraint FK_INTERVEN_REFERENCE_ENFANT foreign key (INT_ID)
      references INTERVENTION (INT_ID)
      on delete CASCADE ;
/*
alter table UTILISATEUR
   add constraint FK_UTILISAT_REFERENCE_PROFIL foreign key (ROL_ID)
      references PROFIL (ROL_ID)
      on delete restrict on update restrict;
*/
alter table UTILISATEUR
   add constraint FK_UTILISAT_REFERENCE_STATUT_U foreign key (STU_ID)
      references STATUT_UTILISATEUR (STU_ID)
      on delete restrict on update restrict;

/*==============================================================*/
/* Index : IDX_DEP_NUM                                          */
/*==============================================================*/
create  index IDX_DEP_NUM on DEPARTEMENT (
DEP_NUM
);

/*==============================================================*/
/* Index : DEP_REG_NUM                                          */
/*==============================================================*/
create  index DEP_REG_NUM on DEPARTEMENT (
REG_NUM
);

/*==============================================================*/
/* Index : IDX_EPCI_CODEINSE                                    */
/*==============================================================*/
create  index IDX_EPCI_CODEINSEE on EPCI (
COM_CODEINSEE
);

/*==============================================================*/
/* Index : IDX_COM_DEP_NUM                                      */
/*==============================================================*/
create  index IDX_COM_DEP_NUM on COMMUNE (
DEP_NUM
);

/*==============================================================*/
/* Index : IDX_CPI_CODEINSEE                                    */
/*==============================================================*/
create  index IDX_CPI_CODEINSEE on CODEPOSTAL_INSEE (
CPI_CODEINSEE
);

/*==============================================================*/
/* Index : IDX_CPI_CODEPOSTAL                                   */
/*==============================================================*/
create  index IDX_CPI_CODEPOSTAL on CODEPOSTAL_INSEE (
CPI_CODEPOSTAL
);

/* Enable Encryption */
/*CREATE EXTENSION pgcrypto;*/
