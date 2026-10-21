# IL-5.11-Resume — Décision finale après D2

Date : **2026-10-21T13:18:49+00:00**.

**READY_FOR_OWNER_RISK_DECISION. Publication alpha.3 non autorisée.** B est PASS, C reste PASS_WITH_VISIBILITY_LIMITATIONS, tous les contrôles D requis passent, E est préparée avec identité/ACL npm vérifiées. D est **D_QUALIFIED_WITH_RESIDUAL_UNCERTAINTY** : la cause du timeout SMTP initial reste inconnue. Une décision explicite du propriétaire sur cette réserve est nécessaire avant toute publication ; aucun risque n’est implicitement accepté et aucun READY_FOR_PUBLICATION_AUTHORIZATION n’est revendiqué.

## Références et source exacte

| Référence | Valeur |
| --- | --- |
| Main distant revérifié en clôture D2 | **`8f297d8f676706f052a24ce4e875d91b76555b91`** |
| PR #12 / #13 | `077258ca3ef9c77d6d6d94f13ba190b7c0314f56` / `729b755e49f22c220b0cd1a42f619261ba9ce260` |
| HEAD de démarrage D2 | `772875e2000545978d6b05f0f8d762900ec52188` |
| Source exécutée / clone propre D2 | **`dbc0be5c20029374c68bdf510dfadd7da079fcf6`** |
| Campagne instrumentée SMTP | `90a65bce5ce1de8fd89ff3db9a893770a525561f` |
| Source exécutable antérieure | `d19e62ba682dc2d781f5f941c7ba4b37e3a65053`, **41 membres npm identiques** |
| Livraison | [PR #15](https://github.com/drumee/infra-layer/pull/15), branche `feat/il511-resume-final-qualification`, brouillon ouvert, non fusionné |

D2 modifie uniquement harnais et preuves/documentation. Aucun membre distribué ni contrat public modifié. Les commits de rapports ultérieurs ne sont pas prétendus avoir exécuté les tests : l’identité des 41 membres et leur source D2 sont explicitement démontrées. Le ReDoS corrigé demeure dans la PR candidate, pas encore dans main. Aucun nouveau SHA canonique intégré ni SRI d’archive source fusionnée inventé.

## Matrice de décision

| Domaine | Décision | Preuve / réserve |
| --- | --- | --- |
| Source canonique | **PASS provenance/base** | Main revérifié ; correctif candidat non fusionné, source D2 propre/commise |
| Sécurité B | **PASS** | Défaut ReDoS corrigé, diagnostics SHA256/RSA contextualisés individuellement |
| Sécurité PATH | **CLOSED** | Correctifs IL-5.11R intégrés, tests adversariaux et outils approuvés conservés |
| ReDoS | **FIXED** | Validation déterministe linéaire, reproduction bornée et test million de caractères |
| SHA256 | **JUSTIFIED** | Empreintes de contenu ; cas privé Redis avec credential analysé, aucun password verifier |
| RSA-1024 | **TEST_NEGATIVE_CONFIRMED** | Fixture de refus, quatre types/rotation contrôlés, aucune clé faible distribuée |
| Autres alertes | **Dispositions documentées** | Matrice B individuelle, 13 annotations PR #12 et anciennes PATH distinguées de leurs états administratifs |
| Couverture C | **PASS_WITH_VISIBILITY_LIMITATIONS** | Inventaires globaux Code Scanning/Dependabot HTTP 403, aucun inventaire vide revendiqué |
| CodeQL | **LIMITED** | Analyses JS/TS et Actions SUCCESS au SHA D2 ; **résultat FAILURE** pour RSA-1024 du test négatif, alerte #8 inchangée |
| SonarCloud | **FAILURE réel** | Conservé comme preuve, aucune règle/exclusion modifiée ou alerte fermée |
| npm audit | **0 connu** | omit=dev et include=dev rejoués après D2 ; résultat daté, aucune dépendance runtime |
| Qualification D | **D_QUALIFIED_WITH_RESIDUAL_UNCERTAINTY** | Onze commandes nécessaires réussies ; cause SMTP historique inconnue |
| Tests | **PASS** | 176/176 unitaires dont 24 contrats, contrats séparés 24/24, Gateway 17/17, Services 17/17, Lifecycle 16/16 ; zéro skip/échec |
| Acceptation réelle | **PASS dans le périmètre déclaré** | 87 assertions / 11 groupes, Nginx hôte, LAN indépendant, RPC, cycle de vie, SMTP ; Internet et récupération SMTP non qualifiés explicitement |
| Consommateur | **PASS** | Préparation idempotente, types stricts, 8 assertions initiales + 37 supplémentaires ; exports/refus/absence d’import voisin |
| Reproductibilité | **PASS** | Deux archives identiques, 41 fichiers / 101778 octets, mêmes empreintes que candidat D précédent |
| Fiabilité SMTP | **INTERMITTENCE_NOT_REPRODUCED** | Campagne fixée à 3 essais : 3 × 17/17 ; passage intégré 17/17 ; premier échec conservé, aucune correction causale démontrée |
| Permissions npm | **VERIFIED identité/ACL compte** | npm whoami somanos, deux vues serveur read-write, politique 2FA auth-and-writes ; revalidation exigée lors d’une écriture future |
| Provenance | **PASS source/package local** | SHA et membres prouvés ; OIDC local indisponible, aucune attestation de publication revendiquée |
| Préparation E | **PASS technique** | alpha.3 absente au relevé, tags/compte/ACL/2FA et procédure/post-vérification préparés |
| Publication | **BLOQUÉE en attente de décision propriétaire** | Réserve SMTP non acceptée ; publication et fusion restent hors autorisation de cette mission |

## SMTP : décision à prendre et limites

L’échec historique 15/17 comprend un timeout **avant greeting** au test 15 puis une lecture de capture échouée au test 16. Le flux montre que l’exception de 15 empêche le redémarrage capture prévu avant 16 : cascade caractérisée, cause du timeout non établie. Le rejeu historique 17/17 reste distinct.

D2 a défini trois essais complets avant campagne, avec arrêt au premier échec, sorties conservées, ressources isolées et nettoyage vérifié. **3/3 réussissent**, sans changement de timeout/readiness/TLS, retry ajouté ou test ignoré. Le passage Services de la qualification complète réussit aussi, mêmes octets distribués. Les traces montrent greeting, STARTTLS, authentification, capture, reprise de file et fermeture. Aucun défaut distribué significatif persistant observé ; aucun mécanisme initial confirmé ou correction inventée.

Ces succès bornés réduisent l’incertitude sans démontrer la disparition d’une intermittence : mêmes hôte/cache, instrumentation susceptible d’influencer l’ordonnancement et petit échantillon. Même sous hypothèses Bernoulli idéales, 0/3 laisse une borne supérieure unilatérale 95 % d’environ 63 % pour le taux d’échec ; aucune garantie de fiabilité statistique n’est revendiquée. Le propriétaire doit décider si les preuves suffisent pour poursuivre vers une autorisation de publication avec cette réserve, ou demander une investigation/campagne complémentaire. **La présente mission ne choisit pas à sa place.** [Analyse et matrice d’hypothèses](IL-5.11-D2-smtp-incident-analysis.md).

## Qualification réelle et intégrité

Le [rapport D2](IL-5.11-D2-qualification.md) contient les onze commandes, dates UTC, durées, logs et la matrice de garanties. Les 24 contrats sont inclus dans les 176 tests unitaires, sans double comptage. Package et lint réussissent (0 erreur, 29 avertissements historiques, aucun nouveau). Audits sans vulnérabilité connue au relevé.

Les 87 assertions applicatives ont été réellement rejouées : préparation/activation/observation/arrêt, interruption/reprise, rollback, restauration sans SMTP, refus des ressources étrangères, Nginx externe HTTPS CA/SAN, RPC public accepté/protégé refusé, binding loopback et client LAN indépendant avec route de contrôle prouvée. SMTP/DKIM, STARTTLS/SASL, refus d’open relay, absence de ports mail/dkim publics et préservation des clés/file sont contrôlés. Refus **SMTP_RECOVERY_UNQUALIFIED** maintenu ; délivrabilité Internet non testée. Tous les projets et sous-projets connus ont un readback Docker vide ; aucune ressource étrangère supprimée.

| Artefact npm local | Valeur |
| --- | --- |
| Package | `@drumee/infra-layer@0.1.0-alpha.3` |
| Source de construction | `dbc0be5c20029374c68bdf510dfadd7da079fcf6` |
| Fichiers / octets compressés | **41 / 101778** |
| SHA256 | **`c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`** |
| SRI SHA512 | **`sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`** |
| Identité | Deux tarballs identiques, et identiques au candidat D d19e62b |

[Liste des 41 fichiers et hashes](evidence/IL-5.11-D2/D2-artifact-receipt.json). Les anciennes empreintes IL-5.11R f2fd950e… / sha512-BP1h… restent différentes et historiques ; le ReDoS avait modifié lib/validation.js, CHANGELOG.md et PROVENANCE.md avant D2. Aucun SRI npm n’est substitué à celui d’une archive GitHub.

## Security et préparation npm

Au SHA D2, les cinq jobs Quality réussissent sur push et PR ; analyses CodeQL réussies, check de résultats **119229639079 FAILURE**, une alerte high sur la fixture RSA-1024 de test/unit/secrets.test.js:65. Le commentaire PR est actualisé au SHA D2 ; justification technique conservée, aucun état administratif manipulé. Sonar reste FAILURE ; les HTTP 403 historiques limitent toujours l’inventaire administratif global. [Snapshot D2](evidence/IL-5.11-D2/github-candidate-checks.json), [couverture C](IL-5.11-resume-github-security.md), [évaluation B](IL-5.11-resume-security-assessment.md).

Au relevé E **2026-10-21T13:07:15.802295+00:00**, alpha.3 absente, next=alpha.2, latest=alpha.1. Compte **somanos**, ACL read-write sur le package confirmée par deux lectures serveur, 2FA **auth-and-writes**. Aucun token/OTP enregistré. OIDC local indisponible ; aucune configuration trusted publisher ou attestation npm prétendue vérifiée. La publication CLI authentifiée est préparée avec satisfaction de la 2FA et revalidation des droits/versions au moment autorisé. Aucun BLOCKED_RELEASE_PERMISSIONS démontré par ces lectures. Si une attestation OIDC devient obligatoire, qualifier séparément le mécanisme avant publication. [Plan E et reçus](IL-5.11-resume-release-plan.md).

## Handoff et limites restantes

**Aucun feu vert de publication ni acceptation implicite de réserve.** Étapes suivantes : décision propriétaire sur SMTP, revue/intégration éventuelle de PR #15 séparément autorisée, vérification de l’identité des octets/source finalement retenus, puis autorisation de publication distincte et contrôles pré/post npm préparés. Canal prévu **next**, latest à préserver.

Debian reste verrouillé sur `aa9057f224f4ae5cf80d777e3cb2fad092193fb1`. Préparer le futur réalignement uniquement après sélection de l’artefact canonique, avec requalification des images et acceptations ; aucune modification Debian ici. OF-01R attend la distribution qualifiée. Preuves transférables avec leur SHA, sans débuter Oxymotion D0. Les limites de confiance root/opérateur/outils et fenêtres stat/exec TOCTOU documentées restent présentes. Aucune modification Runtime/Oxy-form/production, aucune fusion, publication npm/image ou création de tag.

## Livrables

[Incident SMTP D2](IL-5.11-D2-smtp-incident-analysis.md), [qualification complète D2](IL-5.11-D2-qualification.md), [artefact D consolidé](IL-5.11-resume-artifact-qualification.md), [préparation E](IL-5.11-resume-release-plan.md), [état courant](IL-5.11-resume-status.md), [preuves D2](evidence/IL-5.11-D2). L’arrêt et l’échec historiques restent dans `evidence/IL-5.11-resume/D-stop.json` et les logs d’origine ; ils ne constituent plus le résultat du contrôle D2.
