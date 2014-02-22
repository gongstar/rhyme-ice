Function.prototype.getName = function() {
	var funcStr = this.toString();
	var funcName = funcStr.match(/(\b\w*\b)\s*\(/);
	if(funcName) {
		if(funcName[1] == "function")
			return "*anonymous*";
		else
			return funcName[1];
	}
	else
		return "*global*";
}

Function.prototype.getDescribe = function(noColor) {
	var des = this.getName() + " (";
	var isFirst = true;
	var len = this.arguments ? (this.arguments.length ? this.arguments.length : 0) : 0;
	for(var i=0; i<len; ++i) {
		if(!isFirst)
			des += ", "
		else
			isFirst = false;

		des += com.hm_x.debug._makeStr(this.arguments[i], noColor);
	}
	des += ")";
	if(!noColor)
		des.fontcolor("blue");
	return des;
}

if(typeof(com) == "undefined" || com == null)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.debug)
	com.hm_x.debug =
{

_encode : function(text) {
	if(text == null)
		return null;

	if(text.toString)
		text = text.toString();	// ie 不会缺省转换为字符串
	else
		return text;

	text = text.replace(/&/g, "&amp;") ;
	text = text.replace(/"/g, "&quot;") ;
	text = text.replace(/</g, "&lt;") ;
	text = text.replace(/>/g, "&gt;") ;
	text = text.replace(/'/g, "&#146;") ;

	return text ;
},

// constants
CODE_INDENT : 4,	// 供输出代码用
TRACE_INDENT : 4,	// 供 trace 的消息用
STACK_INDENT : 4,	// 供 call stack 用

enabled : true,
_traceStack : new Array,
_curStackIndent : 0,
_curTraceIndent : 0,
_curCodeIndent : 0,

_getWindow : function() {
	if(!this.enabled)
		return null;

	if(!this.window || this.window.closed) {
		this.window = window.open("about:blank", "_blank");
		this.window.opener = window;
		this.oldOnclose = window.onunload;
		window.onunload = function() {
			com.hm_x.debug.window.close();
			if(com.hm_x.debug.oldOnclose)
				com.hm_x.debug.oldOnclose();
		}

		this.write("<style>.traceMessage {font-family:courier;font-size:10pt;}</style>");
		this.write("<style>.traceWarn {font-family:courier;font-size:10pt;color:red;}</style>");
		this.write("<style>.traceError {font-family:courier;font-size:10pt;color:red;font-weight:bold;}</style>");
		this.write("<style>.traceStack {font-family:courier;font-size:10pt;color:blue;white-space:nowrap;}</style>");
		this.write("<style>.traceCode {font-family:courier;font-size:10pt;white-space:nowrap;}</style>");
		this.write("<style>.traceMisc {font-family:courier;font-size:10pt;}</style>");
	}
	return this.window;
},

_getDocument : function() {
	if(!this.enabled)
		return null;

	return this._getWindow().document;
},

printArray : function(anArray, arrayName) {
	if(!this.enabled)
		return;

	this._checkTraceStack();
	this._printArray(anArray, arrayName);
},

_printArray : function(anArray, arrayName) {
    this.write("<code class='traceMisc'>");
    this.writeln(this._getTraceIndentSpaces(), "<b>begin of array.", arrayName ? "<font color='red'>(" + arrayName + ")</font>" : "", "</b>");
    this._traceIndent();
    var spaces = this._getTraceIndentSpaces();
	try{
		function eachIt(ele, i) {
	    	try {
	    		if(typeof(ele) == "unknown")	// 它甚至不能作为参数传递，只好就地处理了。
	    			com.hm_x.debug.writeln(spaces, ("" + i).fontcolor("orange") + " = *unknown type*");
	    		else
    	   			com.hm_x.debug.writeln(spaces, ("" + i).fontcolor("orange") + " = " + com.hm_x.debug._makeStr(ele, true));
    	   	}
    	   	catch(e) {
    	   		com.hm_x.debug.writeln(spaces, i, (" = ERROR : " + e).fontcolor("red"));
    	   	}
		}
		if(typeof(anArray.each) == "function") 	// 如果用了 prototype 库， for 对于 Array 就不大好使了
			anArray.each(eachIt);
		else for(var i in anArray)
			eachIt(anArray[i], i);
    }
    catch(e) {
    	this.writeln(spaces, "ALERT : Because some mistery things in IE, the output is NOT complete!".fontcolor("red"));
    }
    this._traceUnindent();
    this.writeln(this._getTraceIndentSpaces(), "<b>end of array.</b></code>");
},

write : function() {
	if(!this.enabled)
		return;

	var doc = this._getDocument();
	for(var it=0; it<arguments.length; ++it)
		doc.write(arguments[it]);
},

writeln : function() {
	if(!this.enabled)
		return;

	this.write.apply(this, arguments);
	this.write("<br/>");
},

dump : function() {
	if(!this.enabled)
		return;
	var doc = this._getDocument();
	for(var it=0; it<arguments.length; ++it)
		doc.write(this._encode(arguments[it]));
},

dumpln : function() {
	if(!this.enabled)
		return;
	this.dump.apply(this, arguments);
	this.write("<br/>");
},

clear : function() {
	if(!this.enabled)
		return;

	this._checkTraceStack();
	var win = this._getWindow();
	win.location.href = "about:blank";
},

createConsole : function() {
	if(!this.enabled)
		return;

	var frm = document.body.insertBefore(document.createElement("form"), document.body.firstChild);
	frm.onsubmit = this.onConsoleCommit;

	var stat = document.createElement("input");
	stat.type = "text";
	stat.id = "jsDebugConsole";
	stat.size = 100;
	frm.appendChild(stat);

	var btn  = document.createElement("input");
	btn.type = "submit";
	btn.value = "debug";
	frm.appendChild(btn);

    var srcBtn = document.createElement("input");
    srcBtn.type = "button";
    srcBtn.value = "source";
    srcBtn.onclick = function(){
        this.recursiveDumpNode(document.body);
    }
    frm.appendChild(srcBtn);

},

onConsoleCommit : function jsDebugConsole() {
	if(!this.enabled)
		return;

	this._checkTraceStack();

    var statement = document.getElementById("jsDebugConsole").value;
    
    try {
		eval(statement);
    }
    catch(e) {
    	alert("错误！\n" + e);
    }
	return false;	// forbid refresh
},

dumpNode : function (node, noAbbr) {
	if(!this.enabled)
		return;

	this._checkTraceStack();

	this.writeln("<code class='traceCode'>");
	this.write("<hr/>");
	this.write("<p align='center'>Node Dump</p>");
	this.write("<hr/>");
	this._dumpNode(node, this.CODE_INDENT, noAbbr);
	this.writeln("<hr/>");
	this.writeln();
	this.writeln("</code>");
},

_dumpNode : function(node, indent, noAbbr) {
	hm.dom.depthIterateNode2(node, this.__dumpNode, [indent, noAbbr, 0]);
},

__dumpNode : function(node, param, isPush) {
	var indent = param[0];
	var noAbbr = param[1];
	if(isPush) {
    	switch(node.nodeType) {
        case hm.dom.nodeType.ELEMENT_NODE:
        	this.write(this.__getIndentSpaces(param[2] * indent));
        	this.dump("<");
        	this.write(node.nodeName.fontcolor("red"));
        	for(var i=0; i<node.attributes.length; ++i) {
        		if(node.attributes[i].specified) {
        			this.dump(" ");
        			this.write(node.attributes[i].nodeName.fontcolor("orange"));
        			this.dump("=\"", node.attributes[i].nodeValue, "\"");
        		}
        	}

        	if(noAbbr || node.hasChildNodes())
        		this.dumpln(">");
        	break;
        case hm.dom.nodeType.TEXT_NODE:
        	this.write(this.__getIndentSpaces(param[2] * indent));
        	var textValue = node.nodeValue.toString();
        	if(!textValue || textValue.length == 0)
        		this.writeln("*null*".fontcolor("gray"));
        	else
        		this.dumpln(node.nodeValue);
        	break;
        case hm.dom.nodeType.ATTRIBUTE_NODE:
        case hm.dom.nodeType.CDATA_SECTION_NODE:
        case hm.dom.nodeType.ENTITY_REFERENCE_NODE:
        case hm.dom.nodeType.ENTITY_NODE:
        case hm.dom.nodeType.PROCESSING_INSTRUCTION_NODE:
        case hm.dom.nodeType.COMMENT_NODE:
        case hm.dom.nodeType.DOCUMENT_NODE:
        case hm.dom.nodeType.DOCUMENT_TYPE_NODE:
        case hm.dom.nodeType.DOCUMENT_FRAGMENT_NODE:
        case hm.dom.nodeType.NOTATION_NODE:
        default:
        	break;
		}

       	if(node.hasChildNodes())
       		++ param[2];
	}
	else {
    	switch(node.nodeType) {
        case hm.dom.nodeType.ELEMENT_NODE:
        	if(noAbbr || node.hasChildNodes()) {
        		this.write(this.__getIndentSpaces(param[2] * indent));
        		this.dump("</");
        		this.write(node.nodeName.fontcolor("red"));
        		this.dumpln(">");
        	}
        	else
        		this.dumpln("/>");
        	break;
        case hm.dom.nodeType.ATTRIBUTE_NODE:
        case hm.dom.nodeType.TEXT_NODE:
        case hm.dom.nodeType.CDATA_SECTION_NODE:
        case hm.dom.nodeType.ENTITY_REFERENCE_NODE:
        case hm.dom.nodeType.ENTITY_NODE:
        case hm.dom.nodeType.PROCESSING_INSTRUCTION_NODE:
        case hm.dom.nodeType.COMMENT_NODE:
        case hm.dom.nodeType.DOCUMENT_NODE:
        case hm.dom.nodeType.DOCUMENT_TYPE_NODE:
        case hm.dom.nodeType.DOCUMENT_FRAGMENT_NODE:
        case hm.dom.nodeType.NOTATION_NODE:
        default:
        	break;
		}
		
		if(!node.nextSibling)
			--param[2];
	}

	return false;
},

// this function need xml.hm
_recursiveDumpNode : function (node) {
	if(!node)
		return;

	var indentSpace = this._getCodeIndentSpaces();

	if(!node.tagName) {	// text node
		this.writeln(indentSpace, node.data ? this._encode(node.data) : "&lt;null&gt;".fontcolor("cyan"));
		return;
	}

	this.write(indentSpace, "&lt;", node.tagName.fontcolor("red"));
	if(node.attributes) {
		for(var i=0; i<node.attributes.length; ++i) {
			var it = node.attributes[i];
			if(			it.specified 
					||	(it.nodeName.toLowerCase() == "name" && it.nodeValue)
					||	(it.nodeName.toLowerCase() == "id" && it.nodeValue)
					||	(it.nodeName.toLowerCase() == "value" && it.nodeValue)
			)
				this.write("&nbsp;", this._encode(it.nodeName).fontcolor("orange"), "=&#34;", this._encode(it.nodeValue), "&#34;");
		}
	}

	if(node.hasChildNodes()) {
		this.writeln("&gt;");
		this._codeIndent();
		for(var i = 0; i<node.childNodes.length; ++i) {
			it = node.childNodes[i];
			this._recursiveDumpNode(it);
		}
		this._codeUnindent();
		this.writeln(indentSpace, "&lt;/", node.tagName.fontcolor("red"), "&gt;");
	}
	else
		this.writeln("/&gt;");
},

recursiveDumpNode : function (node) {
	if(!this.enabled)
		return;

	this._checkTraceStack();

	this.writeln("<code class='traceCode'>");
	this.write("<hr/>");
	this.write("<p align='center'>Node Dump</p>");
	this.write("<hr/>");
	this._recursiveDumpNode(node, this.CODE_INDENT);
	this.writeln("<hr/>");
	this.writeln();
	this.writeln("</code>");
},

_checkTraceStack : function() {
	if(!this.enabled)
		return;

	var callers = new Array();
	var prevCaller = null;
	for(var curCaller = this._checkTraceStack.caller.caller; curCaller; curCaller = curCaller.caller) {
		callers.unshift(curCaller);
		if(curCaller == prevCaller)
			break;	// 有递归调用，惹不起，躲先！以后再想办法吧
		else
			prevCaller = curCaller;
	}
	var newSize = 0;
	for(; newSize < this._traceStack.length && newSize < callers.length; ++newSize) {
		if(this._traceStack[newSize] != callers[newSize] || this._traceStack[newSize].arguments != callers[newSize].params)
			break;
	}
	for(var j=this._traceStack.length; j>newSize; --j) {
		var poper = this._traceStack.pop();
		this._stackUnindent();
		this.write("<code class='traceStack'>", this._getStackIndentSpaces());
		this.writeln("}", (" // end of " + poper.describeStr).fontcolor("green"), "</code>");
	}

	for(var i=this._traceStack.length; i<callers.length; ++i) {
		callers[i].describeStr = callers[i].getDescribe(true);
		callers[i].params = callers[i].arguments;
		this._traceStack.push(callers[i]);
		this.write("<code class='traceStack'>", this._getStackIndentSpaces());
		this.writeln("function ".fontcolor("orange") + callers[i].getDescribe() + " {", "</code>");
		this._stackIndent();
	}
},

_traceAlert : function () {
	var topFunc = this._topOfTraceStack();
	if(topFunc && !topFunc.alertProned) {
		var msg = "";
		for(var it=0; it < arguments.length; ++it)
			msg += arguments[it];
		if(!window.confirm(msg)) {
			topFunc.alertProned = true;
		}
	}
},

_error : function() {
	this.write("<code class='traceError'>", this._getTraceIndentSpaces(), "ERROR!&nbsp;");
	this.write.apply(this, arguments);
	this.writeln("</code>");
},

trace : function () {
	this._checkTraceStack();
//	this._traceAlert.apply(this, arguments);
	this.write("<code class='traceMessage'>", this._getTraceIndentSpaces());
	this.write.apply(this, arguments);
	this.writeln("</code>");
},

warn : function() {
	this._checkTraceStack();
	this._traceAlert.apply(this, arguments);
	this.write("<code class='traceWarn'>", this._getTraceIndentSpaces());
	this.write.apply(this, arguments);
	this.writeln("</code>");
},

error : function() {
	this._checkTraceStack();
	this._error.apply(this, arguments);
},

traceIndent : function() {
	if(!this.enabled)
		return;

	this._checkTraceStack();
	if(arguments.length > 0) {
		this.write("<code class='traceMessage'>", this._getTraceIndentSpaces());
		this.write.apply(this, arguments);
		this.writeln("</code>");
	}
	this._traceIndent();
},

traceUnindent : function() {
	if(!this.enabled)
		return;

	this._traceUnindent();
	if(arguments.length > 0) {
		this.write("<code class='traceMessage'>", this._getTraceIndentSpaces());
		this.write.apply(this, arguments);
		this.writeln("</code>");
	}
},

__getIndentSpaces : function(num) {
	var spaces = new String;
	for(var i=0; i<num; ++i)
		spaces += "&nbsp;";
	return spaces;
},

_stackIndent : function () {
	this._curStackIndent += this.STACK_INDENT;
	this._curTraceIndent = this._curStackIndent;
},

_stackUnindent : function () {
	this._curStackIndent -= this.STACK_INDENT;
	this._curTraceIndent = this._curStackIndent;
},

_getStackIndentSpaces : function () {
	return this.__getIndentSpaces(this._curStackIndent);
},

_traceIndent : function () {
	this._curTraceIndent += this.TRACE_INDENT;
},

_traceUnindent : function () {
	this._curTraceIndent -= this.TRACE_INDENT;
},

_getTraceIndentSpaces : function () {
	return this.__getIndentSpaces(this._curTraceIndent);
},

_codeIndent : function() {
	this._curCodeIndent += this.CODE_INDENT;
},

_codeUnindent : function() {
	this._curCodeIndent -= this.CODE_INDENT;
},

_getCodeIndentSpaces : function() {
	return this.__getIndentSpaces(this._curCodeIndent);
},

_topOfTraceStack : function() {
	if(this._traceStack.length)
		return this._traceStack[this._traceStack.length - 1];
	else
		return null;
},

_makeStr : function _makeStr_impl(obj, noColor) {
	var str = "";
	var isFirst = true;
	if(typeof(obj) == "undefined") {
		str = "*undefined*;";
		if(!noColor)
			str.fontcolor("cyan");
		return str;
	}
	else if(obj == null)  {
		str = "*null*;";
		if(!noColor)
			str.fontcolor("cyan");
		return str;
	}
		
	if(!obj.constructor) {
		try {
			str = this._encode("" + obj);
		}
		catch(e) {
			str = "*It is too mistery to know*";
			if(!noColor)
				str.fontcolor("cyan");
			str = typeof(obj) + str;
		}
	}
	else {
    	switch(typeof(obj)) {
    	case 'function':
    		str = obj.getDescribe(noColor);
    		break;
    	case 'string':
    		str = '"' + this._encode(obj) + '"';
    		if(!noColor)
    			str = str.fontcolor("gray");
    		break;
    	case 'number':
    		str = "" + obj;
    		break;
    	default:
    		if(obj.toString) {
    			try {
    				return this._encode(obj.toString());
    			}
    			catch (e) {	// ie 有时虽然有 toString 但不能调用
    				return typeof(obj);
    			}
    		}
    		else
    			return "*Unknown to Debugger*".fontcolor("cyan");
    		break;
    	}
    }

	return str;
},

assert : function(condition, errMsg) {
	if(!condition) {
		alert(errMsg);
		/*
		this._checkTraceStack();
		this._error("Assert fail! " + errMsg);
		throw errMsg;
		*/
	}
}


}	// end of com.hm_x.debug
