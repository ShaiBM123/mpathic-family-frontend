MPATHIC-FAMILY CHATBOT APPLICATION

PRODUCTION (AWS EC2 Ubuntu user: ubuntu)

- ppk private key should be assigned to the EC2 instance and available on local machine
  for SSH connection using MobaXterm / WinSCP for remote file system access

first time EC2 flow:
sudo apt-get update -y
cd ~

<!-- The following commands might be ignored since the react build process carried outside the Ubuntu instance

curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g npm@7.24.2
sudo apt install nginx -y
git clone https://github.com/ShaiBM123/mpathic-family-frontend.git

-->

sudo mkdir -p /var/www/vhosts/mpathic-family/frontend/
sudo chmod –R 755 /var/www/vhosts/mpathic-family/frontend/
sudo chown –R www-data:www-data /var/www/vhosts/mpathic-family/frontend/

npm run build (on local machine)

- upload build folder into /var/www/vhosts/mpathic-family/frontend/

cd /etc/nginx/sites-enabled/
sudo rm -rf default
sudo vim /etc/nginx/sites-available/mpathic-family.conf

- use this configuration:
<!--
server {
    listen 80;
    listen [::]:80;
    server_name _;
    root /var/www/vhosts/mpathic-family/frontend/build;
    index index.html;
    location / {
        try_files $uri /index.html;
    }
}
-->

* Activate the configuration using the following command:
  sudo ln -s /etc/nginx/sites-available/mpathic-family.conf /etc/nginx/sites-enabled/

<!-- * To unlink:
  sudo unlink /etc/nginx/sites-enabled/mpathic-family.conf -->

sudo gpasswd -a www-data ubuntu

<!-- - Restart Nginx and allow the changes to take place: -->

sudo systemctl restart nginx
sudo service nginx restart

<!-- * To check error logs -->

sudo tail -f /var/log/nginx/error.log

<!-- - To check if nginx is working fine -->

sudo systemctl status nginx

<!-- - Enable Nginx to start on boot -->

sudo systemctl enable nginx

sudo systemctl restart nginx
sudo nginx –t (check the output on cmd – it should be successfull)

BUILD INFO:
node v16.20.2
npm 7.24.2
