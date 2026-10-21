# IL-5.11 — Handoff de publication expérimentale alpha.3

Dossier du **2026-10-21T15:07:21+00:00**. **Publication INTERDITE ; MERGED_POST_VALIDATION_FAILED.** PR #15 fusionnée, octets et validations locales post-fusion vérifiés ; Quality et CodeQL post-fusion sont désormais réussis/publiés, mais un défaut confirmé de sorties temporaires dans les helpers Python de preuve empêche la clôture R6. Le refus initial de dispatch reste historique. Ce dossier prépare une future décision distincte, sans autoriser npm publish, tag, image, latest ou production.

## Références à transférer

- Canonique intégré : **`a02b76e4c421e96e63406d7b10edc2b76a6056c1`** ; arbre **`06198f583c37e9d79d00689823fc4cb01ef441c2`**.
- Parents de fusion : `8f297d8f676706f052a24ce4e875d91b76555b91`, `bf14ab25c1963d623db4b7646b923f5c6b53b0b0`.
- Source complète qualifiée D2 : **`dbc0be5c20029374c68bdf510dfadd7da079fcf6`** ; source exécutable antérieure d19e62b. Après D2 : uniquement documentation, code/harnais/entrées/lockfile inchangés.
- Acceptation SMTP : **SMTP_RESIDUAL_UNCERTAINTY_ACCEPTED_FOR_ALPHA3**, [décision exacte](IL-5.11-owner-risk-decision.md). Cause inconnue, pas de garantie de disponibilité, d’Internet ou de restauration de spool ; SMTP_RECOVERY_UNQUALIFIED maintenu.
- Package : **`@drumee/infra-layer@0.1.0-alpha.3`**, 41 membres / 101778 octets, aucune dépendance runtime.
- SHA256 npm : **`c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`**.
- SRI npm : **`sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`**.
- [Liste exhaustive et hashes npm](evidence/IL-5.11-release-review/postmerge/receipt.json), deux reconstructions identiques au candidat D2.
- Archive source : [GitHub commit intégré](https://github.com/drumee/infra-layer/archive/a02b76e4c421e96e63406d7b10edc2b76a6056c1.tar.gz), **667195 octets / 359 fichiers Git vérifiés**, SHA256 **`3516e0adf79a610b6b8891f81a710d23df7293dad3de3e274bf3d6f5c487cc34`**, SRI **`sha512-ouj5Bttkrd1+3B/1x4qhBv4gEpGaaXNXLRlqVkYuLUkXQnpE+F1PYrtDYK167suxkLNU9bWzkPmw1JTPdgREKg==`**. [Reçu source](evidence/IL-5.11-release-review/source-archive-receipt.json). Source GitHub et npm sont des identités distinctes.

## Contrats et garanties

Signatures/types publics index.d.ts et lifecycle/index.d.ts, exports racine/capabilities/lib/adapters/lifecycle, erreurs contractuelles et dépendances conservés. Projections privées et ownership, outils système approuvés et environnements contrôlés, exposition applicative strictement loopback, refus des ressources étrangères et cycle de vie canonique. ReDoS corrigé par validation déterministe et tests bornés. Aucun import production depuis un dépôt voisin, aucune dépendance runtime implicite.

D2 : 176 unitaires dont 24 contrats, contrats séparés 24/24 ; Gateway 17/17 ; Services 17/17 et campagne 3 × 17/17 ; Lifecycle 16/16 ; application réelle 87 assertions ; consommateur 8+37 et types stricts. Avant/après fusion : unitaires/contrats, 12 scénarios PATH réels, package, lint, audits et consommateur/types fraîchement PASS. Acceptations lourdes réutilisées par identité démontrée, pas présentées comme nouvelles. HTTPS hôte CA/SAN, LAN indépendant, RPC, interruption/reprise/rollback et restauration sans SMTP établis. Aucun SMTP de sécurité assoupli.

## Contrôles et réserves

- Pré-fusion au HEAD final : cinq Quality réussis, analyses natives CodeQL exécutées/publiées ; résultat CodeQL **FAILURE** pour fixture RSA-1024 négative #8, justifiée individuellement, sans fermeture. SonarCloud **FAILURE**, pas d’acceptation globale.
- Post-fusion : **Quality cinq jobs SUCCESS**, CodeQL JS/TS et Actions SUCCESS avec upload/traitement complet au SHA canonique. SonarCloud FAILURE ; analyse 236 OPEN, 26 IDs nouveaux, dispositions dans le suivi de sécurité.
- Blocage actuel : défaut confirmé de racine/journal symlink dans les helpers de preuve sous docs ; autres chemins temporaires à examiner. Absent des 41 membres npm, sans compromission historique démontrée, mais non accepté par la réserve SMTP. [Suivi et reproduction](IL-5.11-postmerge-security-followup.md). Le refus initial de workflow dispatch demeure conservé, sans nouvelle tentative nécessaire ni changement d’authentification.
- Inventaires globaux GitHub Security restent limités par les HTTP403 documentés. Audits npm fraîchement à zéro vulnérabilité connue, pas une garantie d’absence de tout défaut.
- Réserve SMTP acceptée uniquement pour alpha.3 expérimentale ; cause initiale non établie. Une nouvelle panne significative, perte, problème TLS/SASL/DKIM ou open relay impose une nouvelle investigation indépendante.
- Confiance root/opérateur/outils, fenêtres stat/exec TOCTOU et limites de visibilité conservées.

## Permissions npm et provenance disponibles

[Relevé E daté](evidence/IL-5.11-D2/npm-release-access.json) : identité **somanos**, ACL package **read-write** confirmée par deux vues serveur, politique 2FA **auth-and-writes**. Alpha.3 absente au relevé, next=alpha.2, latest=alpha.1. Ces accès/états sont des preuves datées, à revalider avant toute écriture ; aucune nouvelle publication ou modification d’ACL/MFA/token n’a eu lieu. Droits npm distincts du refus GitHub Actions.

OIDC local indisponible, configuration serveur trusted publisher non certifiée ; aucune attestation de publication revendiquée. Provenance locale établie par commit/tree, archives et hashes. Si une attestation OIDC est exigée pour la publication, qualifier séparément un mécanisme réellement disponible sans prétendre que le contexte local le supporte.

## Procédure future, non exécutée

1. Clore R6 : corriger/requalifier les écritures des helpers de preuve (racines privées exclusives, ownership/modes/liens et refus des symlinks), examiner les autres chemins et obtenir l’intégration corrective autorisée. Quality/CodeQL sont déjà prouvés au SHA intégré ; conserver Sonar FAILURE et les dispositions individuelles, sans changement de règle pour fabriquer un succès. Recalculer les références source après toute intégration future, même si npm reste identique.
2. Obtenir une **autorisation distincte de publication npm** ; l’acceptation SMTP et la fusion n’en tiennent pas lieu. Figer le commit effectivement retenu, vérifier que main et les 41 membres n’ont pas changé.
3. Reconstruire deux tarballs depuis un clone propre ou utiliser les octets post-fusion conservés ; comparer membres, SHA256 et SRI au reçu. Si divergence, arrêter/requalifier. Tarball local vérifié : `/tmp/il511-release-postmerge/pack-1/drumee-infra-layer-0.1.0-alpha.3.tgz`.
4. Revalider au registre exact version/disponibilité/dist-tags, identité/ACL et authentification/2FA ; version déjà existante ou accès changé : arrêt. Choisir et qualifier le mécanisme de provenance effectivement autorisé.
5. Seulement après autorisation et conditions satisfaites : publication CLI du tarball exact avec `--registry=https://registry.npmjs.org/ --access public --tag next --ignore-scripts`, 2FA via mécanisme interactif approuvé. Aucun OTP/token dans le rapport ou historique shell, aucun dry-run assimilé à un droit serveur. **Aucune commande de publication exécutée ici.**
6. Vérifier la version exacte publiée, dist.integrity et dist-tag next ; latest doit rester à sa valeur relevée juste avant publication. Télécharger le tarball du registre dans un répertoire neuf ; comparer SHA256/SRI avec le reçu préautorisé, installer avec scripts désactivés hors checkout, rejouer exports/types/préparation et refus. Enregistrer commit et provenance/attestation réellement publiés. Tout écart bloque la validation de release.

Le [plan E existant](IL-5.11-resume-release-plan.md) reste une préparation antérieure ; le présent handoff fixe la référence intégrée et documente le blocage R6, actualisé par le suivi de sécurité. Le chemin de tarball ci-dessus doit encore être vérifié au moment d’usage ; s’il a disparu, reconstruire et comparer, jamais supposer son identité.

## Consommateurs et arrêts

Debian conserve `aa9057f224f4ae5cf80d777e3cb2fad092193fb1`. Les nouvelles références ci-dessus sont préparées pour un réalignement ultérieur avec requalification images/parcours ; **ne pas modifier le verrou ici**. Oxy-form inchangé ; OF-01R attend sélection/qualification de distribution, puis ses contrôles de relais réel/DNS/réception/délivrabilité. Aucun Oxymotion D0, Runtime ou production.

Arrêter si R6 reste sans preuve, contrôle obligatoire échoué, nouveau défaut significatif, nouveau changement non qualifié, identité d’artefact différente, perte/incident SMTP non couvert, droits/2FA non satisfaits ou besoin canonique externe. La fusion est déjà réelle ; aucun rollback implicite n’est autorisé. Aucun npm publish, tag, image publiée ou déplacement de latest pendant cette mission.
