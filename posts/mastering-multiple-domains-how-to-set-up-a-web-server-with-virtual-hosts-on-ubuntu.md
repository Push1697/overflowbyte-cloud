---
title: "Mastering Multiple Domains: How to Set Up a Web Server with Virtual Hosts on Ubuntu"
subtitle: "A virtual host is a single server that can power and deploy multiple websites on one machine. It allows multiple domains or subdomains to share the same IP"
tags: ["linux-basics","linux","virtual-machine","webserver","apache","system-administration"]
slug: "mastering-multiple-domains-how-to-set-up-a-web-server-with-virtual-hosts-on-ubuntu"
canonical_url: "https://blog.overflowbyte.cloud/mastering-multiple-domains-how-to-set-up-a-web-server-with-virtual-hosts-on-ubuntu"
date: "26 Aug 2024"
cover: "https://cdn.hashnode.com/res/hashnode/image/upload/v1724695880251/2f8b420c-3477-4790-8e8f-0006645b29a1.png"
source: "hashnode"
---

In the realm of web development, hosting, and deployment, a single server often hosts multiple websites. This is where virtual hosts come in, acting as magical portals that differentiate between different domains all residing on the same machine. Today, we’ll explore the world of Ubuntu web servers and configuring virtual hosts to efficiently manage your web empire!

## **Getting Started: Web Server Installation**

First things first, we need a web server. there are a lot of web servers available in the market. but, Apache, a free and open-source powerhouse, is a popular choice for Ubuntu. Open your terminal and update the package list:

```bash
sudo apt update

or for Redhat and centos

sudo yum update
```

Now, install **Apache** with this command:

```bash
sudo apt install apache2
```

![](https://miro.medium.com/v2/resize:fit:700/1*ImbuPMTZfsUCRhDoXQ4jUA.png)

I’ve already Installed so you will see like this.

> *This will install and configure Apache on your system. after installation completed you can test the Apache by browsing the IP of the server or localhost in your ubuntu server. Below is the default Apache page. which is available on path “/var/www/html/”*

You can edit the “index.html” under our path “/var/www/html/”.

![](https://miro.medium.com/v2/resize:fit:700/0*EKK4mzGQCNzwqj6X.png)

## **Moving Forward: Hosting Your Site and Utilizing Virtual Hosts**

Now that we’ve covered the basics of setting up your web server, let’s delve into hosting your site. As your web presence expands, managing multiple sites efficiently becomes crucial. Consider a scenario where your server has a specific configuration “X,” and one of your sites only utilizes “X/4” or one core of that configuration. In such cases, valuable resources are left idle. This is where Apache’s Virtual Host functionality comes to the rescue.

## **What are Virtual Hosts?**

Virtual hosts are configuration files that instruct Apache on how to manage requests for various domains. Each virtual host file outlines a document root, indicating the directory housing the website’s files. Apache utilizes this data to serve the appropriate content when a domain is accessed.

Before we proceed with creating a Virtual Host, let’s create a website named [`overflowbyte.tech`](https://overflowbyte.tech)and direct it to our server using our system’s host entry. Additionally, we’ll create a `public_html` directory within your domain directory. This directory will store the content to be served to your visitors.

Step 1: Creating a directory for our website (domain)

```bash
mkdir /var/www/overflowbyte.tech
mkdir /var/www/overflowbyte.tech/public_html/
```

![mkdir /var/www/overflowbyte.tech](https://miro.medium.com/v2/resize:fit:531/1*-EwNrHlS0rK4WqwU7SDyaw.png)

Now go to our created directory and create an `index.html` file.

```bash
cd /var/www/overflowbyte.tech/public_html
nano index.html
```

after creating `index.html`paste the below HTML code

```bash
<html>
<head>
 <title> Welcome to overflowbyte.tech </title>
</head>
<body>
 <p> I'm running this website on an Ubuntu Server server!
</body>
</html>
```

We have created our own site and our default `index.html`page and before moving with our Virtual Host file to browse our website we are going to setup the permission as per the `USER` because we have created the above directory and file with the ownership of ***root*** user. If you want your regular user to be able to modify files in these web directories, you can change the ownership for a particular user with these commands:

```bash
sudo chown -R $USER:$USER /var/www/overflowbyte.tech/public_html
```

The `$USER` variable will take the value of the user you are currently logged in as when you press `ENTER`. By doing this, the regular user now owns the `public_html` subdirectories where you will be storing your content.

You should also modify your permissions to ensure that read access is permitted to the general web directory and all of the files and folders it contains so that the pages can be served correctly:

```bash
sudo chmod -R 755 /var/www
```

Your web server now has the permissions it needs to serve content, and your user should be able to create content within the necessary folders. The next step is to create content for your virtual host sites.

Otherwise, we won’t be able to browse our newly created website because server doesn’t know for which site this request is? and will display our default page of Apache.

# **Creating Virtual Host Files**

Here’s where the magic happens! Let’s create a virtual host file for a domain named “overflowbyte.tech”. Virtual host files are instrumental as they specify the precise configuration of your virtual hosts, guiding the Apache web server on how to respond to different domain requests.

Apache comes with a default virtual host file called `000-default.conf`. You can copy this file to create virtual host files for each of your domains.

Since we’re setting this up locally, we’ll need to add a Host entry in our system to direct our domain [`overflowbyte.tech`](https://overflowbyte.tech) to our VM’s IP.

I’ve already done my Host entry to point to my server, as I don’t want my browser to query DNS outside of my system. you can also learn how to create Host entry by following [Host entry tutorial](https://www.manageengine.com/network-monitoring/how-to/how-to-add-static-entry.html).

Moving on first step to create [Virtual Host](https://httpd.apache.org/docs/2.4/vhosts/examples.html). Copy the default configuration file over to the first domain:

1. Copy the Default Configuration:  
    Start by copying the default Apache configuration file:
    

```bash
sudo cp /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/overflowbyte.tech.conf
```

Be aware that the default Ubuntu configuration requires that each virtual host file should end in `.conf`.

Open the new file in your preferred text editor with **root** privileges:

```bash
cd /etc/apache2/sites-available/
```

```bash
nano overflowbyte.tech.conf
```

Below is default file after opening in nano. (we can remove the comments in the default file). I’ve remove the comments and below is the file. If you want to see default file then you can check `000-default.conf`file in `/etc/apache2/site-available` directory.

## **You’ll see a bunch of directives. Here’s what to modify:**

* **ServerAdmin:** Replace this with your email address.
    
* **DocumentRoot:** This should point to the directory containing your website’s files (e.g., /var/www/mydomain.com).
    
* **ServerName:** Specify the domain name this virtual host handles (e.g., mydomain.com).
    

```bash
<VirtualHost *:80>
        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/html
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Now we will start editing our virtual host file.

Moving forward we should have our email in `ServerAdmin` so users can reach us in case Apache experiences any error:

```bash
ServerAdmin admin@overflowbyte.tech
```

We would also need to set the `DocumentRoot` directive to point to the directory where our site files are hosted on:

```bash
DocumentRoot /var/www/overflowbyte.tech/public_html
```

The default file doesn’t come with a `ServerName` directive, so we’ll have to add and define it by adding this line below the last directive. It establishes the base domain for the virtual host definition.:

```bash
ServerName overflowbyte.tech
```

This ensures people reach the right site instead of the default one when they type in [`overflowbyte.tech`](https://overflowbyte.tech).

Now that we’re done configuring our site, below is the our Virtual Host file for domain “[overflowbyte.tech](https://overflowbyte.tech)”, let’s save and activate it in the next step!

```bash
<VirtualHost *:80>
        ServerAdmin webmaster@localhost
        ServerName  overflowbyte.tech
        DocumentRoot /var/www/overflowbyte.tech/public_html

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

</VirtualHost>
```

## **Enabling the New Virtual Host Files**

Now we have created your virtual host files, we must enable them to access. Apache includes some tools that allow you to do this.

We’ll be using the `a2ensite` tool to enable each of your sites. If you would like to read more about this script, you can refer to the [`a2ensite` documentation](https://manpages.debian.org/jessie/apache2/a2ensite.8.en.html).

```bash
sudo a2ensite overflowbyte.tech.conf
```

![](https://miro.medium.com/v2/resize:fit:700/1*_PsnxdtWrq6xuXdGe00WXA.png)

But before browsing our created website we first need to disable the defualt apache2 page. We can use the following command to disable:

```bash
sudo a2dissite 000-default.conf
```

Now the time to take the changes effect by reloading apache2. As it becomes necessary to restart any service, whenever need to change and reflect them.

```bash
sudo systemctl reload apache2
```

![](https://miro.medium.com/v2/resize:fit:698/1*cVKyHPAKuXcRII7F52ftRg.png)

Finally we need to see the result of all the work done right!

![](https://miro.medium.com/v2/resize:fit:700/1*P0cqf6a4cjIAiLbt0RzTdA.png)

**Congratulations!** You’ve successfully configured a virtual host on your Ubuntu web server. Now you can repeat this process to create virtual hosts for all your domains, keeping your web empire organised and thriving!

**Bonus Tip:** Don’t forget to set up your domain name to point to your server’s IP address for users to access your websites from the outside world.
