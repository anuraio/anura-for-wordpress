=== Plugin Name ===
   Anura.io
   Plugin URI: https://www.anura.io/anura-script
   description: Welcome to Anura’s WordPress plug-in.  Anura is an Ad Fraud solution designed to accurately eliminate fraud to improve conversion rates.  With this plug in, you can easily set up a real-time visitor firewall to keep the fraud off of your site.  Before you can set this up, be sure to reach out to sales@anura.io to get your account set up first.
   Version: 1.0
   Tags: comments, spam, cache
   Requires at least: 4.70
   Tested up to: 5.4.1
   Requires PHP: 5.4
   License: GPLv2 or later
   Author: Anura Solutions, LLC
   Author URI: https://www.anura.io/
== Description ==

Anura is unlike most ad fraud solutions available on the market.  It concentrates on the user visiting your digital properties.

Instead of just evaluating the traffic coming to your site with broad probability scores. Anura will give you a definitive answer to whether the visitor is real or fake so you can stop paying for what is fraudulent.

With billions of analyzed clicks, client feedback, and a robust rule set, Anura has an extensive history of website generated traffic.  It is one of the only platforms that captures hundreds of data points about your traffic, so not only do you know who is visiting your web asset but also how you can refine it for better performance.

It boasts an accurate real-time interface affording clients the ability to mitigate fraud as it happens.  Which directly yields meaningful conversion improvement and a higher revenue stream. 


== Frequently Asked Questions ==

= What is Ad Fraud? =

Ad fraud is the practice of generating false interactions—viewing, clicking, or converting, for example—with a web asset for the sole purpose of directly or indirectly taking money from the advertiser. These costly interactions are not limited to malicious bots or malware; ad fraud can be carried out by humans, too. To unsuspecting users, ad fraud often appears to be legitimate, but a closer look reveals otherwise.

= Does Accuracy Matter? =

If you’re using a traffic validation company to monitor your traffic, you want them to be accurate. After all, you don’t want good clicks marked as bad and bad clicks marked as good. 
Built and fine-tuned from customer conversion data, Anura is the first real-time traffic filtration system with more accuracy than the competition. 

= Can Anura Detect Human Fraud? =

Anura can detect when a human fraud farm fills out your form versus a real user, helping prevent damage to your brand, TCPA violations, and wasted marketing dollars.

= Can Anura Detect Sophisticated Invalid Traffic (SIVT)? =

Anura detects the most sophisticated fraud, allowing you to protect your ad campaigns in real time.


= What reporting do you offer? =
 
The Anura dashboard provides the most useful, and user friendly, analytics package in the ad fraud industry. It offers a simple decision tree with only three notations, Bad, Good or Warning, not a complicated confidence score. We allow our clients the flexibility to organize their data in a manner that makes sense to them with unlimited source and campaign fields. The data itself is transparent and comprehensive and allows for in depth historical analysis and trend analysis with detailed pivot points to enable the best traffic decision now and in the future.

== Installation ==


Anura is an Ad Fraud solution designed to accurately eliminate fraud to improve conversion rates. With the Anura for WordPress plugin, you can easily set up a real-time visitor firewall to keep the fraud off of your site. Before you can set this up, be sure to reach out to  [sales@anura.io](mailto:sales@anura.io)  to get your account set up first.

### Requirements

-   WordPress version 4.70 or higher
-   An active Anura account and Instance ID

## Settings

### Instance ID

Enter your assigned Anura Instance ID in the field provided. This is a required field.

### Source Method

The Anura for WordPress plugin currently provides four methods of passing Source information to Anura. Choose a method that best works for your application.

-   #### None
    
    A value for Source will not be submitted, with  (undefined)  instead being shown in the Anura dashboard interface.
-   #### GET Method
    
    Passes a Source value sent within the query string of the URL. i.e.  https://yourwebsite.com/index.php?utm_source=optionalSourceTrackingId. Be sure to enter the GET parameter name into the corresponding Source Parameter field.
-   #### POST Method
    
    Passes a Source value that is sent to the server stored in the body of an HTTP request. Be sure to enter the POST parameter name into the corresponding Source Parameter field.
-   #### Hard Coded Source Value
    
    A hard coded Source value will pass the value exactly as it is entered in the Source Value field. If no value is entered into the Source Value field,  (undefined)  will instead be shown in the Anura dashboard interface.

### Campaign Method

The Anura for WordPress plugin currently provides four methods of passing Campaign information to Anura. Choose a method that best works for your application.

-   #### None
    
    A value for Campaign will not be submitted, with  (undefined)  instead being shown in the Anura dashboard interface.
-   #### GET Method
    
    Passes a Campaign value sent within the query string of the URL. i.e.  https://yourwebsite.com/index.php?utm_campaign=optionalCampaignTrackingId. Be sure to enter the GET parameter name into the corresponding Campaign Parameter field.
-   #### POST Method
    
    Passes a Campaign value that is sent to the server stored in the body of an HTTP request.  
    Be sure to enter the POST parameter name into the corresponding Campaign Parameter field.
-   #### Hard Coded Campaign Value
    
    A hard coded Campaign value will pass the value exactly as it is entered in the Campaign Value field. If no value is entered into the Campaign Value field,  (undefined)  will instead be shown in the Anura dashboard interface.

### Optional Callback Function

Anura can initialize a custom JavaScript callback function once a response has been returned. Please note: Callback functions are allowed to start with: "$", "_", or "a-z" characters, followed by "a-z" and "0-9" characters.

### Redirect on Warning/Bad

The Anura for WordPress plugin current provides three methods to redirect visitors which are found to be  warning,  bad, or both.

-   #### No Redirect

    The visitor will not be redirected. Result information will still be available within the Anura dashboard interface.

-   #### Redirect on Bad

    If Anura returns a  bad  result, the visitor will be automatically redirected to the URL listed in the Redirect URL field. i.e.  https://yourwebsite.com/404.

-   #### Redirect on Warning and Bad

    If Anura returns a  warning  or  bad  result, the visitor be will automatically redirected to the URL listed in the Redirect URL field. i.e.  https://yourwebsite.com/404.


### Allow WebCrawlers

When taking advantage of the redirect feature, enabling this option will allow identifiable web crawlers to bypass the redirect and operate as normal on your website. To use this feature "rule sets returnability" must be enabled. Talk to support about enabling or disabling the rule sets returnability feature.

== Changelog ==

= 1.0 =
* Initial Release

== Upgrade Notice ==

= 1.0 =
Initial Release
