# IL-5.11R-G — Disposition technique de sécurité

Statut du lot : **READY_FOR_SECURITY_REVIEW**, sans autorisation de fusion/publication. Les mécanismes PATH examinés sont corrigés et testés ; les états des outils restent distingués des décisions techniques. PR corrective [#12](https://github.com/drumee/infra-layer/pull/12), source qualifiée `71bd7b8b38345d61316771c07d76fece687af650`. L’[audit initial #11](https://github.com/drumee/infra-layer/pull/11) reste ouvert et inchangé à `73fc06059d529773e752ed9ce1c2b7ce35ee65b0`.

## Les 18 alertes PATH initiales

Cinq concernent le package et treize les tests. Toutes utilisent désormais le resolver correspondant et un environnement contrôlé. Les observateurs Docker connexes et le client ACME sont aussi couverts. Les preuves D1–D8 incluent les reproductions installées, les métadonnées réelles et les acceptations de [D/E](IL-5.11R-security-tests.md). L’absence d’annotation nouvelle ne constitue pas à elle seule une preuve : ce sont les programmes réellement exécutés, les refus et l’absence des marqueurs qui étayent la correction.

| ID initial | Site initial | Portée | Correction | État observé |
| --- | --- | --- | --- | --- |
| `AaE8TbnThgf3bSVnp8z4` | `test/lifecycle/run.js:21` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE8TcJkhgf3bSVnp80B` | `lifecycle/recovery.js:22` | SHIPPED_RUNTIME | resolveTrustedExecutable + systemEnvironment | Implémenté/testé ; main OPEN |
| `AaE8TbpHhgf3bSVnp8z9` | `test/lifecycle/tracing-driver.js:6` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE8TcJ8hgf3bSVnp80i` | `lifecycle/docker.js:8` | SHIPPED_RUNTIME | resolveTrustedExecutable + systemEnvironment | Implémenté/testé ; main OPEN |
| `AaE8TcJ8hgf3bSVnp80m` | `lifecycle/docker.js:49` | SHIPPED_RUNTIME | resolveTrustedExecutable + systemEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw2edL4i9l9HI8Cw` | `test/package-audit.js:21` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw2edL4i9l9HI8Cx` | `test/package-audit.js:24` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw1PdL4i9l9HI8CT` | `test/services/run.js:29` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw1PdL4i9l9HI8CU` | `test/services/run.js:51` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw1PdL4i9l9HI8CW` | `test/services/run.js:79` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw1PdL4i9l9HI8CX` | `test/services/run.js:80` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw4UdL4i9l9HI8Dz` | `capabilities/tls/index.js:9` | SHIPPED_RUNTIME | resolveTrustedExecutable + systemEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw4UdL4i9l9HI8D1` | `capabilities/tls/index.js:19` | SHIPPED_RUNTIME | resolveTrustedExecutable + systemEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw2edL4i9l9HI8Cu` | `test/package-audit.js:8` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw2UdL4i9l9HI8Cp` | `test/integration/run.js:29` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw2UdL4i9l9HI8Cr` | `test/integration/run.js:50` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw2UdL4i9l9HI8Cs` | `test/integration/run.js:92` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |
| `AaE6Nw2UdL4i9l9HI8Ct` | `test/integration/run.js:93` | TEST_ONLY | trustedExecutable + trustedEnvironment | Implémenté/testé ; main OPEN |

Le main analysé reste l’ancien code non intégré : inventaire public **227 OPEN, 23 VULNERABILITY**. Les 18 ID ci-dessus sont encore OPEN sur main ; aucun n’est annoncé CLOSED. La PR examinée n’a aucune annotation S4036 ouverte dans sa vue de diff. Il faudra observer la nouvelle analyse du main après une éventuelle intégration, sans modification automatique des statuts. Le [JSON individuel](evidence/IL-5.11R/G-security-disposition.json) conserve les correspondances.

## GitHub Quality et CodeQL

Sur 71bd7b8 : unit, contracts, eslint, dependencies et packaging sont tous **SUCCESS**. Analyze javascript-typescript a exécuté/publé son analyse. Le check de résultat CodeQL **118649409874** est SUCCESS avec titre **No new alerts in code changed by this pull request** et **zéro annotation**, relu après analyse. Il ne s’agit pas d’une affirmation de zéro alerte globale.

Le premier check **118616929112** signalait une alerte medium sur le transfert des options Docker. Le forwarding opaque a été supprimé au profit de contrôles explicitement nommés ; shell:false et environnement minimal restent imposés, y compris si l’appelant demande shell:true. Les tests de métacaractères ne créent aucun marqueur. Le nouveau résultat a été effectivement relu, et non déduit d’un déplacement de ligne. L’état détaillé de l’alerte globale n’est pas administré.

Les inventaires Code Scanning et Dependabot retournent toujours **HTTP 403 — Resource not accessible by personal access token**. Aucune tentative de contournement, de changement de permission ou d’hypothèse favorable. La lecture des résultats PR reste disponible ; la [limite d’accès](evidence/IL-5.11R/G-security-access.json) est préservée. Aucun contrôle n’est désactivé.

## SonarCloud : réserve explicite

La gate reste **FAILURE**. La vue PR examinée contient **13 OPEN : 7 VULNERABILITY S2612 dans les tests, une VULNERABILITY S6418 sur un reçu documentaire, et 5 CODE_SMELL**. Les sept S2612 concernent exclusivement `test/security/system-tools-container.cjs`, absent du package. Leur contexte est individuel :

| ID | Ligne | Contexte technique pour revue |
| --- | ---: | --- |
| `AaFZMuQhZ9JThwxqrsye` | 23 | Répertoire 0777 volontairement rejeté (D3) |
| `AaFZMuQhZ9JThwxqrsyf` | 24 | Exécutable public de fixture 0755 sous le répertoire dangereux, jamais exécuté |
| `AaFZMuQhZ9JThwxqrsyg` | 28 | Fichier 0777 volontairement rejeté (D3) |
| `AaFZMuQhZ9JThwxqrsyh` | 32 | Fichier 0755 ensuite attribué à un propriétaire étranger et rejeté |
| `AaFZMuQhZ9JThwxqrsyi` | 58 | Entrée Docker de fixture dans le /usr/bin tmpfs vide du conteneur, pas un binaire hôte |
| `AaFZMuQhZ9JThwxqrsyj` | 64 | Plugin de fixture 0755 dans le namespace privé ; contrôle de cible protégée |
| `AaFZMuQhZ9JThwxqrsyk` | 67 | Config 0666 volontairement refusée avant toute exécution |

Ces permissions constituent les données du test négatif, sous tmpfs du conteneur rootfs readonly, réseau none, sans socket Docker ni clé de production et avec source montée readonly. Les fichiers dangereux ne sont pas exécutés ; les scénarios démontrent leur refus, puis le conteneur est supprimé. Cette justification est proposée à la revue : **aucune nouvelle décision de faux positif ou de risque accepté n’est prise au nom du propriétaire**, aucune annotation n’est fermée ni abaissée. Les quatre acceptations IL-5.8 ne sont pas étendues à ces sept ID.

La relecture du HEAD documentaire 0f71704 a ajouté **AaFZl_1PcPSyTboN_x_L**, json:S6418, sévérité **BLOCKER**, dans `docs/evidence/IL-5.11R/F-artifact-receipt.json:26`. La valeur signalée est exactement le SHA256 du fichier **public** `capabilities/secrets/index.js`, recalculé indépendamment : `b872fa5cdd6868d0b89f17038aa445a8c709e675f4e82452fb7283647d48c432`. Ce n’est ni une clé ni un mot de passe, ni le hash d’un credential de déploiement. Le contrôle de clôture a détecté l’ID supplémentaire avant de conclure ; son contexte est maintenant examiné. Le reçu est conservé sans changement destiné à masquer l’alerte. [Preuve individuelle](evidence/IL-5.11R/G-public-digest-annotation-review.json). État Sonar **OPEN** ; décision de disposition propriétaire **en attente**, aucune mutation ni changement de sévérité. Le caractère public et reproductible de la valeur est un fait vérifié, pas une acceptation globale de diagnostics de secrets.

Les cinq autres annotations sont S9382 dans l’observation séquentielle services, S2681 sur des wrappers de tests et S7723 sur Error() historique. Elles sont inventoriées dans le JSON, avec leurs états OPEN. Elles ne démontrent pas une substitution ni un changement du contrôle de flux ; leur traitement de lisibilité reste distinct. Les annotations de complexité du resolver et du helper ainsi que du regex d’allowlist initial ont disparu après extraction en fonctions internes et séparation de prédicats équivalents, avec tests de refus et de packaging conservés. Pas de suppression de règle, exclusion ou baseline régénérée.

## Limites et décision attendue

Les programmes système et leurs ancêtres contrôlés par root restent une autorité de confiance ; root ou un compte de qualification déjà compromis et la fenêtre TOCTOU ne sont pas neutralisés par de simples stat/exec. La préparation CI protège l’installation de la VM dédiée sans modifier ses octets ni introduire d’exception de validation. Le client ACME explicitement fourni conserve son hash attendu et est revérifié avant chaque appel.

Les 227 annotations historiques ne sont pas globalement acceptées. Les autres alertes et la disponibilité des inventaires globaux relèvent encore de la reprise IL-5.11. Revue du code, des sept contextes S2612, du reçu S6418 et des réserves requise avant une décision d’intégration ; aucune fusion, disposition Sonar administrative ou publication n’est exécutée ici.
