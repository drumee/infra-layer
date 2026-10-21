# IL-5.11-Resume — Qualification d’artefact D consolidée

Mise à jour : 2026-10-21T13:05:52+00:00.

**D_QUALIFIED_WITH_RESIDUAL_UNCERTAINTY**, après IL-5.11-D2. Tous les tests D requis ont été exécutés et réussissent ; la cause du premier timeout SMTP reste inconnue et nécessite une décision explicite du propriétaire avant publication. Le statut historique FAILED_QUALIFICATION et ses deux essais restent conservés, sans prétendre que le défaut initial est corrigé.

Le [rapport D2 complet](IL-5.11-D2-qualification.md) fait foi pour le contrôle actuel : source exacte, onze commandes, acceptation réelle, consommateur, package et limites Security.

| Contrôle actuel | Résultat |
| --- | --- |
| Source clone propre | `dbc0be5c20029374c68bdf510dfadd7da079fcf6` ; 41 membres npm identiques à d19e62b |
| Unitaires / contrats séparés | **176/176 / 24/24**, les 24 sont inclus dans les 176 |
| Gateway / Services / Lifecycle | **17/17 / 17/17 / 16/16**, zéro échec/skip |
| Application réelle | **87 assertions / 11 groupes PASS** |
| Package / lint | **PASS** ; lint 0 erreur, 29 avertissements historiques, 0 nouveau |
| Audits omit=dev / include=dev | **0 vulnérabilité connue** dans les deux relevés |
| Consommateur isolé | Préparation/types stricts, 8 assertions initiales + **37 supplémentaires**, PASS |
| Reproductibilité | **Deux tarballs identiques**, 41 membres, 101778 octets |
| SMTP | Campagne bornée 3 × 17/17 puis qualification 17/17 ; **INTERMITTENCE_NOT_REPRODUCED** |

SHA256 npm : `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`. SRI npm : `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`. [Reçu D2 et liste des 41 fichiers](evidence/IL-5.11-D2/D2-artifact-receipt.json). Empreintes identiques au candidat D précédent, distinctes d’IL-5.11R et d’une archive GitHub. Aucun code distribué changé dans D2.

L’acceptation réelle couvre Nginx hôte HTTPS/CA/SAN, RPC accepté/refusé, loopback/refus LAN indépendant, cycle de vie, interruption/reprise, rollback, restauration sans SMTP, ownership, SMTP/DKIM, STARTTLS/SASL et absence de ports SMTP publics. Récupération SMTP refusée avec SMTP_RECOVERY_UNQUALIFIED, délivrabilité Internet non testée. Les outils restent soumis aux vérifications IL-5.11R. [Rapport applicatif](evidence/IL-5.11-D2/D2-application-report.json).

## Historique préservé

Source initiale `d19e62ba682dc2d781f5f941c7ba4b37e3a65053` : unitaires/contrats/Gateway réussis, premier Services **15/17**, ETIMEDOUT avant greeting au test 15 et fetch failed au test 16 ; arrêt immédiat de D. [Arrêt historique](evidence/IL-5.11-resume/D-stop.json), [log](evidence/IL-5.11-resume/D-services-failed.txt), [intégrité réversible](evidence/IL-5.11-resume/D-log-integrity.json).

Rejeu explicitement demandé : **17/17**, mêmes octets et délais. [Log](evidence/IL-5.11-resume/D-services-rerun-1.txt), [reçu](evidence/IL-5.11-resume/D-services-rerun-1.json). Ce succès n’avait pas clos D. D2 ajoute l’audit, une campagne bornée fixée à l’avance et les suites manquantes. [Analyse de l’incident](IL-5.11-D2-smtp-incident-analysis.md).

CodeQL reste administrativement FAILURE sur la fixture négative RSA, Sonar FAILURE, inventaires HTTP 403 : voir [C](IL-5.11-resume-github-security.md). La réserve SMTP est argumentée sans acceptation implicite ; la décision de publication reste distincte et dépend aussi de E/F.
