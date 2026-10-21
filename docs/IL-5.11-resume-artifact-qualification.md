# IL-5.11-Resume — Qualification d’artefact D

Rapport consolidé le 2026-10-21T10:27:59+00:00. Source testée : **`d19e62ba682dc2d781f5f941c7ba4b37e3a65053`**.

**Contrôle D : INCOMPLET, aucun PASS global.** Le dernier résultat Services est **17/17 PASS**, après un premier essai à 15/17. Le premier arrêt `FAILED_QUALIFICATION` reste conservé dans les preuves ; le rejeu demandé par le propriétaire ne clôture pas les contrôles D non exécutés et n’autorise pas la publication.

## Source et environnement

Clone distant propre et distinct : `/tmp/il511-resume-clean`, construit depuis le main observé `8f297d8f676706f052a24ce4e875d91b76555b91`. Aucun changement de code ou de délai entre les deux exécutions Services. Les commits de rapport ultérieurs restent hors npm ; les SHA256 des 41 membres correspondent toujours au reçu D lors de cette régénération. Le clone de qualification reste propre et au commit sélectionné.

Node 22.22.0, npm 11.18.0, Docker 29.2.0, Compose 5.0.2. Installation `npm ci --ignore-scripts --no-audit --no-fund --offline` avec cache isolé existant. Lockfile, types publics, exports et version 0.1.0-alpha.3 inchangés ; aucune dépendance de production ajoutée. Gateway utilise Chromium réel. Les moyens disponibles pour la suite incluent Nginx hôte 1.22.1, TypeScript 5.9.3 et une machine indépendante `testbox` ; leur disponibilité ne constitue pas une exécution des acceptations restantes.

## Résultats réellement obtenus

| Vérification | Dernier résultat et portée |
| --- | --- |
| `npm test` | **176/176 PASS**, zéro échec/skip ; 24 contrats inclus |
| `npm run test:contracts` | **24/24 PASS**, zéro échec/skip |
| `npm run test:gateway` | **17/17 PASS**, Chromium et WebSocket réels, nettoyage confirmé |
| `npm run test:services` | **17/17 PASS au rejeu**, zéro échec/skip ; essai initial 15/17 conservé |
| `npm run test:lifecycle` | **NON EXÉCUTÉ** dans cette qualification D |
| `npm run test:application` | **NON EXÉCUTÉ** dans cette qualification D |
| `npm run test:package` | **NON EXÉCUTÉ** ; double pack ci-dessous ne remplace pas cet audit |
| `npm run lint` depuis le clone D | **NON EXÉCUTÉ** ; lint C réussi, 0 erreur/29 avertissements historiques, source distribuée identique |
| Consommateur isolé / types | **8 assertions PASS**, strict NodeNext, exports et préparation idempotente réels, aucune activation |
| Refus supplémentaires dans le consommateur installé | **NON EXÉCUTÉS**, restent à terminer |

[Unitaires](evidence/IL-5.11-resume/D-unit.txt), [contrats](evidence/IL-5.11-resume/D-contracts.txt), [Gateway](evidence/IL-5.11-resume/D-gateway.txt), [consommateur](evidence/IL-5.11-resume/D-consumer.txt), [installation](evidence/IL-5.11-resume/D-install.txt).

## SMTP : dispositif et deux exécutions conservées

Les tests utilisent de vrais conteneurs Postfix/OpenDKIM et un serveur de capture local `smtp-server`, pilotés par Nodemailer. Les messages restent dans la fixture ; aucune délivrabilité Internet n’est qualifiée. Une CA et un certificat privés `drumee.lan` permettent les vérifications STARTTLS avec confiance et nom attendus. Les clients imposent TLS et la validation du certificat ; authentification correcte/incorrecte, refus de relais non autorisé et signature DKIM sont contrôlés. Les délais client sont de 5 s pour connexion/greeting et 10 s pour socket.

| Test Services | Scénario | Premier essai | Rejeu demandé |
| --- | --- | --- | --- |
| 13 | Soumission STARTTLS/SASL, capture locale, refus sans autorisation | PASS | **PASS** |
| 14 | Signature OpenDKIM vérifiée cryptographiquement, persistance de clé | PASS | **PASS** |
| 15 | Panne de capture, conservation de file Postfix après recréation, reprise sans régénération de clé | **ETIMEDOUT / Greeting never received**, 5301 ms | **PASS** |
| 16 | Relais contrôlé, vérification STARTTLS et authentification sortante | **fetch failed**, 30 ms | **PASS** |

Le premier essai a arrêté la séquence D. Le test 15 arrête volontairement la capture ; son exception peut empêcher le redémarrage avant le test 16. Une cascade est compatible avec ce flux, mais la cause du timeout initial reste **non établie**. Le rejeu réussi ne démontre ni cette cause ni la disparition d’une intermittence. Aucun lien causal avec le correctif ReDoS ou défaut canonique externe n’est établi.

Rejeu sur demande explicite « relance le test », le **2026-10-21T10:21:20+00:00**, commande `npm run test:services`, même source propre, aucune modification du code ou des délais. Durée TAP **40090.320362 ms**, exit 0, 17 tests réussis, zéro échec/skip. Projet possédé `drumee-il2-test-bf78037e`, nettoyage confirmé par le harnais. Les autres suites et E n’ont pas été reprises par cette commande.

Le harnais avait également nettoyé les projets initiaux Services `drumee-il2-test-1a3edee9` et Gateway `drumee-il1-test-5fb3fa7d` ; lecture Docker après arrêt : aucun conteneur ni réseau de ces projets restant. Aucun nettoyage global ou de ressource étrangère. Le consommateur supprime sa fixture sans activer de service.

[Premier essai complet](evidence/IL-5.11-resume/D-services-failed.txt), [intégrité réversible de sa présentation](evidence/IL-5.11-resume/D-log-integrity.json), [arrêt initial historique](evidence/IL-5.11-resume/D-stop.json), [séquence initiale](evidence/IL-5.11-resume/D-suites.json), [log du rejeu](evidence/IL-5.11-resume/D-services-rerun-1.txt), [reçu du rejeu](evidence/IL-5.11-resume/D-services-rerun-1.json). SHA256 du log du rejeu : `05b7ccd32c5f95ae019931d7120e0be484fb1a04db3c21f5a25c7693152c57e7`.

## Identité du package

Deux `npm pack --json --ignore-scripts` vers des destinations distinctes produisent les mêmes octets. Archives à 41 membres réguliers, chemins sûrs, ensemble identique au reçu IL-5.11R ; chaque contenu correspond au checkout sélectionné. Leurs empreintes et les 41 fichiers ont été revérifiés pendant cette régénération documentaire, sans nouveau test fonctionnel.

| Champ | Candidat local, publication bloquée |
| --- | --- |
| Package | `@drumee/infra-layer@0.1.0-alpha.3` |
| Membres / octets compressés | **41 / 101778** |
| SHA256 npm | `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e` |
| SRI npm SHA512 | `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==` |
| SHA256 npm IL-5.11R historique | `f2fd950e1f54634fa97b9e74ccd3ceb8dfdb15cb3e8a08c0c46489704432ac9c` |
| SRI npm IL-5.11R historique | `sha512-BP1hSTOer0C7u118cixNtiJ/yOErtCFfEzQTjqZ6tP7bPTMDbXvWrJ24z8jNdKRjFRCTxjprpHxDZ5BUmWb2/Q==` |
| Comparaison | **Octets différents** ; anciennes empreintes non réutilisables |

Seuls `lib/validation.js`, `CHANGELOG.md` et `PROVENANCE.md` changent parmi les 41 membres ; 38 restent identiques. Aucune dépendance de production. [Reçu et liste exhaustive des fichiers/hashes](evidence/IL-5.11-resume/D-artifact-receipt.json).

Le consommateur installe le tarball exact avec scripts désactivés et le même SRI ; aucune résolution depuis un dépôt voisin. Son image immuable `sha256:d44327e37d37c612257822684a870d05d7f90fdae649b2dcbfb8e9f0566e7955` est inspectée pour la préparation sans activation ni suppression : ce n’est pas une acceptation applicative de cette image. `test:package` et sa vérification complète de fichiers/secrets restent à exécuter. Aucun nouveau SRI d’archive source intégrée n’est fourni : la PR n’est pas fusionnée, et ce SRI serait distinct du SRI npm.

## Contrôle D et suite nécessaire

**Identité/reproductibilité PASS ; qualification D globale INCOMPLÈTE.** Les derniers résultats des suites effectivement exécutées passent, y compris Services. Lifecycle, Application, Package, lint du clone et refus supplémentaires du consommateur restent à terminer. Les anciennes 87 assertions applicatives et 16/16 Lifecycle conservent leur source IL-5.11R ; elles ne remplacent pas les contrôles requis du candidat modifié.

La reprise doit caractériser l’échec SMTP initial autant que nécessaire pour apprécier la fiabilité, puis terminer D sur une source propre explicitement figée. Toute nouvelle modification distribuée exige un nouveau reçu et une qualification adaptée. E reste non exécutée ; aucune décision favorable F n’est déduite de ce seul rejeu. Si un défaut impose une rupture de contrat ou un composant canonique externe, appliquer la règle d’arrêt correspondante.
