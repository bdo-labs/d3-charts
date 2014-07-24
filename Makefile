
#
# Path
#

SHELL:=/bin/bash
PATH:=./node_modules/.bin:$(PATH)


#
# Settings
#

REPORTERS?=progress


#
# Sources
#

SRC:=$(wildcard lib/*)
TESTS:=$(wildcard test/**/*.test.js)


#
# Targets
#

all: build

build: node_modules $(SRC)
	atomify --output $@/$@
	@echo ""
	@echo "    d3-charts was built!"
	@echo ""

node_modules: package.json
	npm install

test: build
	karma start --reporters $(REPORTERS)

clean:
	rm -fr build

.PHONY: clean test

