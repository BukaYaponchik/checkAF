#!/bin/bash

# Скрипт для развертывания приложения на сервере
# Перед запуском убедитесь, что у скрипта есть права на выполнение (chmod +x deploy.sh)

# Остановка выполнения скрипта при ошибках
set -e

# Настраиваемые переменные
DEPLOY_DIR="/var/www/checkaf"
NGINX_CONF="/etc/nginx/sites-available/checkaf"
NGINX_ENABLED="/etc/nginx/sites-enabled/checkaf"

# Создание директории для развертывания, если еще не существует
sudo mkdir -p $DEPLOY_DIR

# Копирование файлов сборки в директорию развертывания
sudo cp -r dist/* $DEPLOY_DIR/

# Создание и настройка конфигурации Nginx
sudo cp server-nginx.conf $NGINX_CONF
# Проверка, существует ли символическая ссылка
if [ ! -e $NGINX_ENABLED ]; then
    sudo ln -s $NGINX_CONF $NGINX_ENABLED
fi

# Проверка конфигурации Nginx
sudo nginx -t

# Перезапуск Nginx для применения изменений
sudo systemctl restart nginx

echo "Развертывание завершено успешно!"
echo "Приложение доступно по IP-адресу сервера."
