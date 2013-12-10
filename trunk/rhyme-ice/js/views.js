if(!com)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.ice)
	com.hm_x.ice = new Object();
if(!com.hm_x.ice.View)
	com.hm_x.ice.View = function(node)
{
	// 创建参数可包括：　tagName, id, attributes(仍是一个映射表), innerHTML
	this.create = function(params) {
		var p = {
			tagName		: params.tagName || 'div',
			id				: params.id,
			attributes	: params.attributes,
			innerHTML	: params.innerHTML
		};
		
		var node = $(document.createElement(p.tagName));
		if(p.id)
			node.setAttribute('id', p.id);
		if(p.attributes)
			for(var it in p.attributes)
				node.setAttribute(it, p.attributes[it]);
		if(p.innerHTML)
			node.innerHTML = p.innerHTML;

		if(this.onCreate)
			this.onCreate(node);
		this.attach(node);
	}
	
	this.destroy = function() {
		node = this.htmlNode;
		this.detach();
		if(this.onDestroy)
			this.onDestroy();
		if(node.parentNode)
			node.parentNode.removeChild(node);
	}
	
	this.attach = function(node) {
		if(this.htmlNode && this.onDetach)
			this.detach(this.htmlNode);
			
		this.htmlNode = $(node);
		this.htmlNode.hmxView = this;
		
		if(this.onAttach)
			this.onAttach(node);
	}

	this.detach = function() {
		if(this.htmlNode && this.onDetach)
			this.onDetach(this.htmlNode);
		if(this.htmlNode) {
			this.htmlNode.hmxView = null;
			this.htmlNode = null;
		}
	}

	this.show = function() {
		if(this.htmlNode)
			this.htmlNode.show();
	}

	this.hide = function() {
		if(this.htmlNode)
			this.htmlNode.hide();
	}

	this.visible = function() {
		if(this.htmlNode)
			return this.htmlNode.visible();
		else
			return false;
	}

	this.getCaptionNode = function() {
		if(!this.captionNode && this.htmlNode) {
			var capNode;
			com.hm_x.xml.depthIterate(this.htmlNode, function(node) {
				capNode = node;
				return (node.nodeType != com.hm_x.xml.TEXT_NODE);
			});
			if(capNode.nodeType == com.hm_x.xml.TEXT_NODE)
				this.captionNode = capNode;
		}
		
		return this.captionNode;
	}

	this.setCaptionNode = function(node) {
		this.captionNode = node;
	}

	this.getCaption = function() {
		capNode = this.getCaptionNode();
		res = "";
		if(capNode)
			res = capNode.nodeValue;
		return res;
	}

	this.setCaption = function(caption) {
		capNode = this.getCaptionNode();
		if(capNode)
			capNode.nodeValue = caption;
	}

	/////////////////////////////////////////////
	// 安装事件处理器
	this.setOnCreate = function(onCreate) {
		this.onCreate = onCreate;
	}

	this.setOnAttach = function(onAttach) {
		this.onAttach = onAttach;
		if(this.htmlNode)
			this.onAttach(this.htmlNode);
	}

	this.setOnDetach = function(onDetach) {
		this.onDetach = onDetach;
	}

	this.setOnDestroy = function(onDestroy) {
		this.onDestroy = onDestroy;
	}


	/////////////////////////////////////////////
	// insertable event
	// onCreate()
	// onDestroy()	// 此时不能调用关联的　htmlNode，我估计，这东东没什么用
	// onAttach(htmlNode)
	// onDetach(htmlNode)
	
	// initializing
	if(node)
		this.attach(node);
}

if(!com.hm_x.ice.Clickable)
	com.hm_x.ice.Clickable = function(node, onClick)
{
	this.base = com.hm_x.ice.View;
	this.base(node);
	
	this.setOnClick = function(onClick) {
		if(this.onClick && this.htmlNode)
			Event.stopObserving(this.htmlNode, 'click');
			
		this.onClick = onClick;
		
		if(this.onClick && this.htmlNode)
			Event.observe(this.htmlNode, 'click', this.onClick.bindAsEventListener(this));
	}

	/////////////////////////////////////////////
	// insertable event
	// onClick(node)
	// onHover(node)
	// onLeave(node)

	// initializing
	this.setOnAttach(function(node) {
		if(this.onClick)
			Event.observe(this.htmlNode, 'click', this.onClick.bindAsEventListener(this));
	});

	this.setOnDetach(function(node) {
		if(this.onClick)
			Event.stopObserving(this.htmlNode, 'click');
	});
	
	if(onClick)
		this.setOnClick(onClick);
}

if(!com.hm_x.ice.Widget)
	com.hm_x.ice.Widget = function(node)
{
	this.base = com.hm_x.ice.Clickable;
	this.base(node);
	this.children = [];
	
	this.addChild = function(view) {
		this.children.push(view);
		view.parent = this;
		
		if(view.htmlNode && this.htmlNode && !view.htmlNode.parentNode)
			this.htmlNode.appendChild(view.htmlNode);
			
		return view;
	}

	this.clear = function() {
		this.children.each(function(child) {
			child.destroy();
		});
		this.children = [];
		
		// 既然不由　widget 管理，就不应该由　widget 删除
		// if(this.htmlNode)
		// 	com.hm_x.xml.clearChildren(this.htmlNode);
	}

	this.destroy = function() {
		this.clear();

		node = this.htmlNode;
		this.detach();
		if(this.onDestroy)
			this.onDestroy();
		if(node.parentNode)
			node.parentNode.removeChild(node);
	}
}

if(!com.hm_x.ice.Button)
	com.hm_x.ice.Button = function(node, onClick)
{
	this.base = com.hm_x.ice.Clickable;
	this.base(node, onClick);
}
