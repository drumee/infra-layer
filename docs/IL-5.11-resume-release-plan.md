# IL-5.11-Resume — Préparation de publication E après D2

Relevé registre : **2026-10-21T13:07:15.802295+00:00**. **Contrôle E : PASS pour préparation technique**, droits compte vérifiés en lecture seule ; aucune publication autorisée ou exécutée. D reste D_QUALIFIED_WITH_RESIDUAL_UNCERTAINTY et impose une décision du propriétaire sur la réserve SMTP avant publication.

## Registre et identité réels

| Point | Résultat observé |
| --- | --- |
| Registre exact | `https://registry.npmjs.org/`, package public `@drumee/infra-layer` |
| Versions présentes | `0.0.0-stage`, `0.1.0-alpha.1`, `0.1.0-alpha.2` |
| Version cible alpha.3 | **Absente au relevé**, ne pas supposer cette disponibilité future |
| Dist-tags | `next = 0.1.0-alpha.2`, `latest = 0.1.0-alpha.1` |
| Identité utilisée | **somanos**, npm whoami réussi |
| Permissions serveur package | **read-write** pour somanos, vue collaborateurs et vue packages du compte concordantes |
| Politique du compte | **auth-and-writes**, 2FA requise pour les écritures ; aucun OTP collecté ni paramètre modifié |
| OIDC local | **Indisponible**, variables de requête d’identité Actions absentes ; aucune attestation générée |

[Reçu des commandes npm et réponses filtrées](evidence/IL-5.11-D2/npm-release-access.json). Les ACL et le profil ont renvoyé davantage de champs ; seuls le package cible, l’acteur et la politique 2FA sont conservés. Aucun token, mot de passe, email de profil ou secret OTP dans les preuves. Les ACL confirment les droits du compte ; elles ne dispensent pas des exigences 2FA/authentification et de revalidation des restrictions de la session au moment d’une future publication. Aucun `npm publish`, même pour tester les droits.

La configuration trusted publisher/OIDC côté serveur n’est pas certifiée par ces lectures CLI. Aucun changement de workflow, trusted publisher, MFA, ACL ou token. La voie préparée est une publication CLI authentifiée avec le compte autorisé et satisfaction de la 2FA ; l’absence d’OIDC locale n’est pas transformée en provenance npm attestée. Si une attestation OIDC devient une exigence de la décision de release, qualifier séparément cet environnement avant toute publication.

## Artefact figé et métadonnées

Source testée **`dbc0be5c20029374c68bdf510dfadd7da079fcf6`**, clone propre, membre npm identique à d19e62b ; version **0.1.0-alpha.3**, licence **AGPL-3.0-only**, dépôt `drumee/infra-layer`, access public / tag next. Aucun script prepare/prepack/prepublish/prepublishOnly/publish/postpublish, aucune dépendance de production. Tests Package, scan des membres/imports/clé privée, consommateur et types stricts réussis. Liste des 41 membres et SHA256 dans le [reçu D2](evidence/IL-5.11-D2/D2-artifact-receipt.json).

- **41 fichiers / 101778 octets** ; deux constructions identiques.
- SHA256 npm : `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`.
- SRI npm : `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`.

La source Git commise et les empreintes de contenu sont établies ; aucune attestation de registre ou provenance post-publication ne peut exister avant publication. Aucune archive source GitHub n’est confondue avec le tarball npm. La PR #15 n’est pas fusionnée et aucun nouveau SHA canonique intégré n’est fourni.

## Procédure reproductible préparée, non exécutée

1. Obtenir la décision explicite du propriétaire sur la réserve SMTP et une autorisation distincte de publication. La revue/intégration éventuelle de PR #15 est une opération séparée ; aucune fusion dans cette mission. Figer la source effectivement retenue et comparer ses 41 membres au reçu.
2. Reconstruire au besoin depuis un clone propre du SHA source : installation verrouillée avec scripts désactivés, deux `npm pack --json --ignore-scripts --pack-destination <destinations distinctes>`, comparaison binaire et recalcul SHA256/SRI. Si octets différents, arrêter et requalifier au lieu de réutiliser le reçu.
3. Juste avant publication autorisée, revérifier versions, tags, identité, ACL et modalités d’authentification/2FA. Si alpha.3 existe déjà ou les droits changent, arrêter ; ne pas remplacer cette version. Vérifier la politique de provenance choisie dans l’environnement effectif. `npm publish --dry-run` ne prouve pas les droits serveur.
4. Désigner exclusivement le tarball qualifié, vérifier ses empreintes puis exécuter la commande ci-dessous **uniquement sous autorisation distincte**. La 2FA doit être fournie par le mécanisme interactif approuvé au moment de l’écriture ; aucun OTP en rapport ou historique shell.

```sh
/usr/bin/npm publish /tmp/il511-D2-results/pack-1/drumee-infra-layer-0.1.0-alpha.3.tgz --registry=https://registry.npmjs.org/ --access public --tag next --ignore-scripts
```

Ce chemin désigne les octets locaux vérifiés pendant D2 ; s’ils ne sont plus disponibles, reconstruire et comparer avant usage. Aucun `--provenance` n’est ajouté à un contexte local non qualifié pour OIDC. Le canal demeure **next** ; **latest ne doit pas bouger**. Aucun automatisme de publication ou tag de release préparé/exécuté.

## Vérification post-publication prévue

Consulter exactement `@drumee/infra-layer@0.1.0-alpha.3` et `dist.integrity`, vérifier `next` et le maintien de `latest` selon le relevé prépublication. Télécharger depuis `dist.tarball` dans un répertoire neuf, recalculer SHA256 et SRI et comparer au reçu préautorisé ; ne pas substituer un SRI d’archive source. Installer ce tarball avec scripts désactivés dans un consommateur hors checkout ; rejouer exports, préparation idempotente, types stricts et refus contractuels. Enregistrer commit source effectivement retenu, liste des fichiers, empreintes publiées et provenance/attestation réellement disponible. Tout écart bloque la validation de release.

## Décision E

**Permissions npm VERIFIED au niveau identité/ACL du compte**, politique 2FA observée, disponibilité/version et canal vérifiés, commande et vérification post-publication préparées. Les lectures ne sont pas une écriture réussie et doivent être revalidées lors de la publication autorisée. Pas de BLOCKED_RELEASE_PERMISSIONS démontré. OIDC local indisponible, sans revendication de provenance attestée ; la réserve SMTP garde la décision F à **READY_FOR_OWNER_RISK_DECISION**. Aucune publication npm/image, tag, fusion ou opération consommateurs/production.
