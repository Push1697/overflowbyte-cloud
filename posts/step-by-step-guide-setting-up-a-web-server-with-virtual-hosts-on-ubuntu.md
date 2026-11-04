---
title: "Step-by-Step Guide: Setting Up a Web Server with Virtual Hosts on Ubuntu"
subtitle: "Learn to set up Apache Virtual Hosts on Ubuntu to host multiple websites effectively with this comprehensive step-by-step guide"
tags: ["ubuntu","server","webserver","hosting","apache","linux-for-beginners"]
slug: "step-by-step-guide-setting-up-a-web-server-with-virtual-hosts-on-ubuntu"
canonical_url: "https://blog.overflowbyte.cloud/step-by-step-guide-setting-up-a-web-server-with-virtual-hosts-on-ubuntu"
date: "30 Sept 2025"
cover: "https://cdn.hashnode.com/res/hashnode/image/stock/unsplash/xbEVM6oJ1Fs/upload/0e1cec1ebea9bffcdfa89803bbec8e8c.jpeg"
source: "hashnode"
---

Ever wondered how a single server can host dozens of websites without breaking a sweat? The secret lies in **Virtual Hosts** – Apache's elegant solution for managing multiple domains on one machine.

In this hands-on guide, I'll walk you through setting up Apache Virtual Hosts on Ubuntu Server, from installation to deployment. By the end, you'll be hosting multiple websites like a pro!

---

## Why Virtual Hosts Matter

Picture this: You have a powerful server with plenty of resources, but you're only using a fraction of its capacity. Virtual Hosts allow you to:

* **Host multiple websites** on a single server
    
* **Maximize resource utilization** instead of leaving cores idle
    
* **Organize projects efficiently** with separate configurations
    
* **Save costs** by consolidating infrastructure
    

Let's dive in and unlock your server's full potential.

---

## Step 1: Installing Apache Web Server

First, we need a web server. Apache is battle-tested, free, and perfect for Ubuntu systems.

### Update Your Package List

```bash
sudo apt update
```

For RedHat/CentOS users:

```bash
sudo yum update
```

### Install Apache2

```bash
sudo apt install apache2
```

![](https://miro.medium.com/v2/resize:fit:700/1*ImbuPMTZfsUCRhDoXQ4jUA.png)

If you see the message above, Apache is already installed. That's perfectly fine!

### Verify the Installation

Open your browser and navigate to your server's IP address or `localhost`. You should see the default Apache page:

![](https://miro.medium.com/v2/resize:fit:700/0*EKK4mzGQCNzwqj6X.png)

**Pro Tip:** The default Apache page is located at `/var/www/html/`. You can edit `index.html` in this directory to customize it.

---

## Step 2: Creating Your Website Directory Structure

Now let's set up a proper directory for our new website. We'll use `overflowbyte.tech` as an example.

### Create the Domain Directory

```bash
mkdir -p /var/www/overflowbyte.tech/public_html
```

![mkdir /var/www/overflowbyte.tech](https://miro.medium.com/v2/resize:fit:531/1*-EwNrHlS0rK4WqwU7SDyaw.png)

### Create a Simple HTML Page

Navigate to your new directory and create an `index.html` file:

```bash
cd /var/www/overflowbyte.tech/public_html
nano index.html
```

Add this HTML content:

```html
<html>
<head>
  <title>Welcome to overflowbyte.tech</title>
</head>
<body>
  <h1>Success! 🎉</h1>
  <p>I'm running this website on an Ubuntu Server!</p>
</body>
</html>
```

### Set Proper Permissions

Grant your user ownership of the directory:

```bash
sudo chown -R $USER:$USER /var/www/overflowbyte.tech/public_html
```

Set read permissions for the web server:

```bash
sudo chmod -R 755 /var/www
```

**Why This Matters:** Without proper permissions, Apache won't be able to serve your content, and you won't be able to modify files easily.

---

## Step 3: Configuring Virtual Hosts

Here's where the magic happens! Virtual Host configuration files tell Apache how to handle requests for different domains.

### Copy the Default Configuration

```bash
sudo cp /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/overflowbyte.tech.conf
```

**Important:** Ubuntu requires virtual host files to end with `.conf`.

### Edit Your Virtual Host File

```bash
cd /etc/apache2/sites-available/
nano overflowbyte.tech.conf
```

Here's what the default configuration looks like (with comments removed):

```apache
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

### Customize Your Configuration

Replace it with this configuration:

```apache
<VirtualHost *:80>
    ServerAdmin admin@overflowbyte.tech
    ServerName overflowbyte.tech
    DocumentRoot /var/www/overflowbyte.tech/public_html
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

**Key Directives Explained:**

* **ServerAdmin:** Your contact email for error notifications
    
* **ServerName:** The domain name this virtual host handles
    
* **DocumentRoot:** Path to your website's files
    
* **ErrorLog/CustomLog:** Logging configuration for debugging
    

---

## Step 4: Enabling Your Virtual Host

Now let's activate your new virtual host configuration.

### Enable the New Site

```bash
sudo a2ensite overflowbyte.tech.conf
```

![](https://miro.medium.com/v2/resize:fit:700/1*_PsnxdtWrq6xuXdGe00WXA.png)

### Disable the Default Site

To avoid conflicts, disable Apache's default configuration:

```bash
sudo a2dissite 000-default.conf
```

### Reload Apache

Apply your changes by reloading Apache:

```bash
sudo systemctl reload apache2
```

![](https://miro.medium.com/v2/resize:fit:698/1*cVKyHPAKuXcRII7F52ftRg.png)

---

## Step 5: Testing Your Virtual Host

### Add a Host Entry (For Local Testing)

Since we're testing locally, add this entry to your `/etc/hosts` file:

```plaintext
127.0.0.1  overflowbyte.tech
```

On Windows, edit: `C:\Windows\System32\drivers\etc\hosts`

### Browse Your Website

Open your browser and navigate to `http://overflowbyte.tech`

![](https://miro.medium.com/v2/resize:fit:700/1*P0cqf6a4cjIAiLbt0RzTdA.png)

**🎉 Congratulations!** Your virtual host is live and serving content.

---

## Pro Tips for Production

### 1\. **Point Your Domain to Your Server**

Update your domain's DNS records to point to your server's public IP address.

### 2\. **Enable SSL with Let's Encrypt**

```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d overflowbyte.tech
```

### 3\. **Create Multiple Virtual Hosts**

Repeat the process for each domain you want to host. Each gets its own `.conf` file!

### 4\. **Monitor Your Logs**

Check logs regularly for issues:

```bash
tail -f /var/log/apache2/error.log
```

---

## Troubleshooting Common Issues

**Problem:** Browser shows "Connection Refused"  
**Solution:** Check if Apache is running: `sudo systemctl status apache2`

**Problem:** Shows default Apache page instead of your site  
**Solution:** Verify your virtual host is enabled: `sudo a2ensite overflowbyte.tech.conf`

**Problem:** 403 Forbidden Error  
**Solution:** Check directory permissions: `sudo chmod -R 755 /var/www/overflowbyte.tech`

---

## Wrapping Up

You've just learned how to:

* Install and configure Apache on Ubuntu
    
* Create organized directory structures for multiple websites
    
* Set up virtual hosts to manage different domains
    
* Enable and test your configurations
    

Virtual Hosts are the backbone of efficient web hosting. Master this skill, and you'll be able to manage entire web ecosystems from a single server.

---

## Need Help with Your Server Setup?

Setting up production-ready web infrastructure can be complex. If you need professional assistance with:

* **Server deployment and configuration**
    
* **WordPress or application hosting**
    
* **SSL certificate setup**
    
* **Performance optimization**
    
* **Migration from other providers**
    

**I'm here to help!** Reach out to me at **overflowbyte.tech@yahoo.com** or visit my portfolio at [pushpendra.overflowbyte.cloud](http://pushpendra.overflowbyte.cloud)

With experience in server administration and cloud infrastructure, I specialize in building reliable, scalable hosting solutions for businesses.

---

📖 **Read the original article:** [Mastering Multiple Domains on Medium](https://overflowbyte.medium.com/mastering-multiple-domains-how-to-set-up-a-web-server-with-virtual-hosts-on-ubuntu-58fd58abce9b?source=friends_link&sk=cc065a4b5851c5c51b36f8e5255231c5)

💼 **Connect with me:**  
[LinkedIn](https://linkedin.com/in/pushpendra16) | [GitHub](https://github.com/push1697) | [Email](mailto:push1697@gmail.com)

---

*Happy hosting! 🚀*
