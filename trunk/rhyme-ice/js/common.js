if(typeof(com) == "undefined" || com == null)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.common)
	com.hm_x.common = new (function()
{
	agent = navigator.userAgent;
	iePos = agent.indexOf("MSIE");
	
	this.isIE		= (iePos != -1);
	if(this.isIE) {
		verPos = iePos + 5;
		verStr = agent.substr(verPos);
		this.ieVer = parseInt(verStr, 10);
	}
	
	this.isChrome	= agent.indexOf("Chrome") != -1;
	this.isFirefox	= agent.indexOf("Firefox") != -1;
})();
