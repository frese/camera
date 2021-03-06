# Makefile to control the shit ...
#

.PHONY: tail deploy mail run install empty-bucket

PASSWORD    := $(shell cat .password)
MAIL_SENDER := $(shell cat .mail_sender)
SECRET_KEY  := $(shell cat .secret_key)

profile:
	@gcloud config configurations activate default

tail:
	@gcloud app logs tail -s default --level=debug
	
deploy: profile install
	@cat app.tmpl|sed -e 's/%PASSWORD%/${PASSWORD}/' -e 's/%MAIL_SENDER%/${MAIL_SENDER}/' -e 's/%SECRET_KEY%/${SECRET_KEY}/' > app.yaml
	@gcloud -q app deploy --promote --stop-previous-version
	@rm -f app.yaml
	
mail:
	@curl -i -X POST -d @test.msg http://localhost:8080/_ah/mail/picture@camera-185513.appspotmail.com

run:
	@dev_appserver.py app.yaml

install: lib/
	echo > lib/__init__.py
	pip install --upgrade -t lib -r requirements.txt

empty-bucket:
	gsutil -m rm gs://camera-185513.appspot.com/*
