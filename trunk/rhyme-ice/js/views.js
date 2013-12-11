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
		if(this.onCreate)
			this.onCreate(p);
		
		var node = $(document.createElement(p.tagName));
		if(p.id)
			node.setAttribute('id', p.id);
		if(p.attributes)
			for(var it in p.attributes)
				node.setAttribute(it, p.attributes[it]);
		if(p.innerHTML)
			node.innerHTML = p.innerHTML;

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

	this.getController = function() {
		for(var view = this; view; view = view.parent)
			if(view.controller)
				return view.controller;
		return null;
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
	// onCreate(params)	// 一个修改参数的机会
	// onDestroy()	// 此时不能调用关联的　htmlNode，我估计，这东东没什么用
	// onAttach(htmlNode)
	// onDetach(htmlNode)
	
	// initializing
	if(node) {
		if(node.nodeType)
			this.attach(node);
		else	// 视为创建参数
			this.create(node);
	}
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

if(!com.hm_x.ice.Selector)
	com.hm_x.ice.Selector = function(node, onChange)
{
	this.base = com.hm_x.ice.View;
	this.base(node);

	this.addGroup = function (label) {
		if(this.htmlNode) {
			var grp = document.createElement("optgroup");
			grp.setAttribute("label", label);
			this.htmlNode.appendChild(grp);
		}
	}

	this.addOption = function (label, value) {
		if(!value)
			value = label;
		if(this.htmlNode) {
			var opt = document.createElement("option");
			opt.setAttribute("value", value);
			opt.appendChild(document.createTextNode(label));
			this.htmlNode.appendChild(opt);
		}
	}
	
	////////////////////////////////////////////////
	// 安装事件处理器的接口
	this.setOnChange = function(onChange) {
		if(this.htmlNode) {
			if(this.onChange)
				Event.stopObserving(this.htmlNode, 'change');
			Event.observe(this.htmlNode, 'change', onChange.bindAsEventListener(this));
		}
		this.onChange = onChange;
	}
	
	////////////////////////////////////////////////
	// insertable event
	// onChange
	
	this.setOnAttach(function(node){
		if(this.onChange)
			Event.observe(this.htmlNode, 'change', this.onChange.bindAsEventListener(this));
	});

	this.setOnDetach(function(node){
		if(this.onChange)
			Event.stopObserving(this.htmlNode, 'change');
	});

	
	////////////////////////////////////////////////
	// initialize
	if(onChange)
		this.setOnChange(onChange);
}

if(!com.hm_x.ice.TextArea)
	com.hm_x.ice.TextArea = function(node, onChange) 
{
	this.base = com.hm_x.ice.Widget;
	this.base(node);
	
	////////////////////////////////////////////////
	// 安装事件处理器的接口
	this.setOnChange = function(onChange) {
		if(this.htmlNode && this.onChange)
			this._removeObserver();
		this.onChange = onChange;
		if(this.onChange)
			this._installObserver();
	}
	
	////////////////////////////////////////////////
	// insertable event
	// onChange
	
	this.setOnAttach(function(node){
		if(this.onChange)
			this._installObserver();
	});

	this.setOnDetach(function(node){
		if(this.onChange)
			this._removeObserver();
	});
	
	
	////////////////////////////////////////////////
	// 工具方法
	this._installObserver = function() {
		if(this.htmlNode) {
			var checker = (function(evt){
				if(this._checkChange())
					this.onChange(evt);
			}).bindAsEventListener(this);
			
			Event.observe(this.htmlNode, 'change', checker);
			Event.observe(this.htmlNode, 'keydown', checker);
			Event.observe(this.htmlNode, 'keyup', checker);
			Event.observe(this.htmlNode, 'mouseup', checker);
			Event.observe(this.htmlNode, 'mousedown', checker);
			Event.observe(this.htmlNode, 'mouseover', checker);
			Event.observe(this.htmlNode, 'mouseout', checker);
		}
	}

	this._removeObserver = function() {
		if(this.htmlNode) {
			Event.stopObserving(htmlNode, 'change');
			Event.stopObserving(htmlNode, 'keydown');
			Event.stopObserving(htmlNode, 'keyup');
			Event.stopObserving(htmlNode, 'mouseup');
			Event.stopObserving(htmlNode, 'mousedown');
			Event.stopObserving(htmlNode, 'mouseover');
			Event.stopObserving(htmlNode, 'mouseout');
		}
	}

	this._checkChange = function() {
		if(this.htmlNode) {
			var value = this.htmlNode.value;
			if(value != this.oldValue) {
				this.oldValue = value;
				return true;
			}
		}

		return false;
	}
	

	
	////////////////////////////////////////////////
	// initialize
	if(onChange)
		this.setOnChange(onChange);
}
