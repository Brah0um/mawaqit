# Variables

stack_name = mawaqit

php_sources         ?= .
phpcs_ignored_files ?= vendor/*,var/cache/*

node_version = 9.5.0

php_container_id = $(shell docker ps --filter name="$(stack_name)_php" -q)
mysql_container_id = $(shell docker ps --filter name="$(stack_name)_mysql" -q)
user = $(shell id -u)

default: console

# BASH COMMANDS

.PHONY: bash
bash:
	docker exec -it $(php_container_id) bash

.PHONY: command
command:
	docker exec -it $(php_container_id) bash -c "$(cmd)"


.PHONY: root
root:
	@if [ "root" != "$(shell whoami)" ]; then \
		echo "You have to be root"; \
		exit 1; \
	fi

.PHONY: install-hosts
install-hosts: root
	@if [ -z "$(shell grep "mawaqit.local adminer.mawaqit.local" /etc/hosts)" ]; then \
		echo "Install hosts"; \
		echo "127.0.0.1\tmawaqit.local adminer.mawaqit.local" >> "/etc/hosts"; \
	fi


# DOCKER

.PHONY: build-images
build-images:
	docker build -t mawaqit/php-fpm:7.1 docker/build/php

.PHONY: create-network
create-network:
	docker network create web_reverse_proxy --driver="overlay" --scope="swarm" || true

.PHONY: start-reverse-proxy
start-reverse-proxy: docker/reverse-proxy-docker-compose.yml create-network
	docker stack deploy -c docker/reverse-proxy-docker-compose.yml web_reverse_proxy

.PHONY: start
start: docker/docker-compose.yml build-images create-network
	docker stack deploy -c docker/docker-compose.yml $(stack_name)


# PHP CODING

.PHONY: phploc
phploc:
	docker run --rm -i -v `pwd`:/project jolicode/phaudit bash -c 'phploc $(php_sources); exit $$?'

.PHONY: phpcs
phpcs:
	docker run --rm -i -v `pwd`:/project jolicode/phaudit bash -c 'phpcs $(php_sources) --extensions=php --ignore=$(phpcs_ignored_files) --standard=PSR2; exit $$?'

.PHONY: phpcpd
phpcpd:
	docker run --rm -i -v `pwd`:/project jolicode/phaudit bash -c 'phpcpd $(php_sources); exit $$?'

.PHONY: phpdcd
phpdcd:
	docker run --rm -i -v `pwd`:/project jolicode/phaudit bash -c 'phpdcd $(php_sources); exit $$?'

.PHONY: phpcs-fix
phpcs-fix:
	docker run --rm -i -v `pwd`:`pwd` -w `pwd` grachev/php-cs-fixer --rules=@Symfony --verbose fix $(php_sources)


# UTILS

.PHONY: mod
mod:
	docker exec -it "$(php_container_id)" bash -c "chown $(user):www-data -R . && chmod g+w -R var/cache var/logs var/sessions"

.PHONY: composer-update
composer-update:
	docker exec -it "$(php_container_id)" chown $(user) -R /var/www/.composer
	docker exec -it -u $(user) "$(php_container_id)" php -d memory_limit=-1 /usr/local/bin/composer update
	make mod

.PHONY: composer-install
composer-install: mod
	docker exec -it "$(php_container_id)" chown $(user) -R /var/www/.composer
	docker exec -it -u $(user) "$(php_container_id)" php -d memory_limit=-1 /usr/local/bin/composer install --no-interaction
	make mod

.PHONY: install
install: composer-install
	docker exec -it -u $(user) "$(php_container_id)" php bin/console doctrine:database:create --if-not-exists
	docker exec -it -u $(user) "$(php_container_id)" php bin/console doctrine:schema:update --force
	docker exec -it -u $(user) "$(php_container_id)" php bin/console hautelook:fixtures:load -n


# NODE

.PHONY: yarn
yarn:
	docker run --rm -i -v `pwd`:/usr/src/app -w /usr/src/app node:$(node_version) yarn $(cmd)

.PHONY: npm
npm:
	docker run --rm -i -v `pwd`:/usr/src/app -w /usr/src/app node:$(node_version) npm $(cmd)


# SYMFONY

.PHONY: console
console:
	docker exec -it "$(php_container_id)" bash -c "php bin/console $(cmd)"

.PHONY: clear-cache
clear-cache:
	docker exec -it "$(php_container_id)" bash -c "php bin/console c:c"
	make mod
