# IL-5.11R-Review — Revue finale de sécurité de la PR #12

Date : 2026-10-20T18:07:16+00:00. Dépôt : `drumee/infra-layer`. Cible : `main`.

**Statut final : READY_FOR_MERGE. La PR #12 n’est pas fusionnée.**

La revue R1–R4 est favorable. L’unique commande de fusion standard a été refusée par GitHub pour les droits du personal access token. Aucune autre stratégie de fusion n’a été tentée. Aucun contournement administratif, changement de protection, fermeture Sonar, publication, tag, modification Debian/Runtime/Oxy-form ou opération de production.

## État initial et provenance — R1 PASS

- [PR #12](https://github.com/drumee/infra-layer/pull/12) OPEN, non draft, MERGEABLE ; état d’intégration UNSTABLE en raison du contrôle SonarCloud FAILURE.
- HEAD exact examiné : `6a06d26a69d4480d4afc280cef1dee9e2e585754`, identique au HEAD demandé. Aucun commit supplémentaire depuis cette référence.
- Base réelle : `9e4166618ca519e5d9b9e58f5191d37c5fd56462`. Ce commit est également le merge-base ; aucun changement de main intervenu avant la tentative.
- Source exécutable/package qualifiée : `71bd7b8b38345d61316771c07d76fece687af650`. Les trois commits suivants modifient uniquement 32 fichiers documentaires. Les 41 fichiers npm sont individuellement identiques à cette source, au HEAD examiné et à la source d’acceptation lourde `68000c593a7c9aad0f9e7989ad2f69857e59eba8`.
- Aucun `AGENTS.md` trouvé aux niveaux racine, home, github et dépôt, ni dans l’arbre Git du candidat.
- Les 11 commits sont non signés (`verification.reason=unsigned`). Aucun impératif de signature applicable identifié : GET branches/main retourne `protected:false`, `protection.enabled:false`, contexts/checks vides, enforcement `off` ; GET rules/branches/main retourne `[]`.
- Les trois stratégies de fusion sont disponibles ; merge commit retenu pour conserver les 11 commits et leur provenance.

La lecture détaillée des protections classiques et de branchProtectionRules GraphQL retourne HTTP 403. Elle n’est pas présentée comme une absence de politique. Les réponses effectives de la branche et des règles actives établissent séparément l’absence de protection applicable observée. Les permissions déclarées du compte incluent admin/push ; elles ne garantissent pas les droits du jeton sur l’opération de fusion.

## Matrice individuelle SonarCloud — R2 PASS

[Analyse PR](https://sonarcloud.io/dashboard?id=drumee_infra-layer&pullRequest=12), check `118684164614` au HEAD exact : **FAILURE**. API : **13 OPEN**, huit VULNERABILITY et cinq CODE_SMELL. Les 17 enregistrements bruts comprennent aussi quatre CLOSED historiques : ils ne sont pas comptés parmi les 13 ouverts. Gate `ERROR`, security rating du nouveau code `5` (E), exigence A. Aucun état administratif modifié.

Les décisions ci-dessous sont des dispositions techniques locales de cette revue autorisée ; elles ne sont pas des fermetures SonarCloud ni une acceptation de risque nouvelle.

| ID | Règle / emplacement au HEAD examiné | Disposition technique individuelle et preuve |
| --- | --- | --- |
| `AaFZl_1PcPSyTboN_x_L` | json:S6418 BLOCKER ; reçu F:26 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : SHA256 intégral du fichier source public `capabilities/secrets/index.js`, recalcul indépendant concordant ; détail ci-dessous. |
| `AaFZMuQhZ9JThwxqrsye` | S2612 ; system-tools-container.cjs:23 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : `/owned/open` chmod 0777 est l’entrée négative D3 ; le resolver refuse son descendant avant exécution. |
| `AaFZMuQhZ9JThwxqrsyf` | S2612 ; même fichier:24 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : copie publique 0755 sous ce parent 0777 ; rejet du parent et absence d’exécution de la copie. |
| `AaFZMuQhZ9JThwxqrsyg` | S2612 ; même fichier:28 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : copie chmod 0777 ; test du refus de l’exécutable lui-même. |
| `AaFZMuQhZ9JThwxqrsyh` | S2612 ; même fichier:32 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : copie 0755 puis chown 65534 ; test du refus d’un propriétaire étranger. Aucun programme étranger exécuté. |
| `AaFZMuQhZ9JThwxqrsyi` | S2612 ; même fichier:58 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : fixture `/usr/bin/docker` 0755 dans le tmpfs vide du conteneur ; aucune altération du Docker hôte, validation seulement. |
| `AaFZMuQhZ9JThwxqrsyj` | S2612 ; même fichier:64 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : plugin 0755 sous `/owned/plugins` protégé root, contrôle positif de résolution ; aucune invocation du plugin. |
| `AaFZMuQhZ9JThwxqrsyk` | S2612 ; même fichier:67 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : config Docker chmod 0666 après contrôle positif ; le resolver la refuse avant toute exécution. |
| `AaFZMuSQZ9JThwxqrsyl` | S9382 ; adapters/docker/services.js:29 | **STYLE_NON_BLOCKING** : await docker inspect dans la boucle de capacités ; observations séquentielles voulues, refus/continue/diagnostics conservés. Aucun résultat perdu ni erreur de flux constatée. |
| `AaFZMuM_Z9JThwxqrsyb` | S2681 ; test/lifecycle/run.js:15 | **STYLE_NON_BLOCKING** : seul le throw dépend du statut non nul ; return stdout doit être inconditionnel après succès. En cas d’échec, throw termine déjà le flux. |
| `AaFZMuM_Z9JThwxqrsyc` | S7723 ; même fichier:22 | **STYLE_NON_BLOCKING** : Error(message) et new Error(message) créent un objet Error équivalent ; le throw est conditionné par la collision d’image. |
| `AaFZMuH5Z9JThwxqrsyZ` | S2681 ; test/services/run.js:18 | **STYLE_NON_BLOCKING** : wrapper de commande ; throw conditionnel et retour de stdout après succès sont le flux attendu. |
| `AaFZMuH5Z9JThwxqrsya` | S2681 ; même fichier:52 | **STYLE_NON_BLOCKING** : seule la levée d’erreur est conditionnelle à la collision réseau ; affecter compose.networks après une absence de collision est voulu. |

Les sept fixtures ont été examinées individuellement dans [le code exact](https://github.com/drumee/infra-layer/blob/6a06d26a69d4480d4afc280cef1dee9e2e585754/test/security/system-tools-container.cjs) et dans [leur lanceur](https://github.com/drumee/infra-layer/blob/6a06d26a69d4480d4afc280cef1dee9e2e585754/test/security/run.js). Conteneur à nom aléatoire possédé, `--rm`, rootfs readonly, réseau none, source readonly, tmpfs privés `/owned`, `/usr/bin`, `/etc/docker`, aucun socket Docker monté, aucune clé de production, capabilities retirées sauf CHOWN, no-new-privileges et limites de ressources. Les permissions dangereuses ne touchent que ces fixtures. Aucun processus d’un autre job ne partage ces montages ; un attaquant nécessiterait la compromission du runner/daemon déjà autorité de confiance. Le scénario ne donne pas accès aux ressources possédées de l’hôte à un utilisateur non fiable. Le rejeu réel rapporte **12/12**, sans modification de binaire hôte.

### Vérification spécifique S6418

Fichier signalé : `docs/evidence/IL-5.11R/F-artifact-receipt.json`, ligne 26. La clé JSON est le chemin `capabilities/secrets/index.js` dans une table d’empreintes des 41 membres npm ; le mot « secrets » dans ce chemin ne rend pas sa valeur confidentielle.

Valeur signalée et recalculée :

```text
b872fa5cdd6868d0b89f17038aa445a8c709e675f4e82452fb7283647d48c432
```

Calcul : SHA256 des octets du [module source public](https://github.com/drumee/infra-layer/blob/6a06d26a69d4480d4afc280cef1dee9e2e585754/capabilities/secrets/index.js), avec `sha256sum capabilities/secrets/index.js` et vérification individuelle par hashlib.sha256. Correspondance exacte au reçu et aux trois sources mentionnées en R1. Aucune dérivation d’un mot de passe, clé, token ou credential ; aucune information de déploiement révélée par cette valeur. Le module manipule des secrets à l’exécution, mais son code source public n’est pas un secret. Le reçu n’est pas dans npm et la chaîne littérale de cette empreinte est absente des 41 membres distribués. L’exposition du checksum dans le dépôt public est intentionnelle et reproductible. Conclusion : faux positif techniquement confirmé, sans acceptation de risque.

## Garanties canoniques — R3 PASS

Revue du diff complet de production et de `internal/system-tools.js` : Docker, ss et OpenSSL ont des entrées fixes `/usr/bin`, sans fallback PATH. Le contrôle parcourt propriétaires root, écritures groupe/autres, parents, cibles et chaînes de liens ; le chemin final validé est exécuté. Chaque appel revalide. Docker utilise le socket local explicite, HOME=/ et DOCKER_CONFIG=/etc/docker ; configuration et plugins Compose/Buildx sont vérifiés. Les options sont nommées et shell:false/env imposés.

Les environnements enfants sont reconstruits : PATH fixe, locale C, pas de loader, réglage SSL ou configuration Docker hérités. Le client ACME absolu conserve les contrôles d’ownership, parents, permissions, liens et SHA256 ; il est rehaché avant chaque invocation. Seuls les chemins Cloudflare nécessaires sont ajoutés pour l’émission autorisée. Les trois outils système et Compose doivent exister aux chemins Debian approuvés, avec ancêtres et cibles protégés ; un autre chemin d’installation demande une qualification distincte.

Les déclarations `index.d.ts`, `lifecycle/index.d.ts`, exports npm et package-lock sont identiques à main. Aucune dépendance de production. Le resolver privé n’ajoute aucun export public. Les erreurs owning sont conservées, notamment DOCKER_LIFECYCLE_COMMAND_FAILED, PORT_OBSERVATION_UNAVAILABLE, TLS_CERTIFICATE_INVALID, TLS_CHAIN_INVALID et les erreurs ACME existantes.

Les mécanismes loopback, refus des ressources étrangères, ownership, ordre du cycle de vie, STARTTLS/SASL, séparation SMTP/DKIM et refus de restauration SMTP restent en place. La validation TLS utilise toujours OpenSSL réel et refuse la CA étrangère, le SAN incorrect, les dates/clés invalides. Aucun import de dépôt voisin : l’audit parcourt les require des membres npm et le consommateur utilise uniquement le package installé.

Rejeu au HEAD examiné :

- Installation verrouillée `npm ci --ignore-scripts --no-audit --no-fund --offline` avec cache de qualification existant : 127 packages.
- `npm test` : **171/171**, zéro échec/skip, dont les **24 contrats** déjà inclus ; outils réels, CA étrangère, socket ss et revalidation ACME couverts.
- `node test/security/run.js` : **12 scénarios réels** de permissions/liens/configurations, tous réussis.
- `npm run test:package` : allowlist 41 fichiers, zéro dépendance/import externe de production et **PACKED_CONSUMER_OK**.
- `npm run lint` : zéro erreur, 29 avertissements visibles, zéro nouvelle observation, baseline inchangée.

Premières tentatives locales conservées comme incidents d’environnement : tests lancés avant installation des dépendances et sous sandbox ; premier npm pack bloqué par son cache hors racine writable ; premier cache offline vide ENOTCACHED. Après installation verrouillée depuis le cache qualifié et exécution avec les droits de sockets requis, tous les contrôles ci-dessus passent. Aucun changement de code ou de règle pour les faire passer.

Les acceptations lourdes ne sont pas rejouées dans cette revue : preuves existantes liées à `68000c5`, avec identité indépendante des 41 fichiers exécutés. Gateway 17/17, services 17/17, lifecycle 16/16, acceptation applicative **87 assertions**, Nginx hôte/HTTPS CA-SAN réels, RPC accepté/refusé, boucle locale et refus LAN indépendant, SMTP/DKIM/STARTTLS/SASL et refus d’open relay. [Rapport d’acceptation](https://github.com/drumee/infra-layer/blob/6a06d26a69d4480d4afc280cef1dee9e2e585754/docs/evidence/IL-5.11R/E-application-report.json). Consommateur antérieur huit assertions/types stricts et quatre attaques appariées sur package installé documentés dans le dossier F. Ces preuves sont héritées par identité de fichiers, pas annoncées comme de nouvelles exécutions.

## GitHub et intégrité — R4 PASS

| Contrôle au HEAD exact | Résultat / référence |
| --- | --- |
| Quality unit, contracts, eslint, dependencies, packaging | Cinq SUCCESS ; [run 39439085402](https://github.com/drumee/infra-layer/actions/runs/39439085402) |
| CodeQL natif Analyze javascript-typescript | SUCCESS ; [run 39439080342](https://github.com/drumee/infra-layer/actions/runs/39439080342) ; seul notice : migration ubuntu-latest vers Ubuntu 26 |
| Résultat PR CodeQL `118684343313` | SUCCESS ; « No new alerts in code changed by this pull request » ; zéro annotation effectivement relue |
| SonarCloud `118684164614` | **FAILURE**, 13 annotations OPEN ; aucune S4036 ouverte dans la vue PR examinée |
| Protections obligatoires observées | `protected:false`, enforcement off, contexts/checks vides, règles actives `[]` ; aucun contrôle désactivé par cette mission |

Workflow Quality : `contents:read`, checkout sans persistance de credentials, actions checkout/setup-node épinglées par SHA ; aucun changement de permission du jeton dans le diff. La préparation de la VM CI protège seulement le Node déjà installé dans le cache hébergé, avec gardes de contexte, ownership/liens et inventaire de contenu identique avant/après. Elle ne relâche pas le resolver. La lecture des paramètres Actions/workflow permissions par API retourne HTTP 403 ; ces paramètres globaux ne sont pas attestés.

Code Scanning et Dependabot globaux : **HTTP 403** revérifié. Le résultat PR CodeQL ne prouve pas l’absence de toute alerte globale. Les 227 annotations historiques Sonar de main et les 18 ID PATH antérieurs ne sont pas déclarés fermés. Leur état post-intégration reste à constater.

### Empreintes npm et source distinctes

Deux `npm pack --json --ignore-scripts` depuis le HEAD examiné, destinations différentes, Node 22.22.0/npm 11.18.0 : archives identiques octet par octet. Chaque membre régulier correspond au Git et aux SHA256 du reçu qualifié.

| Identité | Résultat recalculé |
| --- | --- |
| Version locale npm | `@drumee/infra-layer@0.1.0-alpha.3`, non publiée |
| Membres / taille npm | **41 / 101 242 octets** |
| SHA256 npm | `f2fd950e1f54634fa97b9e74ccd3ceb8dfdb15cb3e8a08c0c46489704432ac9c` |
| SRI npm | `sha512-BP1hSTOer0C7u118cixNtiJ/yOErtCFfEzQTjqZ6tP7bPTMDbXvWrJ24z8jNdKRjFRCTxjprpHxDZ5BUmWb2/Q==` |
| Archive source du HEAD PR | [codeload du HEAD](https://codeload.github.com/drumee/infra-layer/tar.gz/6a06d26a69d4480d4afc280cef1dee9e2e585754) ; 266 fichiers, zéro différence avec Git |
| SHA256 source HEAD PR | `c70c9fa084e07a20a7240f2bc5d2fd1082a76942965c402d6e57f22c2b051c7c` |
| SRI source HEAD PR | `sha512-LY7QDobxJTjWl1TLremafI56cjANPmukKJ1NjDSb0Sz3gHqudF4iNxuh0WeDqTiRwI0siit6u1vFOO07mKmbTw==` |

La nouvelle archive source inclut les documents de clôture ; son empreinte diffère légitimement de celle de `71bd7b8`. Son SRI ne remplace jamais le SRI npm. Aucun nouveau commit de fusion n’existe : aucune identité d’archive post-fusion n’est inventée. Reproductibilité attestée sur cet hôte et cette toolchain uniquement.

## Décision et tentative de fusion — R5 AUTORISÉE, REFUSÉE PAR L’ACCÈS GITHUB

R1, R2, R3 et R4 sont PASS. Aucun défaut de sécurité significatif non résolu ni changement de contrat public détecté dans le périmètre de la PR. La décision favorable repose sur les preuves individuelles des faux positifs, sans nouvelle acceptation de risque. Sonar reste en échec ; ce contrôle n’est pas obligatoire dans la politique effective observée. Aucun contournement ni modification de règle.

Immédiatement avant l’opération : HEAD `6a06d26a69d4480d4afc280cef1dee9e2e585754`, base `9e4166618ca519e5d9b9e58f5191d37c5fd56462`, PR ouverte/fusionnable, protections et résultats relus, tous inchangés.

Commande unique :

```sh
gh pr merge 12 --repo drumee/infra-layer --merge --match-head-commit 6a06d26a69d4480d4afc280cef1dee9e2e585754
```

Résultat : exit 1, `Message: Resource not accessible by personal access token, Locations: [{Line:1 Column:58}]`. Pas de `--admin`, pas d’auto-merge, pas de seconde stratégie ou d’autre identité utilisée. La cause exacte du refus du champ GraphQL ne peut pas être précisée au-delà de ce message ; aucun rejet de protection de branche n’est démontré.

Lecture GitHub après refus : **state=open, merged=false, merged_at=null**, main toujours `9e4166618ca519e5d9b9e58f5191d37c5fd56462`. La valeur `merge_commit_sha=770e8f6cd4fa8361515f7b24ca2ccab40bb53914` est le commit de test de fusion d’une PR ouverte, **pas un commit intégré**.

Statut **READY_FOR_MERGE** : l’exécution de la fusion avec un accès disposant des droits nécessaires reste administrative. Ce n’est ni MERGED_AND_SECURITY_VERIFIED ni une fusion à répéter sans contrôles. Toute reprise doit revérifier HEAD/base/contrôles/politiques avant l’opération ; nouvelle qualification si le code ou la base ont changé de façon pertinente.

## Vérification post-fusion — R6 NON EXÉCUTÉE

Aucune fusion confirmée, donc aucun test main post-fusion ni CodeQL post-fusion attribué à cette mission. Les runs listés après le refus restent ceux de la PR, sans run d’intégration nouveau. Le statut MERGED_AND_SECURITY_VERIFIED est interdit à ce stade.

Après une fusion effective, lire le commit réel et ses parents/arbre, comparer les 41 fichiers, reconstruire le npm et vérifier SHA256/SRI, télécharger et mesurer séparément l’archive source du commit intégré, attendre Quality et CodeQL sur main puis examiner les nouvelles annotations Sonar et les résultats de sécurité accessibles. Ne pas assimiler une archive GitHub à un tarball npm.

## Handoff IL-5.11 et conditions Debian

- Canonique Infra Layer actuel : `9e4166618ca519e5d9b9e58f5191d37c5fd56462`, **inchangé**. Aucun nouveau SHA canonique sécurisé intégré disponible.
- Source de revue prête : `6a06d26a69d4480d4afc280cef1dee9e2e585754` ; source exécutable qualifiée `71bd7b8b38345d61316771c07d76fece687af650` ; empreintes npm et source PR ci-dessus.
- Liste npm complète et SHA256 individuels dans [verification.json](evidence/IL-5.11R-review/verification.json). Contrats publics inchangés ; résultats Quality/CodeQL favorables et dispositions des 13 annotations consignés ici.
- Reprise : terminer fusion et R6, vérifier la fermeture technique du blocage PATH, puis **IL-5.11-B → IL-5.11-C → IL-5.11-D → IL-5.11-E → IL-5.11-F**. La publication alpha.3 nécessite une autorisation distincte.
- Debian conserve `aa9057f224f4ae5cf80d777e3cb2fad092193fb1` et son ancien inventaire 40 fichiers. Aucun verrou ni fichier Debian modifié. Futur réalignement seulement vers un commit réellement intégré, avec son nouveau SRI source, inventaire 41 membres, chemins Docker/ss/OpenSSL/Compose protégés et requalification des images et acceptations réelles.
- Limites résiduelles : confiance root/outils système/runner ; compte de qualification déjà compromis et fenêtre stat/exec TOCTOU non neutralisés ; pas de reproductibilité inter-hôtes démontrée ; inventaires globaux GitHub HTTP 403 ; Sonar PR toujours FAILURE ; alertes historiques sans acceptation globale.
- **SMTP_RECOVERY_UNQUALIFIED** maintenu ; aucune restauration de spool SMTP ni délivrabilité Internet nouvellement qualifiée. Aucune opération production, oxymot.fr ou Oxymotion D0.

## Preuves et conservation

[Contrôles GitHub](evidence/IL-5.11R-review/github-check-runs.json), [Quality](evidence/IL-5.11R-review/quality-run.json), [annotations Sonar brutes](evidence/IL-5.11R-review/sonar-issues.json), [gate Sonar](evidence/IL-5.11R-review/sonar-gate.json), [171 tests](evidence/IL-5.11R-review/unit.txt), [12 scénarios](evidence/IL-5.11R-review/container.json), [packaging](evidence/IL-5.11R-review/package.txt), [lint](evidence/IL-5.11R-review/lint.txt), [vérification d’intégrité et refus de fusion](evidence/IL-5.11R-review/verification.json).

Ce rapport et ses preuves sont préparés sur une branche documentaire distincte fondée sur main, sans importer le code de #12 dans cette branche et sans écriture directe sur main. Leur éventuelle intégration documentaire ne fusionne pas #12 et ne change pas son statut.

La branche `docs/il511r-review-final` a été poussée sur origin avec succès via Git. La création de la PR documentaire en brouillon a ensuite échoué : `GraphQL: Resource not accessible by personal access token (createPullRequest)`. Aucune PR documentaire créée par cette mission ; aucun autre mode de création tenté. Le rapport reste [consultable sur la branche dédiée](https://github.com/drumee/infra-layer/blob/docs/il511r-review-final/docs/IL-5.11R-review-final.md).
