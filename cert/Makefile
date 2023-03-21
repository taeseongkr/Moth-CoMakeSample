#
# Makefile for cert handling
#
#DOMAIN=gomandoo.duckdns.org
#DOMAIN=cojam.ddns.net
#DOMAIN=localhost
DOMAIN=cobot.center
usage:
	@echo "usage: make [cert] for $(DOMAIN)"
#-------------------------------------------------------------------------
cert:
	@echo "> make (cert) [local|public] [update|copy]"
#-------------------------------------------------------------------------
cert-local cl:
	@echo "> make (cert-local) [update|copy]"

cert-local-update clu:
	mkcert -install
	mkcert localhost 127.0.0.1

cert-local-copy clc:
	mv localhost+1.pem cert.pem
	mv localhost+1-key.pem key.pem
#-------------------------------------------------------------------------
cert-public cp:
	@echo "> make (cert-public) [update|copy]"

cert-public-update cpu:
	sudo certbot certonly --force-renew --cert-name $(DOMAIN)

cert-public-copy cpc:
	cp /etc/letsencrypt/live/$(DOMAIN)/fullchain.pem cert.pem
	cp /etc/letsencrypt/live/$(DOMAIN)/privkey.pem key.pem
#-------------------------------------------------------------------------
cert-copy cc:
	@echo "> make (cert-copy) [gomandoo|cojam|localhost]"

cert-copy-cojam ccj:
	sudo cp /etc/letsencrypt/live/cojam.ddns.net/fullchain.pem cert.pem
	sudo cp /etc/letsencrypt/live/cojam.ddns.net/privkey.pem key.pem
cert-copy-local ccl:
	sudo cp /etc/letsencrypt/live/localhost/fullchain.pem cert.pem
	sudo cp /etc/letsencrypt/live/localhost/privkey.pem key.pem
#-------------------------------------------------------------------------
pkg-install pi:
	@echo "> make (pkg-install) [mac|ubuntu]"

pkg-install-mac pim:
	brew install certbot

pkg-install-ubuntu piu:
	sudo apt install certbot
#-------------------------------------------------------------------------
