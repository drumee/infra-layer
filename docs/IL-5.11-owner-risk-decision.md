# IL-5.11 — Décision propriétaire sur la réserve SMTP alpha.3

**SMTP_RESIDUAL_UNCERTAINTY_ACCEPTED_FOR_ALPHA3**.

Enregistrement UTC : 2026-10-21T14:32:37+00:00.

Décision explicite reçue dans le mandat IL-5.11-Release-Review du propriétaire, enregistrée séparément des conclusions techniques D2. Elle autorise la poursuite de l’intégration conditionnelle de PR #15 ; **aucune publication npm ni production n’est autorisée**.

## Formulation exacte

> J'accepte explicitement la réserve d'intermittence SMTP pour la release expérimentale alpha.3, dans les limites documentées par IL-5.11-D2.

## Incident et portée acceptée

L’acceptation concerne exclusivement le timeout SMTP historique avant réception du greeting, l’échec consécutif de lecture de capture au scénario 16, l’absence de cause première établie et l’impossibilité de démontrer la disparition définitive d’une intermittence, pour la release expérimentale alpha.3.

Le premier Services a produit 15/17 : scénario 15 ETIMEDOUT / Greeting never received, puis scénario 16 fetch failed. Le flux du harnais montre que l’exception du scénario 15 empêche le redémarrage capture prévu avant la lecture du scénario 16. Cette cascade ne démontre pas la cause du timeout. L’échec et ses horodatages sont conservés dans les [preuves initiales](evidence/IL-5.11-resume/D-stop.json) et le [log](evidence/IL-5.11-resume/D-services-failed.txt).

Rejeu historique : 17/17 sur les mêmes octets/délais. Campagne D2 fixée avant exécution : **3 × 17/17**, zéro skip ; passage Services intégré supplémentaire **17/17**. Aucun défaut distribué persistant démontré, aucun timeout artificiellement augmenté ou mécanisme TLS/SASL/DKIM contourné. Classification technique conservée : **INTERMITTENCE_NOT_REPRODUCED**, cause inconnue ; l’acceptation n’est pas une correction et ne modifie pas le constat D_QUALIFIED_WITH_RESIDUAL_UNCERTAINTY.

## Preuves et limites statistiques

[Analyse D2 et hypothèses](IL-5.11-D2-smtp-incident-analysis.md), [campagne](evidence/IL-5.11-D2/campaign-summary.json), [qualification intégrée](IL-5.11-D2-qualification.md), [87 assertions applicatives réelles](evidence/IL-5.11-D2/D2-application-report.json). Source D2 : `dbc0be5c20029374c68bdf510dfadd7da079fcf6` ; source exécutable antérieure d19e62b, 41 membres npm identiques.

Les trois essais ne démontrent pas une fiabilité statistique de rareté : mêmes hôte/cache, instrumentation pouvant influencer l’ordonnancement et faible échantillon. Sous hypothèses idéales d’indépendance/stationnarité Bernoulli, zéro échec sur trois laisse une borne supérieure unilatérale 95 % d’environ 63 % pour le taux d’échec. Cette borne ne décrit pas un taux d’échec réel estimé de 63 %. Aucun succès antérieur n’efface l’échec initial.

## Garanties réellement établies et garanties non qualifiées

Les parcours réels vérifient STARTTLS avec confiance CA/SAN, authentification SASL correcte/incorrecte, refus d’open relay, signature DKIM, conservation/reprise de file dans le scénario isolé, préservation des clés et séparation mail/DKIM. Les ports SMTP ne sont pas publics ; outils approuvés, ownership, secrets privés et nettoyage des ressources possédées sont conservés. Ces contrôles limitent le périmètre observé ; ils ne prouvent pas la cause ou l’élimination de l’intermittence.

L’acceptation **ne vaut pas** garantie de disponibilité SMTP, validation de délivrabilité Internet, validation de restauration du spool, acceptation d’une perte de messages, d’un défaut TLS, d’un open relay, de futures régressions, des risques généraux d’Infra Layer ou d’un déploiement production. **SMTP_RECOVERY_UNQUALIFIED reste applicable.** Aucun droit de modifier Debian, Server Runtime, Oxy-form, protections/scanners, tag, image publiée ou Oxymotion D0 n’est conféré.

## Conditions de nouvelle investigation

Toute nouvelle défaillance significative pendant la revue ou après intégration est examinée indépendamment de cette acceptation. Une panne récurrente/aggravée, perte de message observée, défaut TLS/SASL/DKIM, exposition réseau interdite, open relay, régression d’ownership ou autre vulnérabilité significative impose un arrêt et une nouvelle décision selon sa portée. Aucun test ignoré, timeout augmenté opportunément ou retry silencieux ne peut servir à étendre l’acceptation.

Cette décision est limitée à alpha.3 expérimentale. Elle autorise la revue/fusion uniquement si les contrôles du mandat sont satisfaits, sans contourner les règles GitHub. **La publication npm exige une décision distincte du propriétaire.** Les dispositions techniques SHA256/RSA-1024 restent des justifications de faux positifs contextualisées, distinctes de cette acceptation de réserve SMTP.
