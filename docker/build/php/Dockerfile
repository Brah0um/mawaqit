FROM php:7.1-fpm

RUN apt-get update

# git client, mysql-client, wkhtmltopdf
RUN apt-get install -y git mysql-client wkhtmltopdf unzip libmagickwand-dev

# intl, zip
RUN apt-get install -y zlib1g-dev libicu-dev g++ libxml2-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl zip

# pdo, pdo_mysql
RUN docker-php-ext-install pdo pdo_mysql

# redis
RUN pecl install redis && docker-php-ext-enable redis

# mcrypt, gd, iconv
RUN apt-get install -y libfreetype6-dev libjpeg62-turbo-dev libmcrypt-dev libpng-dev \
&& docker-php-ext-install iconv mcrypt \
&& docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
&& docker-php-ext-install gd

# gmp, bcmath
RUN apt-get install -y libgmp-dev \
&& docker-php-ext-install gmp bcmath

# php imagemagick
RUN apt-get update && apt-get install -y libmagickwand-6.q16-dev --no-install-recommends \
&& ln -s /usr/lib/x86_64-linux-gnu/ImageMagick-6.8.9/bin-Q16/MagickWand-config /usr/bin \
&& pecl install imagick \
&& echo "extension=imagick.so" > /usr/local/etc/php/conf.d/ext-imagick.ini

# xdebug
RUN pecl install xdebug && docker-php-ext-enable xdebug

# install composer
COPY install-composer.sh /tmp/install-composer.sh
RUN chmod +x /tmp/install-composer.sh \
	&& bash /tmp/install-composer.sh
VOLUME /var/www/.composer
ENV COMPOSER_HOME /var/www/.composer

CMD ["php-fpm"]
