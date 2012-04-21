
JSCOVERAGE="./node_modules/visionmedia-jscoverage/jscoverage"

init:
	npm install
	node ./build/makeconf.js

test: init
	./node_modules/mocha/bin/mocha --reporter spec --timeout 5000 test/unit/*.js

func: init
	-./node_modules/mocha/bin/mocha --reporter spec --timeout 10000 test/func/*.js
	ps ux | grep node | grep -v grep | awk '{print $$2}' | xargs kill -9 

cov: clean init
	@npm install visionmedia-jscoverage
	-mv lib lib.bak && $(JSCOVERAGE) lib.bak lib 
	-./node_modules/mocha/bin/mocha --reporter html-cov --timeout 5000 test/unit/*.js > ./build/coverage.html
	-rm -rf lib && mv lib.bak lib

clean:
	-rm -rf build/coverage.html
	-rm -rf log/*
	-@find etc -type f | grep -v svn | xargs rm -f
	-@find test/unit/etc/ | xargs rm -f

.PHONY: test
