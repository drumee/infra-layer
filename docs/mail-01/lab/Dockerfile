# MAIL-01 hypothesis laboratory only. No ports, production mounts or SMTP egress.
# Verify this local tag's full image ID against the evidence before building.
FROM drumee-minimal-application-tools:ff6e6b399128e633
USER root
RUN printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d && chmod 755 /usr/sbin/policy-rc.d \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends dovecot-imapd dovecot-lmtpd python3 \
 && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["python3", "/lab/probe.py"]
