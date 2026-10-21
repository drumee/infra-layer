# IL-5.11-Resume — Évaluation de sécurité B

État initial de cette évaluation : **IN_PROGRESS**. Contrôle B non déclaré PASS avant correction et qualification.

Base distante observée : `8f297d8f676706f052a24ce4e875d91b76555b91`. Branche dédiée : `feat/il511-resume-final-qualification`. Aucun AGENTS.md dans les ancêtres ou l’arbre du dépôt ; checkout local préexistant préservé via worktree isolé.

Les documents `docs/IL-5.11-security-inventory.md` et `docs/IL-5.11-security-assessment.md` sont absents de main. Ils ont été retrouvés et lus sur la branche historique `docs/il511-alpha3-release`, source `73fc06059d529773e752ed9ce1c2b7ce35ee65b0` : [inventaire](https://github.com/drumee/infra-layer/blob/73fc06059d529773e752ed9ce1c2b7ce35ee65b0/docs/IL-5.11-security-inventory.md), [évaluation](https://github.com/drumee/infra-layer/blob/73fc06059d529773e752ed9ce1c2b7ce35ee65b0/docs/IL-5.11-security-assessment.md). Ils ne sont pas présentés comme des documents intégrés ou des analyses actuelles. Les trois autres rapports demandés et `IL-5.11-resume-status.md` sont lus sur le main réel. Les dispositions IL-5.11R, 18 PATH CLOSED/FIXED et matrice des 13 Sonar sont réutilisées comme preuves historiques nommées, sans acceptation globale.

| Diagnostic CodeQL | Constat initial | Décision de travail |
| --- | --- | --- |
| js/polynomial-redos ; lib/validation.js:90 | Entrée adapter.image non bornée ; deux répétitions ambiguës ; coût multiplié par environ quatre lorsque la longueur double, jusqu’à 835 ms à N=32768 | **CONFIRMED_DEFECT**, correction ciblée nécessaire avant contrôle B |
| js/insufficient-password-hash ; lib/spec.js:32 | SHA256 de contenu/révisions ; inventaire des usages en cours, incluant la configuration privée Redis contenant un credential | **NEEDS_INVESTIGATION**, ne pas conclure que toutes les entrées sont publiques |
| js/insufficient-key-size ; test/unit/secrets.test.js:55 | RSA-1024 généré pour assertion SECRET_CORRUPTED ; fixture négative absente de npm | Vérification des chemins import/rotate/read et de la non-persistance avant décision finale |

Le validateur est appelé par `lib/plan.js` (planInfrastructure v1) et reste accessible dans le sous-chemin public lib/validation. Les revalidations de plans/observations rejoignent ce chemin. Pas de borne de longueur dans plainTree, validateAdapter ou l’API publique. Un consommateur local peut fournir une chaîne arbitraire ; aucune route distante Infra Layer exposant cette saisie n’est démontrée. Une application qui transmet de telles entrées non fiables peut bloquer son event loop de manière synchrone. La validation v2 et composition disposent d’autres prédicats d’image : ils sont examinés séparément, sans leur attribuer automatiquement le défaut de ce site.

[Mesures initiales](evidence/IL-5.11-resume/B-redos-initial.json), [appels S.digest](evidence/IL-5.11-resume/B-digest-calls.txt). Aucune correction ou qualification du package n’est encore revendiquée dans ce premier commit d’analyse. Aucune fermeture administrative d’alerte, publication ou modification de consommateur.
