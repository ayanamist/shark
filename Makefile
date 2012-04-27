
JSCOVERAGE="./build/bin/jscoverage"

init:
	npm install
	node ./build/makeconf.js

test: init
	./node_modules/mocha/bin/mocha --reporter spec --timeout 5000 test/unit/*.js

func: init
	-./node_modules/mocha/bin/mocha --reporter spec --timeout 10000 test/func/*.js
	ps ux | grep node | grep -v grep | awk '{print $$2}' | xargs kill -9 

cov: clean init
	@/bin/bash ./build/jscoverage.sh
	-mv lib lib.bak && $(JSCOVERAGE) lib.bak lib 
	-./node_modules/mocha/bin/mocha --reporter html-cov --timeout 5000 test/unit/*.js > ./build/coverage.html
	-rm -rf lib && mv lib.bak lib

clean:
	-rm -rf build/coverage.html
	-rm -rf log/*
	-@find test/unit/etc/ | xargs rm -rf

.PHONY: test
