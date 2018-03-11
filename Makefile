# Makerfile to controle the shit ...
#

.PHONY: tail deploy mail run install empty-bucket

PASSWORD    := $(shell cat .password)
MAIL_SENDER := $(shell cat .mail_sender)

tail:
	@gcloud app logs tail -s default --level=debug
	
deploy: install
	@cat app.tmpl|sed 's/%PASSWORD%/${PASSWORD}/'|sed 's/%MAIL_SENDER%/${MAIL_SENDER}/' > app.yaml
	@gcloud -q app deploy --promote --stop-previous-version
	@rm -f app.yaml
	
mail:
	@curl -i -X POST -d @test.msg http://localhost:8080/_ah/mail/picture@camera-185513.appspotmail.com

run:
	@dev_appserver.py app.yaml

install: lib/
	pip install --upgrade -t lib -r requirements.txt

empty-bucket:
	gsutil -m rm gs://camera-185513.appspot.com/*
