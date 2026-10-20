# IL-5.11-E — Plan conditionnel de publication

Statut : **NOT_EXECUTED / PUBLICATION BLOQUÉE PAR B**. Les droits et moyens de publication ne sont pas vérifiés après l’arrêt de sécurité. Aucun appel `npm publish`, changement de dist-tag, tag Git ou publication d’image n’a lieu.

Les métadonnées examinées en A proposent `@drumee/infra-layer@0.1.0-alpha.3`, accès public, dist-tag **next**. Ce canal proposé doit être revérifié avec le propriétaire ; il ne doit pas déplacer `latest`. Le compte de publication, ses droits effectifs, son mécanisme d’authentification et la provenance supportée restent **à déterminer**, sans demander ni enregistrer de jeton dans Git.

La disponibilité de la version sur le registre n’est pas réinterrogée à E : l’étape n’est pas atteinte. Le relevé IL-5.10 indiquait alpha.3 absente, next=alpha.2, latest=alpha.1 ; ce relevé ancien n’est pas une garantie actuelle de disponibilité.

Après levée des risques B et qualifications C/D, vérifier de nouveau le registre, la version non publiée, les droits du compte, l’identité de l’archive, les scripts, l’allowlist et les secrets, puis proposer le mécanisme de publication et sa provenance effectivement disponibles. Ne jamais interchanger SRI de l’archive source et du tarball npm.

Même avec un futur statut READY_FOR_PUBLICATION_AUTHORIZATION, il faudra présenter source, empreintes, compte, canal et risques résiduels puis obtenir une **autorisation explicite distincte** du propriétaire. La présente mission ne l’accorde pas.

Le handoff futur conserve Debian sur sa source immuable tant qu’une migration npm n’est pas séparément décidée et testée. Oxy-form doit encore sélectionner la distribution, qualifier son environnement, plugin et SMTP réel ; Nginx/TLS hôte et routes natives restent inchangés, formulaires désactivés jusqu’à acceptation. Aucun OF-01R ni Oxymotion D0 n’est exécuté.
