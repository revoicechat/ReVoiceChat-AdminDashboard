FROM nginxinc/nginx-unprivileged:alpine

COPY ./www /usr/share/nginx/html
EXPOSE 5001

RUN echo 'server { \
    listen 5001; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]