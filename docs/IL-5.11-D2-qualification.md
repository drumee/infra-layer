# IL-5.11-D2 — Qualification intégrée

Date de consolidation : 2026-10-21T13:05:52+00:00.

**D_QUALIFIED_WITH_RESIDUAL_UNCERTAINTY.** Tous les contrôles D requis ont été exécutés et réussissent. L’incident SMTP initial reste **INTERMITTENCE_NOT_REPRODUCED**, cause inconnue ; aucun résultat ne prouve sa correction. La réserve doit être décidée explicitement par le propriétaire avant publication. Ce statut permet les vérifications E en lecture seule, sans autoriser de publication ou fusion.

## Source et périmètre

- Source intégrée de qualification : **`dbc0be5c20029374c68bdf510dfadd7da079fcf6`**, clone distant indépendant `/tmp/il511-D2-clean`, arbre propre avant/après exécution.
- Campagne SMTP : `90a65bce5ce1de8fd89ff3db9a893770a525561f`, instrumentation seule ; trois essais prévus et trois exécutés.
- Source exécutable initialement sélectionnée : `d19e62ba682dc2d781f5f941c7ba4b37e3a65053`. Les **41 membres npm restent identiques** ; D2 ne change que le harnais et la documentation.
- Main de base : `8f297d8f676706f052a24ce4e875d91b76555b91`. [PR #15](https://github.com/drumee/infra-layer/pull/15) en brouillon, non fusionnée ; aucun nouveau SHA canonique intégré.
- Node 22.22.0, npm 11.18.0 ; Docker 29.2.0 / Compose 5.0.2 ; Nginx hôte 1.22.1 ; TypeScript 5.9.3. Exécutables approuvés IL-5.11R, environnements enfants maîtrisés ; aucun droit/chemin d’outil assoupli.

## Incident SMTP : historique, campagne et réserve

Premier essai historique : **15/17**, test 15 ETIMEDOUT / Greeting never received avant STARTTLS/SASL, puis lecture capture échouée au test 16. Rejeu demandé par le propriétaire : 17/17, mêmes octets/délais. Campagne D2 fixée avant exécution : **3 × 17/17**, zéro skip, cleanup/readback vides par projet. Nouveau passage Services de la qualification complète : **17/17**, séparé de la campagne. Les échecs historiques restent inchangés dans leurs preuves.

Classification principale : **INTERMITTENCE_NOT_REPRODUCED**. La cascade 15 → 16 est expliquée par le flux du harnais : l’exception évite le redémarrage capture prévu, puis 16 la lit. La cause du timeout initial demeure non établie. Aucune correction causale ni défaut distribué/externe démontré pendant D2. Aucun timeout augmenté, sleep arbitraire, retry silencieux, TLS/auth relâché ou test ignoré.

Les horodatages monotones/client et capture, étapes SMTP, commandes Compose et relevés charge/mémoire/PSI/stats sont conservés. Charge à une minute observée sur les trois essais : 2,07–4,85 ; mémoire disponible initiale environ 19 Go. Ces observations actuelles ne caractérisent pas la charge historique. Trois succès, mêmes hôte/cache et instrumentation, ne permettent pas une garantie statistique de rareté ; borne Bernoulli idéale 95 % après 0/3 échecs environ 63 %. Aucun risque implicitement accepté. [Audit A, hypothèses, plan et résultats B/C](IL-5.11-D2-smtp-incident-analysis.md).

## Commandes canoniques et durées

Les scripts ont été vérifiés dans package.json : aucune commande supposée équivalente à un script manquant. La séquence est arrêtée au premier exit non nul ; ici les onze commandes réussissent, sans relance opportuniste.

| Commande (npm/node système) | Résultat | Durée totale |
| --- | --- | --- |
| `test` | **PASS**, exit 0 | 3.521 s |
| `run test:contracts` | **PASS**, exit 0 | 0.314 s |
| `run test:gateway` | **PASS**, exit 0 | 88.587 s |
| `run test:services` | **PASS**, exit 0 | 60.079 s |
| `run test:lifecycle` | **PASS**, exit 0 | 359.451 s |
| `run test:application` | **PASS**, exit 0 | 117.535 s |
| `run test:package` | **PASS**, exit 0 | 1.066 s |
| `run lint` | **PASS**, exit 0 | 1.216 s |
| `audit --omit=dev --json` | **PASS**, exit 0 | 0.264 s |
| `audit --include=dev --json` | **PASS**, exit 0 | 1.016 s |
| `test/application/package-consumer.js` | **PASS**, exit 0 | 2.869 s |

Unitaires **176/176**, dont **24 contrats** également rejoués séparément ; Gateway **17/17** ; Services **17/17** ; Lifecycle **16/16** ; zéro échec/skip TAP. Application réelle : **87 assertions**, statut passed. ESLint : **0 erreur, 29 avertissements historiques, zéro nouveau** ; baseline et règles inchangées. Les deux audits : **zéro vulnérabilité connue** sur le lockfile à cette date, aucune dépendance runtime.

[Ordre, source, dates UTC et empreintes brutes](evidence/IL-5.11-D2/D2-qualification-progress.json). Logs complets `D2-unit.txt`, `D2-contracts.txt`, `D2-gateway.txt`, `D2-services.txt`, `D2-lifecycle.txt`, `D2-application.txt`, `D2-package.txt`, `D2-lint.txt`, audits et consommateur dans le [dossier de preuves](evidence/IL-5.11-D2). Toute normalisation de whitespace est réversible dans [D2-log-integrity.json](evidence/IL-5.11-D2/D2-log-integrity.json).

## Matrice d’acceptation réelle

| Garantie | Preuve exécutée |
| --- | --- |
| Préparation idempotente privée, sans activation | Application groupe 1 et consommateur installé |
| Activation / observation / arrêt / redémarrage | Application groupes 2, 5 et Lifecycle réel |
| Interruption / reprise explicite | Application groupe 8, SIGKILL réel, refus ACTIVATION_RECOVERY_REQUIRED puis recover |
| Configuration / rollback / données conservées | Application groupes 6–7 ; Lifecycle rollback/échec et rotation |
| Restauration sans SMTP | Application groupe 10 et backup/restore SQL/files/CA Lifecycle |
| Refus SMTP_RECOVERY_UNQUALIFIED | Application groupe SMTP ; aucune restauration de spool prétendue qualifiée |
| Ressources étrangères et ownership | Application groupe 9, Lifecycle port/réseau étranger, consommateur chemins/ownership |
| Nginx externe et HTTPS CA/SAN | Vrai Nginx hôte, groupe 4 ; validation native des certificats et refus SAN/clé/chaîne/expiration dans les unitaires TLS |
| RPC public accepté / protégé refusé | Application groupes 2 et 4 : réponses native-RPC / HTTP 403 |
| Binding loopback / refus LAN indépendant | Publication réelle 127.0.0.1, ss ; client SSH testbox, route de contrôle prouvée et refus application ECONNREFUSED |
| SMTP/DKIM / STARTTLS/SASL / refus d’open relay | Services 13–16, trois campagnes et passage intégré ; application groupe SMTP |
| Pas de ports SMTP publics / séparation DKIM | Application inspecte ports mail/dkim vides ; Services ports temporaires uniquement loopback, réseau mail-control séparé |
| Secrets / limites d’accès | Projections et générations privées, refus auth/consommateurs, logs de services contrôlés contre les secrets, audit package sans clé privée ni dépendance implicite |

[Rapport applicatif réel](evidence/IL-5.11-D2/D2-application-report.json) : 11 groupes, 87 assertions, CA/SAN vérifiés, contrôle LAN indépendant, SMTP optionnel/obligatoire diagnostiqué et reprise de backend sans perte de queue/clé. **Internet delivery non testé, récupération SMTP explicitement non supportée.** Aucun mock substitué aux acceptations réelles.

## Consommateur isolé et artefact

Installation offline du tarball exact hors checkout, scripts désactivés ; préparation idempotente sans activation, types stricts NodeNext. **8 assertions déclarées par le harnais existant plus 37 assertions supplémentaires** : exports exacts résolus dans node_modules du consommateur, sélection déclarative de plugins et refus de leur chemin/révision/duplication, exposition réseau interdite, référence consommateur étrangère, racine symlink et répertoire non possédé refusés, ressource témoin préservée. Aucun import du checkout ni dépôt voisin dans le programme consommateur ; package sans dépendance runtime. [Log](evidence/IL-5.11-D2/D2-consumer.txt).

Deux packages construits séparément depuis l’arbre propre sont identiques. Chaque membre est régulier, chemin sûr et contenu identique au checkout et au reçu D précédent ; liste exhaustive et empreintes dans [le nouveau reçu](evidence/IL-5.11-D2/D2-artifact-receipt.json). `test:package` réussit aussi sa liste autorisée, scan de clés privées/secrets de fixture/chemins locaux et imports production déclarés. Ces contrôles ne garantissent pas l’absence de tout secret imaginable.

- Package : `@drumee/infra-layer@0.1.0-alpha.3` ; **41 fichiers / 101778 octets**.
- SHA256 npm : **`c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`**.
- SRI npm : **`sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`**.
- **Identique au candidat D d19e62b**. Les anciennes empreintes IL-5.11R f2fd950e… / sha512-BP1h… restent historiques.
- Aucune dépendance de production, nouveau hook de publication ou modification de contrat public.

Le consommateur utilise une image immuable explicitement identifiée déjà disponible, uniquement inspectée pour préparer ; l’activation réelle est qualifiée séparément par l’application. Le SRI npm ne désigne aucune archive source GitHub ; PR non fusionnée, aucune identité post-fusion inventée.

## Quality / CodeQL et limites

Au SHA `dbc0be5c20029374c68bdf510dfadd7da079fcf6`, les cinq jobs Quality réussissent pour push et PR ; les analyses CodeQL JavaScript/TypeScript et Actions réussissent. **Le check de résultat CodeQL 119229639079 reste FAILURE**, une nouvelle alerte high contextualisée sur RSA-1024 du test négatif (commentaire PR actualisé au même SHA, test/unit/secrets.test.js:65, alerte #8). Disposition technique déjà démontrée en B, aucun état administratif modifié. **SonarCloud FAILURE** conservé. [Snapshot exact](evidence/IL-5.11-D2/github-candidate-checks.json).

C conserve PASS_WITH_VISIBILITY_LIMITATIONS : inventaires globaux Code Scanning/Dependabot HTTP 403, aucun inventaire vide supposé, SARIF candidat téléchargeable non revendiqué. B reste PASS pour le ReDoS corrigé et les usages SHA256/RSA caractérisés. Les rapports de qualification ne transforment pas les scanners en vert.

## Nettoyage et décision D2-F

Chaque harnais confirme le nettoyage de ses ressources ; la lecture Docker post-qualification sur les projets connus ne trouve aucun conteneur ni réseau restant. [Readback](evidence/IL-5.11-D2/D2-cleanup-readback.json). Aucun nettoyage global, ressource voisine/étrangère supprimée ou permission système élargie.

**D_QUALIFIED_WITH_RESIDUAL_UNCERTAINTY** : contrôles nécessaires exécutés et réussis, intégrité démontrée ; la seule réserve d’intermittence SMTP initiale inconnue ne peut pas être levée par les succès observés. La publication reste soumise à décision explicite du propriétaire. Les [contrôles E](IL-5.11-resume-release-plan.md) ont ensuite vérifié en lecture seule disponibilité, tags, identité/ACL et politique 2FA ; aucune publication ni attestation OIDC locale. Les limites Security, confiance opérateur/outils, fenêtres stat/exec TOCTOU et SMTP_RECOVERY_UNQUALIFIED restent documentées.

Aucune fusion, publication npm/image, tag, modification Debian/Runtime/Oxy-form ou production. Debian reste sur `aa9057f224f4ae5cf80d777e3cb2fad092193fb1` ; tout réalignement/distribution et OF-01R exigent une étape ultérieure qualifiée, aucun Oxymotion D0.
