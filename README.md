# SamaCollect

Collecte, analyse et partage de données de recherche au Sénégal.
Site : https://kurambisaan.github.io/samacollect/

## Fonctions
- Création de questionnaires (questions conditionnelles, contrôles de cohérence, codes de variables)
- Collecte hors ligne sur téléphone : les réponses (photos comprises) sont gardées sur l'appareil et envoyées au retour du réseau
- Partage par lien, WhatsApp ou QR code, sans compte pour les répondants
- Analyse immédiate, contrôle qualité des fiches, export CSV (R, SPSS, Excel)
- Données ouvertes sous licence CC BY 4.0, sans les données personnelles
- YAAKOBIND? : détecteur de style automatique, exécuté dans le navigateur

## Fonctionnement
- Site statique (GitHub Pages) + base Supabase (hébergée à Francfort)
- Aucun appel à un service d'intelligence artificielle
- `config.js` contient la clé *publishable* Supabase : elle est publique par conception, la protection des données repose sur les règles RLS de la base

## Fichiers
| Fichier | Rôle |
|---|---|
| `index.html` | page unique de l'application |
| `app.js` | application principale |
| `extras.js` | confidentialité, administration, détecteur IA |
| `import.js` | import de questionnaires |
| `sw.js` | fonctionnement hors ligne |
| `config.js` | adresse et clé publique Supabase |

## Contact
kurambisaan@gmail.com
