#!/bin/bash

cd /home/pi/mawaqit

wget -q --spider http://google.com

if [ $? -ne 0 ]; then
    echo "offline";
    exit 1;
fi

git fetch

currenttag=$(git describe --tags --abbrev=0)
latesttag=$(git describe --tags $(git rev-list --tags --max-count=1))

if [ "$currenttag" != "$latesttag" ]; then

    echo checking out ${latesttag}
    git checkout ${latesttag}

    version=`echo $latesttag | sed 's/-.*//'`
    sed -i "s/version: .*/version: $version/" app/config/parameters.yml
    sudo rm-rf var/cache/* var/logs/*
    composer install --optimize-autoloader --no-interaction
    bin/console assets:install --env=prod --no-debug
    bin/console assetic:dump --env=prod --no-debug
    bin/console doctrine:migrations:migrate -n --allow-no-migration
    sudo chmod 777 -R var/cache var/logs
else
    echo "You are on the last version :)"
fi
