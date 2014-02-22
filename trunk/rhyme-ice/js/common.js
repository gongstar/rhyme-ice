if(typeof(com) == "undefined" || com == null)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.common)
	com.hm_x.common = new (function()
{
	var agent = navigator.userAgent;
	var iePos = agent.indexOf("MSIE");
	
	this.isIE		= (iePos != -1);
	if(this.isIE) {
		var verPos = iePos + 5;
		var verStr = agent.substr(verPos);
		this.ieVer = parseInt(verStr, 10);
	}
	// IE 11 变态了，它的识别串中居然没有 MSIE 字样
	if(!this.isIE && agent.indexOf('Trident') != -1) {
		this.isIE = true;
		var VERSION_PREFIX = 'rv:';
		verPos = agent.indexOf(VERSION_PREFIX) + VERSION_PREFIX.length;
		this.ieVer = parseInt(agent.substr(verPos));
	}
	
	if(!this.isIE) {
		var CHROME = 'Chrome';
		var chromeIdx = agent.indexOf("Chrome");
		this.isChrome	= (chromeIdx != -1);
		if(this.isChrome)
			this.chromeVer = parseInt(agent.substr(chromeIdx + CHROME.length + 1));
			
		else {
			var FIREFOX = 'Firefox';
			var firefoxIdx = agent.indexOf(FIREFOX);
			this.isFirefox	= (firefoxIdx != -1);
			if(this.isFirefox)
				this.firefoxVer = parseInt(agent.substr(firefoxIdx + FIREFOX.length + 1));
		}
	}

	// 工具方法
	/**
		用于取最值
		@args n1, n2, ... nn 依次列出需要比较的数，不限个数
				functor 最后一个参数可选。它可以是一个函数，接受两个参数，返回布尔值。默认为　Math.max
		@return 参数中的最值
	*/
	this.extremum = function() {
		if(!arguments.length)
			return null;
			
		var func = arguments[arguments.length - 1];
		if(arguments.length == 1) {
			if(func instanceof Function)
				return null;
			else
				return arguments[0];
		}
			 
		var count = arguments.length;
		if(func instanceof Function)
			--count;
		else
			func = Math.max;
		
		var res = arguments[0];
		var args = arguments;
		$R(1, count, true).each(function(it){
			res = func(res, args[it]);
		});
		return res;
	}

	this.max = this.extremum;
	
	this.min = function() {
		var args = $A(arguments);
		args.push(Math.min);
		return this.extremum.apply(this, args);
	}
	
	// 对象工具方法
	/**
		用于将数组分组
		@args sepFunc 是一个函数，它将依次被调用，得到一个元素作为参数。应该返回一个索引值用于分组。
		@return 按 sepFunc 返回的下标分组的数组，内含数组由原数组的元素组成
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
