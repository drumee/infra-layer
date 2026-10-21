# IL-5.11-Resume — Décision finale F

Date : 2026-10-21T10:10:02+00:00.

**FAILED_QUALIFICATION — publication alpha.3 BLOQUÉE.** L’évaluation B a corrigé le ReDoS et caractérisé les faux positifs, C qualifie sa couverture avec limites. D rencontre deux échecs SMTP nécessaires ; arrêt sans poursuite des contrôles E. Aucun succès historique n’est substitué à cet échec.

## Références

- Main distant observé au démarrage : **`8f297d8f676706f052a24ce4e875d91b76555b91`** ; PR #12 `077258ca3ef9c77d6d6d94f13ba190b7c0314f56` et PR #13 `729b755e49f22c220b0cd1a42f619261ba9ce260` sont des ancêtres acquis.
- Branche : `feat/il511-resume-final-qualification`, [PR #15](https://github.com/drumee/infra-layer/pull/15), non fusionnée. Ancienne branche documentaire #14 non réutilisée.
- Source corrective CodeQL : `299fa3ea740f44aa76eaea52115e006464e4a345`. Source clone propre sélectionnée pour D : **`d19e62ba682dc2d781f5f941c7ba4b37e3a65053`** ; différence seulement documentaire. Les commits finaux de rapport ne changent aucun membre distribué.
- Nouveau candidat local : **41 membres / 101778 octets**, SHA256 **`c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`**, SRI **`sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`**. Ancien SHA256 f2fd950e… devenu historique ; ne pas publier ce nouveau candidat défaillant ni le substituer sous l’ancien reçu.

## Matrice obligatoire

| Domaine | Décision | Preuve et limite |
| --- | --- | --- |
| Source canonique | **PASS pour provenance/base** | main réel 8f297d8 observé ; source candidate D commise et clone propre ; correctif **non intégré à main**, aucune nouvelle référence canonique fusionnée |
| Sécurité PATH | **CLOSED** | 18 ID CLOSED/FIXED en IL-5.11R, aucun S4036 ouvert au relevé B ; tests adversariaux unitaires rejoués |
| ReDoS | **FIXED** | coût quadratique confirmé puis validation partitionnée linéaire ; reproduction CPU/temps/heap bornée et régression million de caractères |
| SHA256 | **JUSTIFIED** | empreintes de contenu/révisions ; cas privé Redis contenant un credential explicitement distingué d’un password verifier |
| RSA-1024 | **TEST_NEGATIVE_CONFIRMED** | refus import des quatre types et rotation, aucune clé faible commise ni distribuée, fixture privée nettoyée |
| Autres alertes | **Dispositions documentées** | matrice des VULNERABILITY/BUG pertinents et hashes documentaires ; aucune acceptation globale |
| CodeQL | **LIMITED** | analyses SUCCESS ; **check de résultat FAILURE** pour nouveau RSA-1024 intentionnel, FP démontré ; SARIF courant non disponible comme artefact et inventaires HTTP 403 |
| SonarCloud | **FAILURE réel** | inchangé ; preuve historique, non outil opérationnel retenu ; aucune règle désactivée ni alerte administrée |
| npm audit | **0 connu** | omit=dev et include=dev : zéro vulnérabilité au relevé C, lockfile inchangé |
| Tests | **FAIL** | 176 unitaires et 24 contrats passent ; Gateway 17/17 ; Services **15/17** ; suites suivantes non exécutées |
| Acceptation réelle | **FAIL / incomplète** | deux parcours SMTP défaillants ; application/lifecycle nouveaux non rejoués ; anciennes 87 assertions non substituées |
| Package reproductible | **PASS pour octets** | deux tarballs identiques, 41 fichiers, trois membres modifiés ; ce PASS ne suffit pas à qualifier une release |
| Provenance | **PASS pour source/package local** | source D explicite, clone distant propre, tous membres contrôlés ; aucune provenance de publication/OIDC vérifiée |
| Permissions npm | **UNVERIFIED** | E non exécutée après arrêt D ; aucun refus npm ou disponibilité de version supposé |
| Publication | **BLOQUÉE** | cause prioritaire : FAILED_QUALIFICATION en Services, pas un verdict de permissions npm |

## Arrêt et reprise requise

Échec initial test Services 15, conservation/reprise de file Postfix : **Greeting never received / ETIMEDOUT**. Test 16, relais STARTTLS contrôlé : **fetch failed**. Le second échec est compatible avec une capture restée arrêtée après l’exception précédente ; cause initiale non établie. Aucun lien causal ou défaut canonique externe inventé. [Preuves D](IL-5.11-resume-artifact-qualification.md).

Le harnais a supprimé ses ressources possédées et une lecture Docker le confirme pour les deux projets connus. Pas de relance opportuniste, changement de timeout, test neutralisé ou mock. Les vérifications lifecycle, application, package-audit et lint du clone n’ont pas été exécutées après le stop. E est documentée comme plan non réalisé et F clôture l’échec, sans autoriser la publication.

Prochaine reprise : diagnostiquer le timeout SMTP initial avec reproduction bornée, établir son origine, traiter uniquement un défaut Infra Layer autorisé ou arrêter BLOCKED_CANONICAL si un composant externe doit changer. Préserver l’état connu et l’indépendance/cleanup des fixtures. Reprendre D depuis une source propre, puis seulement E et F. Toute modification distribuée impose un nouveau reçu et qualification adaptée ; aucune nouvelle intégration ou publication sans décision distincte.

## Limites et handoff

Inventaires globaux Code Scanning/Dependabot HTTP 403 ; le nouveau diagnostic CodeQL contextualisé reste administrativement signalé. Sonar n’est pas vert. Les audits sont des relevés datés, pas une garantie d’absence de toute vulnérabilité. Le contrat de confiance root/opérateur/outils, les fenêtres stat/exec TOCTOU et SMTP_RECOVERY_UNQUALIFIED restent explicites.

**Aucune référence autorisable pour publication n’est transférée.** Debian conserve `aa9057f224f4ae5cf80d777e3cb2fad092193fb1` ; aucun réalignement ni image requalifiée dans cette mission. OF-01R attend la sélection/qualification de distribution. Les preuves Gateway/validation/types sont transférables avec leur source exacte, sans démarrer Oxymotion D0. Aucune modification Server Runtime/Oxy-form/production, tag ou publication npm/image.

## Livrables

[Évaluation B](IL-5.11-resume-security-assessment.md), [couverture C](IL-5.11-resume-github-security.md), [qualification D et arrêt](IL-5.11-resume-artifact-qualification.md), [plan E non exécuté](IL-5.11-resume-release-plan.md), [arrêt structuré](evidence/IL-5.11-resume/D-stop.json), [reçu D](evidence/IL-5.11-resume/D-artifact-receipt.json).

## Preuve complémentaire après la décision d’arrêt

Le propriétaire a demandé un rejeu ciblé de Services. Résultat : **17/17**, même source propre, aucun code/délai modifié, nettoyage confirmé. Voir le [complément D](IL-5.11-resume-artifact-qualification.md#rejeu-services-explicitement-demandé-après-larrêt). L’échec initial demeure documenté et sa cause non établie. Aucune qualification globale D, vérification E ou autorisation de publication n’est déduite de ce seul succès ; la décision d’arrêt ci-dessus n’est pas remplacée par un feu vert.
