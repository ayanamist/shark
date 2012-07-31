JSCOVERAGE="jscoverage"

test:
	@npm install
	@node ./build/makeconf.js
	@./node_modules/mocha/bin/mocha --reporter spec --timeout 5000 test/unit/*.js

func:
	@npm install
	@node ./build/makeconf.js
	@./bin/appctl restart
	-./node_modules/mocha/bin/mocha --reporter spec --timeout 10000 test/func/*.js
	@./bin/appctl stop

cov:
	@npm install
	@node ./build/makeconf.js
	-mv lib lib.bak && $(JSCOVERAGE) lib.bak lib 
	-./node_modules/mocha/bin/mocha --reporter html-cov --timeout 5000 --ignore-leaks test/unit/*.js > ./build/coverage.html
	-rm -rf lib && mv lib.bak lib

clean:
	-rm -rf build/coverage.html
	-rm -rf log/*
	-@find test/unit/etc/ | xargs rm -rf

.PHONY: test
