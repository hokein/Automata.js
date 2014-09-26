TESTS = $(shell find test -type f -name "*js")
BROWERIFY_BIN = './node_modules/browserify/bin/cmd.js'

distribution:
	@mkdir -p lib
	@mkdir -p browser_demo
	@$(BROWERIFY_BIN)\
		-r './src/regparser.js':regparser > lib/regparser-browser.js 
	@cp src/regparser.js lib
	@cp lib/regparser-browser.js browser_demo

test:
	@NODE_ENV=test \
	  ./node_modules/mocha/bin/mocha\
	  $(TESTS)

clean:
	rm -f lib/*.js

.PHONY: test distribution
