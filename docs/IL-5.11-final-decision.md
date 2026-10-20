# IL-5.11 — Rapport d’arrêt et décision de publication

Statut : **BLOCKED_SECURITY**. Date : 20 octobre 2026, Europe/Paris. A est PASS ; B est arrêté sur un risque conditionnel nécessitant une décision supplémentaire du propriétaire. C, D et E ne sont pas poursuivis. Ce rapport d’arrêt ne se présente pas comme une étape F de publication satisfaisante.

## Matrice de décision

| Critère | État et preuve |
| --- | --- |
| Source canonique | PASS : main `9e4166618ca519e5d9b9e58f5191d37c5fd56462`, aucun commit ultérieur observé |
| Provenance | PASS : archive canonique et 40 membres comparés au Git et au reçu Debian |
| Artefact reproductible | Nouveau pack identique au candidat IL-5.10 ; double construction D non rejouée |
| Contrats publics | Identité des fichiers PASS ; tests de contrats non rejoués en D |
| Consommateur isolé | Installation du tarball pour quatre reproductions B ; qualification complète et types non rejoués |
| Quality | Preuves historiques positives conservées ; pas de nouvelle qualification C après l’arrêt |
| CodeQL | LIMITED : exécution/publication historiques connues ; inventaire global non réputé accessible |
| Inventaire de sécurité | 227 OPEN disponibles, 23 VULNERABILITY examinées individuellement ; décision de risque BLOCKED |
| Vulnérabilités affectant le package | Cinq alertes S4036 distribuées : risque PATH conditionnel, non accepté ; pas d’attaque distante démontrée |
| Publication npm | Bloquée par sécurité ; droits/compte/provenance de publication non évalués à E |
| Réserves historiques | Sonar externe toujours actif ; aucune clôture ni règle modifiée |
| Impact Debian | 40 empreintes égales au pin aa9057f ; aucune modification du verrou, aucune nouvelle acceptation intégrée déclarée |

## Motif précis

Les commandes distribuées Docker/ss/OpenSSL héritent du PATH appelant. Sur le package exact, quatre scénarios montrent la sélection de substituts ; un OpenSSL substitué permet notamment de déclarer valide une chaîne refusée avec l’exécutable système. Cette observation suppose que l’environnement de lancement est hostile : ni contrôle distant du PATH ni élévation entre UID ne sont établis.

L’API est déjà documentée comme une opération d’opérateur de confiance. Néanmoins, les quatre faux positifs acceptés en IL-5.8 ne couvrent pas ces points PATH. Les 18 alertes PATH (cinq distribuées et 13 de test) sont donc **ACCEPTED_RISK_PENDING_OWNER**, et non des risques acceptés ou des faux positifs. Cinq autres alertes de test ont une justification contextuelle de faux positif ; seule celle SMTP correspond à l’un des cas déjà approuvés. Aucun état Sonar n’est changé.

Voir [inventaire des 23](IL-5.11-security-inventory.md), [analyse individuelle et reproduction](IL-5.11-security-assessment.md), [preuve de source](IL-5.11-source-audit.md). L’arrêt est imposé par le mandat dès qu’une décision de risque supplémentaire est nécessaire ; il ne résulte pas d’un manque d’autorisation pour les commandes usuelles.

## Exécutions et limites

Nouvelle archive source téléchargée et contrôlée ; nouveau pack comparé octet par octet à IL-5.10 ; comparaison des 40 fichiers avec Debian ; inventaire public et métadonnées des règles ; installation hors ligne du tarball ; **quatre scénarios de reproduction**, zéro scénario d’acceptation applicative ou navigateur exécuté dans cette mission. Aucun test TAP canonique réexécuté localement après B. Les 161 TAP et les preuves réseau/SMTP/lifecycle antérieurs demeurent historiques, sans inflation de total.

Les premières tentatives d’installation et de sous-processus ont rencontré des restrictions du sandbox, puis réussi dans le cadre autorisé. Aucun échec fonctionnel de suite canonique n’est masqué. Le code distribué et les contrats ne sont pas modifiés ; le script de reproduction est dans docs/evidence, hors npm.

## Reprise nécessaire

Le propriétaire peut faire examiner un durcissement ciblé de la résolution des exécutables, ou accepter explicitement une hypothèse d’environnement de lancement de confiance avec limites et contrôles compensatoires concrets. Ce choix doit viser les risques identifiés, sans acceptation globale des 227 annotations. La correction minimale proposée et ses tests sont détaillés dans l’évaluation B ; aucune correction de fonctionnalité n’est effectuée ici.

Reprendre ensuite C → D → E → F, avec nouvelle source/SRI si les octets changent. Une publication ne sera proposée qu’après qualification complète et autorisation explicite distincte. Pas de demande d’autorisation de publication à ce stade.

Aucune fusion documentaire, publication npm/image/tag, modification Debian/Runtime/Oxy-form, opération de production ou Oxymotion D0. Oxy-form n’est pas déclaré débloqué.

## Livraison documentaire

Branche `docs/il511-alpha3-release`, [PR #11](https://github.com/drumee/infra-layer/pull/11), ouverte vers main, non fusionnée. Au relevé du HEAD documentaire `564a6037dc3e4384653a34a75b39c804336db4f7`, les cinq jobs Quality déclenchés automatiquement par le push (unit, contracts, eslint, dependencies, packaging) sont SUCCESS et Analyze (javascript-typescript) est encore IN_PROGRESS. Ces exécutions automatiques de livraison sont distinctes des commandes locales et ne déclarent pas C/D/E exécutés ni la réserve B levée. Les seuls changements par rapport à main sont documentaires et le reproducer hors package. Le résultat final des analyses doit être relu avant toute décision ultérieure.
