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
	
	// 全局工具方法
	/**
		@args sepFunc 是一个函数，它将依次被调用，得到一个元素作为参数。应该返回一个索引值用于分组。
	*/
	Array.prototype.groupBy = function(sepFunc) {
		var groups = [];
		this.each(function(it){
			var idx = sepFunc(it);
			if(!(idx in groups))
				groups[idx] = [it];
			else
				groups[idx].push(it);
		});
		return groups;
	}
})();
