# IL-5.11-Resume — Rapport complet et décision F

Consolidation : **2026-10-21T10:27:59+00:00**. Dernière preuve fonctionnelle : rejeu Services du **2026-10-21T10:21:20+00:00**. Cette régénération ne relance aucune suite et ne remplace pas les preuves antérieures.

**Publication alpha.3 BLOQUÉE : qualification D incomplète et E non exécutée.** Le dernier résultat Services est **17/17 PASS**, dont les quatre scénarios SMTP/DKIM ; l’essai initial 15/17 et sa cause non établie restent documentés. Le dernier contrôle D ayant clos la séquence a produit **FAILED_QUALIFICATION** ; aucun nouveau contrôle D complet ne l’a remplacé. Ce statut historique ne signifie pas que le dernier rejeu Services échoue.

## Références et provenance

| Référence | SHA / état |
| --- | --- |
| Fusion IL-5.11R, PR #12 | `077258ca3ef9c77d6d6d94f13ba190b7c0314f56` |
| Fusion documentaire, PR #13 | `729b755e49f22c220b0cd1a42f619261ba9ce260` |
| Main distant revérifié pendant cette régénération, PR #14 | **`8f297d8f676706f052a24ce4e875d91b76555b91`** |
| Correctif et tests analysés en C | `299fa3ea740f44aa76eaea52115e006464e4a345` |
| Source propre sélectionnée et testée en D | **`d19e62ba682dc2d781f5f941c7ba4b37e3a65053`** ; différence avec C documentaire seulement |
| Livraison | Branche `feat/il511-resume-final-qualification`, [PR #15](https://github.com/drumee/infra-layer/pull/15) ouverte **en brouillon**, non fusionnée |

Le [relevé GitHub de cette consolidation](evidence/IL-5.11-resume/report-github-refs.json) conserve le HEAD de PR observé avant la régénération, distinct du SHA source testé. Les commits de rapport ne changent aucun des 41 membres npm. Le clone indépendant D reste propre au SHA sélectionné. La base canonique est acquise ; **le correctif ReDoS candidat n’est pas encore intégré à main**. Aucun nouveau SHA de fusion ou SRI d’archive source fusionnée n’est revendiqué.

## Contrôles B à F

| Étape | Résultat consolidé | Ce qui reste nécessaire |
| --- | --- | --- |
| B — sécurité | **PASS**, ReDoS corrigé, faux positifs SHA256/RSA justifiés individuellement | Préserver les frontières de confiance et les preuves |
| C — GitHub Security | **PASS_WITH_VISIBILITY_LIMITATIONS**, sur source corrective exacte | Maintenir les limites d’accès et les checks réellement en échec visibles |
| D — artefact / acceptation | **INCOMPLET**, premier arrêt FAILED_QUALIFICATION ; dernier Services 17/17 | Finir les suites et acceptations manquantes, apprécier l’intermittence initiale |
| E — préparation npm | **NON EXÉCUTÉE** après arrêt D | Version/dist-tags, identité/droits npm, authentification et provenance |
| F — décision | **Publication BLOQUÉE**, objectif READY non atteint | Refaire la décision après contrôles D et E satisfaits |

## Matrice obligatoire

| Domaine | Décision | Preuve et limite |
| --- | --- | --- |
| Source canonique | **PASS pour provenance/base** | Main revérifié ; source candidate commise et propre ; correctif non fusionné |
| Sécurité PATH | **CLOSED** | 18 anciens ID CLOSED/FIXED ; aucun S4036 ouvert au relevé B ; tests adversariaux rejoués |
| ReDoS | **FIXED** | Ancien coût quadratique démontré ; partition déterministe linéaire, test million de caractères borné |
| SHA256 | **JUSTIFIED** | Empreintes de contenu/révision ; cas privé Redis contenant un credential analysé, aucun usage password verifier |
| RSA-1024 | **TEST_NEGATIVE_CONFIRMED** | Fixture négative, refus des quatre types et rotation ; aucune clé faible distribuée |
| Autres alertes | **Dispositions documentées** | Matrice individuelle des diagnostics significatifs ; aucune acceptation globale |
| CodeQL | **LIMITED** | Analyses SUCCESS ; check de résultat **FAILURE** pour RSA-1024 de test ; inventaire global HTTP 403 |
| SonarCloud | **FAILURE au relevé C** | État conservé, outil non opérationnel retenu pour IL-5 ; aucune désactivation ou clôture administrative |
| npm audit | **0 vulnérabilité connue au relevé C** | omit=dev et include=dev ; lockfile inchangé ; résultat daté |
| Tests | **Dernières suites exécutées PASS ; contrôle global incomplet** | 176 unitaires, 24 contrats, Gateway 17/17, Services 17/17 au rejeu ; autres suites manquantes |
| Acceptation réelle | **LIMITED** | Gateway et Services réels passent ; Lifecycle/Application et autres refus consommateur à terminer |
| Package reproductible | **PASS pour octets** | Deux archives identiques, 41 fichiers ; ne remplace pas test:package non exécuté |
| Provenance | **PASS source/package local** | SHA D propre et 41 empreintes ; provenance de publication/OIDC non vérifiée |
| Permissions npm | **UNVERIFIED** | E non exécutée ; aucun refus de droits npm démontré |
| Publication | **BLOQUÉE** | D non clos et E non exécutée ; aucun READY_FOR_PUBLICATION_AUTHORIZATION |

## Sécurité : conclusions et portée

Le validateur d’image Docker v1 acceptait une entrée non bornée parcourue par une regex ambiguë : environ 835 ms à 32768 caractères, limites CPU atteintes sur des cas plus longs. Une application relayant une configuration non fiable pouvait bloquer son event loop ; aucune route distante native exposant ce champ n’est démontrée. La partition déterministe corrige ce défaut sans dépendance, export ou type supplémentaire. Digests, formats historiques, codes d’erreur et refus sont testés ; les terminaisons de ligne accidentellement tolérées sont rejetées.

`digest()` conserve SHA256 pour le contenu et les révisions. Le cas Redis peut hacher un credential incorporé à un fichier privé : protections 0700/0600 et comparaison du contenu sont indispensables. Ce résultat ne sert pas de vérificateur de mot de passe. RSA-1024 reste volontairement créé pour vérifier son refus ; changer cette fixture en RSA-2048 invaliderait le test. Les trois diagnostics sont disposés dans [B](IL-5.11-resume-security-assessment.md), avec appels, mesures et tests.

Les cinq Quality candidat réussissent, runs [push 39566123710](https://github.com/drumee/infra-layer/actions/runs/39566123710) et [PR 39566453396](https://github.com/drumee/infra-layer/actions/runs/39566453396), au SHA correctif 299fa3e. [CodeQL 39566450567](https://github.com/drumee/infra-layer/actions/runs/39566450567) exécute les analyses JS/TS et Actions avec succès, mais le check de résultats 119109926219 échoue sur [l’alerte #8](https://github.com/drumee/infra-layer/security/code-scanning/8), génération RSA faible du test négatif. Faux positif technique démontré, état administratif inchangé. Ces résultats se rapportent au SHA C, pas à une prétendue nouvelle analyse de tous les commits documentaires.

Les inventaires globaux Code Scanning et Dependabot restent **HTTP 403** pour le PAT CLI de `somanos`, avec endpoints demandant respectivement `security_events=read` et `vulnerability_alerts=read`. Rôle du compte et grants du jeton restent distincts. Le connecteur donne accès aux refs/checks/PR, sans fournir tout l’inventaire Security. Aucun SARIF candidat téléchargeable n’est inventé : liste d’artefacts vide. Le Sonar main relevé compte 213 OPEN ; les 18 PATH corrigés, 13 dispositions PR #12 et autres résultats pertinents sont traités individuellement. Ces relevés restent datés ; aucun inventaire global vide ou scanner entièrement vert n’est affirmé. Voir [C](IL-5.11-resume-github-security.md).

## Tests et SMTP : résultat actuel et historique

| Contrôle D | Résultat |
| --- | --- |
| Unitaires / contrats séparés | **176/176 / 24/24 PASS** ; les 24 sont aussi inclus dans les 176 |
| Gateway réel | **17/17 PASS** |
| Services initial | **15/17**, timeout SMTP test 15 puis fetch failed test 16 ; arrêt conservé |
| Services au rejeu demandé | **17/17 PASS**, zéro échec/skip, 40,090 s, même SHA propre, aucun délai/code modifié |
| Consommateur isolé / types stricts | **8 assertions PASS**, préparation idempotente sans activation |
| Lifecycle / Application / Package | **NON EXÉCUTÉS** pour clôturer D |
| Lint du clone D / refus consommateur supplémentaires | **NON EXÉCUTÉS** ; lint C réussi distinctement |

SMTP repose sur Postfix/OpenDKIM réels, Nodemailer et capture locale, CA/SAN vérifiés, STARTTLS/SASL, refus d’open relay, signature DKIM, persistance de file et relais contrôlé. Les tests 13–16 passent au rejeu. Aucune livraison externe n’est qualifiée. La cause du premier timeout reste inconnue ; une cascade depuis la capture arrêtée est possible sans être démontrée. Le succès ultérieur ne prouve pas à lui seul une correction d’intermittence. Nettoyage des ressources possédées confirmé par les preuves des exécutions. Les 87 assertions applicatives et Lifecycle IL-5.11R restent historiques, sans substitution au candidat modifié. Voir [D et les deux logs](IL-5.11-resume-artifact-qualification.md).

## Artefact exact

| Propriété | Valeur recalculée |
| --- | --- |
| Package | `@drumee/infra-layer@0.1.0-alpha.3` |
| Source de construction | `d19e62ba682dc2d781f5f941c7ba4b37e3a65053` |
| Membres / taille compressée | **41 / 101778 octets** |
| SHA256 npm | `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e` |
| SRI npm | `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==` |
| Reproductibilité | Deux tarballs identiques, empreintes revérifiées à la régénération |
| Différences depuis IL-5.11R | `lib/validation.js`, `CHANGELOG.md`, `PROVENANCE.md` ; 38 membres identiques |

Ancien SHA256 IL-5.11R : `f2fd950e1f54634fa97b9e74ccd3ceb8dfdb15cb3e8a08c0c46489704432ac9c` ; ancien SRI : `sha512-BP1hSTOer0C7u118cixNtiJ/yOErtCFfEzQTjqZ6tP7bPTMDbXvWrJ24z8jNdKRjFRCTxjprpHxDZ5BUmWb2/Q==`. Ils ne désignent pas le nouveau candidat. Le [reçu D](evidence/IL-5.11-resume/D-artifact-receipt.json) contient la liste des 41 fichiers et leurs SHA256. Le package n’est pas approuvé pour publication ; la vérification complète test:package reste manquante. L’identité npm et celle d’une archive GitHub sont distinctes.

## Reprise nécessaire et publication

Terminer D depuis la source figée : caractériser la fiabilité du parcours SMTP, exécuter Lifecycle, Application, Package, lint et refus supplémentaires du consommateur ; conserver les vérifications réelles HTTPS/CA/SAN, loopback/refus LAN indépendant, RPC, SMTP/DKIM, ownership, rollback et reprise requises par les parcours affectés. Toute modification distribuée impose nouveau reçu et qualification adaptée. Arrêter si un défaut significatif persiste ou exige une rupture de contrat/composant externe.

Après contrôle D favorable seulement, effectuer E : existence de alpha.3, dist-tags, compte et droits serveur npm, authentification/2FA, provenance disponible, métadonnées/hooks et secrets. Les droits sont **UNVERIFIED**, pas un refus établi ; BLOCKED_RELEASE_PERMISSIONS s’appliquera si leur vérification est impossible lors de E. Le [plan E](IL-5.11-resume-release-plan.md) prépare le canal **next**, sans déplacer latest, et le téléchargement/comparaison/consommateur post-publication. Publication soumise à une décision distincte du propriétaire. La PR #15 reste en brouillon et ne sera pas fusionnée automatiquement.

## Réserves et handoff

Les limites d’inventaire HTTP 403, le check CodeQL en échec contextuel, Sonar FAILURE et la cause SMTP initiale inconnue restent explicites. Confiance dans root/opérateur/outils et fenêtres stat/exec TOCTOU conservent leurs limites documentées. Les audits sans vulnérabilité connue ne prouvent pas une absence de tout défaut.

**Aucune référence autorisable de publication n’est transférée.** Debian conserve `aa9057f224f4ae5cf80d777e3cb2fad092193fb1` ; réalignement ultérieur seulement après artefact canonique retenu et requalification des images/acceptations. OF-01R attend la distribution qualifiée. Preuves transférables avec leur SHA exact, sans démarrer Oxymotion D0. Aucune publication npm/image, tag, fusion, intervention production ou modification Debian/Server Runtime/Oxy-form.

## Dossier de preuves

[Évaluation B](IL-5.11-resume-security-assessment.md), [couverture C](IL-5.11-resume-github-security.md), [qualification D](IL-5.11-resume-artifact-qualification.md), [plan E](IL-5.11-resume-release-plan.md), [état courant](IL-5.11-resume-status.md), [snapshot consolidé](evidence/IL-5.11-resume/resume-current-status.json). L’[arrêt initial D](evidence/IL-5.11-resume/D-stop.json) reste historique ; le [reçu du rejeu](evidence/IL-5.11-resume/D-services-rerun-1.json) est la preuve du dernier Services réussi.
