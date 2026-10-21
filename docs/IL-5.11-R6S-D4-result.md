# IL-5.11-R6S-D4 — Résultat

**D4_PASS**, puis **D_QUALIFIED**. Source du test corrigé : `a7f8aae6c8f1de687ff05480115a0cb257ac8aa0`, arbre propre ; clone distinct pour E au même commit. Aucun helper de production modifié pendant D4. Les preuves de l’échec initial à6f5c3ef sont conservées dans le dossier historique.

## Rejeu ciblé

2026-10-21T18:12:27Z, UID1000/GID1000. Commande : `python3 -B -m unittest discover -s test/security -p '*_test.py' -k D4 -v`. Un scénario, **15 assertions explicites**, exit0, zéro skip. [Journal complet et empreinte](evidence/IL-5.11-R6S-D4/D4-targeted/D4-targeted.json), [stdout/stderr](evidence/IL-5.11-R6S-D4/D4-targeted/D4-targeted.txt).

Le conteneur rootful épinglé reçoit uniquement CAP_CHOWN et monte le sous-répertoire du test, pas sa racine0700. Le chown réel vers65532:65532 réussit, puis stat côté opérateur confirme UID65532 distinct de1000, GID65532 et mode0755. List/read/stat réussissent avant l’assertion : ce n’est pas un refus EACCES préalable.

Les deux appels du helper, création de destination et validation d’entrée, produisent précisément **UnsafeEvidencePath: UNTRUSTED_OWNER**. OSError ne satisfait pas l’assertion. Le répertoire reste possédé par65532 jusqu’après les vérifications, son contenu est exactement la sentinelle initiale et les deux sentinelles restent intactes. La fixture possédée par le test est ensuite rendue à1000:1000 ; les conteneurs --rm se terminent normalement. TearDown vérifie la sentinelle extérieure et la disparition de la fixture temporaire, sans toucher de ressource étrangère.

## Contrôle D complet

2026-10-21T18:14:22Z : `python3 -B -m unittest discover -s test/security -p '*_test.py' -v`, exit0. **11 scénarios distincts (D1–D10 et complément hardlink/fd fermé), 86 assertions explicites**, aucun échec, erreur ou skip. Les15assertions du ciblé D4 ne sont pas ajoutées à ces86 : ce sont deux exécutions distinctes. Les appels assert* imbriqués de unittest ne sont pas recomptés. [Reçu](evidence/IL-5.11-R6S-D4/D-full/D-full.json), [journal](evidence/IL-5.11-R6S-D4/D-full/D-full.txt).

Le passage prévu depuis clone propre pour E (18:15:42Z) confirme séparément les mêmes11scénarios/86assertions sans skip : [preuve](evidence/IL-5.11-R6S-D4/E-negative/E-negative.json). Il ne remplace ni ne gomme aucun échec antérieur. Aucune relance jusqu’au premier succès : diagnostic, correction ciblée, D4, D complet puis passage E de contrôle prévus séquentiellement.

Les preuves ont été créées dans des racines EvidenceDirectory privées0700, fichiers exclusifs0600, puis exportées sans remplacement dans des dossiers nouveaux ; chaque export conserve les empreintes des octets originaux. L’environnement rootless/userns non mappé comme celui observé peut faire échouer la précondition UID65532 : il produira D4_SETUP_FAILED, jamais un skip ou PASS artificiel. Aucune capacité DAC/privileged ajoutée ; aucun contrôle d’ownership assoupli.
