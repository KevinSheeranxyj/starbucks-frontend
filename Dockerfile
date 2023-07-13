FROM nginx:1.23.2-perl
MAINTAINER jiangjian
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf