# IL-5.11-R6S — Tests de sécurité

**FAILED_QUALIFICATION.** Arrêt au premier passage, conformément à la règle d’arrêt §13 du mandat. Aucun rejeu jusqu’au succès, skip ou mock de remplacement.

Commande exécutée depuis `/tmp/il511-r6s` :

```sh
python3 -B -m unittest discover -s test/security -p '*_test.py' -v
```

Implémentation : `5a56d3d` ; les tests de cette exécution sont désormais versionnés dans `7c11bdf`. Source de base : `a02b76e4c421e96e63406d7b10edc2b76a6056c1`. UID1000, Python3.11, fixture TemporaryDirectory privée pour chaque cas. Exécution demandée avec élévation du sandbox pour Docker. Date et empreinte exacte du fichier de tests : [reçu](evidence/IL-5.11-R6S/negative-tests-first-run.json).

| Scénario | Résultat observé |
| --- | --- |
| D1 racine symlink | PASS : refus de la racine nommée et du parent symlink ; nouvelle racine distincte ; extérieur inchangé |
| D2 journal symlink | PASS : création et lecture refusées ; sentinelle inchangée |
| D3 racine/fichier préexistants | PASS : refus sans troncature ; nom avec traversal refusé |
| D4 ownership étranger | **ERROR de préparation** : conteneur chown exit1, restauration tentée exit1 ; assertion de refus pas atteinte |
| D5 permissions excessives | PASS : parent0777/1777 arbitraire et racine devenue0777 refusés |
| D6 FIFO/non-régulier | PASS : refus immédiat en création et lecture, sans blocage |
| D7 concurrence | PASS : 16 processus, 16 racines/inodes distincts et résultats propres |
| D8 nettoyage | PASS : close ferme les descripteurs, conserve la racine et le lien ; sentinelle extérieure préservée ; aucune suppression récursive dans le helper |
| D9 identité | PASS limité : roundtrip JSON du reçu D2, modes0700/0600 et ordre des onze commandes ; pas une exécution des onze commandes |
| D10 reproducer historique | PASS : les deux écritures adaptées à l’API sécurisée sont refusées et les sentinelles inchangées |
| Complément hardlink/fd fermé | PASS : lecture hardlink et écriture après close refusées |

**11 tests exécutés, dix succès, une erreur, zéro skip**, exit1. Unittest continue les cas restants après l’erreur ; aucune campagne supplémentaire n’a été lancée. Tous les tearDown ont vérifié la sentinelle et terminé sans erreur. L’échec n’établit pas une redirection persistante de sortie ; il laisse D4 non qualifié.

Le conteneur de préparation utilise une image Node épinglée, réseau none, read-only, CAP_CHOWN seule et bind d’une fixture créée par le test. Les appels chown et restauration échouent. Le harnais capture stderr mais l’exception unittest ne le restitue pas : la cause précise de cet exit1 n’est donc **pas établie**. Cette insuffisance du diagnostic doit être corrigée avant reprise ; ne pas inventer une cause d’ownership, de capacité ou d’accès Docker.

Lecture seule complémentaire : Docker info dans le sandbox échoue sur le socket ; la même lecture autorisée hors sandbox réussit (apparmor/seccomp/cgroupns). L’identité Python hors sandbox dispose de groupes supplémentaires. Cela ne prouve pas la cause de l’échec du conteneur de test. [Readback](evidence/IL-5.11-R6S/docker-readback.json).

[Journal conservé](evidence/IL-5.11-R6S/negative-tests-first-run.txt) : transcription exacte de la sortie de l’outil d’exécution, et non nouvelle capture du processus ; son SHA256 est dans le reçu. Les stderr des sous-processus Docker n’étaient pas imprimés et ne sont pas reconstruits. Le reproducer vulnérable historique avait préalablement confirmé les deux primitives dans ses propres fixtures privées : [avant correction](evidence/IL-5.11-R6S/baseline-reproduction.json).

Une étape du job Quality packaging est préparée pour cette commande, sans modification de protection ou de matrice. Elle n’a pas été exécutée sur GitHub ; aucun nouveau contrôle vert n’est revendiqué.
