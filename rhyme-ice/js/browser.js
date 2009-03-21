
if(typeof(hm) == "undefined")
	hm = new Object();
if(typeof(hm.browser) == "undefined")
	hm.browser = new Object();

if(!hm.browser.ie)
	hm.browser.ie = navigator.appName == "Microsoft Internet Explorer";
if(!hm.browser.nn)
	hm.browser.nn = navigator.appName == "Netscape";
if(!hm.browser.w3c)
	hm.browser.w3c = !hm.browser.ie;
