# eXfiles_stage


Du 6 mars 2023 au 30 juin 2023, j'ai effectué un stage en entreprise, afin de développer la partie back-end d'un logiciel de comptabilité déjà existant, version web.
Au cours de ce stage, j'ai pu acquérir des compétences sur SQL Server Management Studio (version 2019), et donc adapter mon code avec Node.js en utilisant principalement le paquet "mssql" pour communiquer avec la base de données.

Sur le tableau de bord, je me suis occupée d'appliquer les noms de dossier au menu déroulant de la nav bar, avec redirection à chaque changement de dossier.
Sur la page d'accueil du journal comptable (visualisation-journal-home.html), j'ai créé un menu déroulant qui charge les lots de la base de données 15 par 15. Lorsque l'utilisateur scroll et arrive au bout de la liste, les 15 suivants chargent et ainsi de suite.
Sur la page détaillée du journal, plusieurs options sont disponibles. L'utilisateur choisit un lot comptable, et peut :
  • visualiser sa page comptabilité
  • modifier un ou plusieurs groupes d'écritures
  • tout supprimer
  • exporter en fichier Excel
  • modifier les informations.

J'ai travaillé avec Node.js et Javascript. Les serveurs sont des serveurs Microsoft.
