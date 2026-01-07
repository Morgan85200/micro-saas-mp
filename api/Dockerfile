# Stage 1: Build
FROM composer:2 AS build
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-progress --prefer-dist
COPY . .

# Stage 2: Runtime
FROM php:8.2-cli
WORKDIR /app
COPY --from=build /app ./
RUN apt-get update && apt-get install -y \
    libzip-dev libsodium-dev unzip git mariadb-client \
    && docker-php-ext-install pdo_mysql zip sodium
EXPOSE 8080
CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]
