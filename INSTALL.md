## Clone this repository

For this guide, we will use ```/srv/rvc``` but you can use any directory (don't forget to change ```/srv/rvc``` to your path)

```sh
git clone https://github.com/revoicechat/ReVoiceChat-AdminDashboard
```
```sh
cd ReVoiceChat-AdminDashboard/
```

## Create VirtualHost

### Create new VirtualHost from exemple
```sh
sudo cp rvc_admin.exemple.conf /etc/apache2/sites-available/rvc_admin.conf
```

### Edit apache2 ports config
```sh
sudo nano /etc/apache2/ports.conf
```
Add the following line : ```Listen 8088``` after ```Listen 80```

### Enable *VirtualHost*
```sh
sudo a2ensite rvc_admin.conf
```
```sh
sudo systemctl reload apache2
```