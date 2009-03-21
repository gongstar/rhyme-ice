var hm;
if(!hm)
	hm = new Object;
if(!hm.debug) {
	hm.debug = new Object;

///////////////////////////////////////////////////////////////
// 将<, >等xml的关键字使用编码替换
//
if(hm.xml == null)
	hm.xml = new Object;

hm.xml.encode = function(text)
{
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
}

hm.debug.loadJs = function(jsName, node) {
	node = node ? node : document.body;
	var s = document.createElement("script");
	s.src = jsName;
	node.appendChild(s);
}

hm.debug.loadJsStatic = function(jsName) {

}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 如需改变JS文件所在目录，改动此处
if(!hm.jsDir) {
	var theUrl = document.URL.toString();
	if(theUrl.substring(0, 5) == "http:" || theUrl.substring(0, 6) == "https:")
		hm.jsDir = "/_hm";
	else
		hm.jsDir = "/_hm";
}
// 如需改变JS文件所在目录，改动此处
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// constants
hm.debug.CODE_INDENT = 4;	// 供输出代码用
hm.debug.TRACE_INDENT = 4;	// 供 trace 的消息用
hm.debug.STACK_INDENT = 4;	// 供 call stack 用

hm.debug.enabled = true;
hm.debug._traceStack = new Array;
hm.debug._curStackIndent = 0;
hm.debug._curTraceIndent = 0;
hm.debug._curCodeIndent = 0;

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

		des += hm.debug._makeStr(this.arguments[i], noColor);
	}
	des += ")";
	if(!noColor)
		des.fontcolor("blue");
	return des;
}

hm.debug._getWindow = function() {
	if(!hm.debug.enabled)
		return null;

	if(!hm.debug.window || hm.debug.window.closed) {
		hm.debug.window = window.open("about:blank", "_blank");
		var oldOnclose = window.onunload;
		window.onunload = function() {
			hm.debug.window.close();
			if(oldOnclose)
				oldOnclose();
		}

		hm.debug.write("<style>.traceMessage {font-family:courier;font-size:10pt;}</style>");
		hm.debug.write("<style>.traceWarn {font-family:courier;font-size:10pt;color:red;}</style>");
		hm.debug.write("<style>.traceError {font-family:courier;font-size:10pt;color:red;font-weight:bold;}</style>");
		hm.debug.write("<style>.traceStack {font-family:courier;font-size:10pt;color:blue;white-space:nowrap;}</style>");
		hm.debug.write("<style>.traceCode {font-family:courier;font-size:10pt;white-space:nowrap;}</style>");
		hm.debug.write("<style>.traceMisc {font-family:courier;font-size:10pt;}</style>");
	}
	return hm.debug.window;
}

hm.debug._getDocument = function() {
	if(!hm.debug.enabled)
		return null;

	return hm.debug._getWindow().document;
}

hm.debug.printArray = function(anArray, arrayName) {
	if(!hm.debug.enabled)
		return;

	hm.debug._checkTraceStack();
	hm.debug._printArray(anArray, arrayName);
}

hm.debug._printArray = function(anArray, arrayName) {
    hm.debug.write("<code class='traceMisc'>");
    hm.debug.writeln(hm.debug._getTraceIndentSpaces(), "<b>begin of array.", arrayName ? "<font color='red'>(" + arrayName + ")</font>" : "", "</b>");
    hm.debug._traceIndent();
    var spaces = hm.debug._getTraceIndentSpaces();
	try{
		for(var i in anArray) {
	    	try {
	    		if(typeof(anArray[i]) == "unknown")	// 它甚至不能作为参数传递，只好就地处理了。
	    			hm.debug.writeln(spaces, ("" + i).fontcolor("orange") + " = *It is too mistery to know*");
	    		else
    	   			hm.debug.writeln(spaces, ("" + i).fontcolor("orange") + " = " + hm.debug._makeStr(anArray[i], true));
    	   	}
    	   	catch(e) {
    	   		hm.debug.writeln(spaces, i, (" = ERROR : " + e).fontcolor("red"));
    	   	}
    	}
    }
    catch(e) {
    	hm.debug.writeln(spaces, "ALERT : Because some mistery things in IE, the output is NOT complete!".fontcolor("red"));
    }
    hm.debug._traceUnindent();
    hm.debug.writeln(hm.debug._getTraceIndentSpaces(), "<b>end of array.</b></code>");
}

hm.debug.write = function() {
	if(!hm.debug.enabled)
		return;

	var doc = hm.debug._getDocument();
	for(var it=0; it<arguments.length; ++it)
		doc.write(arguments[it]);
}

hm.debug.writeln = function() {
	if(!hm.debug.enabled)
		return;

	hm.debug.write.apply(this, arguments);
	hm.debug.write("<br/>");
}

hm.debug.dump = function() {
	if(!hm.debug.enabled)
		return;
	var doc = hm.debug._getDocument();
	for(var it=0; it<arguments.length; ++it)
		doc.write(hm.xml.encode(arguments[it]));
}

hm.debug.dumpln = function() {
	if(!hm.debug.enabled)
		return;
	hm.debug.dump.apply(this, arguments);
	hm.debug.write("<br/>");
}

hm.debug.clear = function() {
	if(!hm.debug.enabled)
		return;

	hm.debug._checkTraceStack();
	var win = hm.debug._getWindow();
	win.location.href = "about:blank";
}

hm.debug.createConsole = function() {
	if(!hm.debug.enabled)
		return;

	var frm = document.body.insertBefore(document.createElement("form"), document.body.firstChild);
	frm.onsubmit = hm.debug.onConsoleCommit;

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
        hm.debug.recursiveDumpNode(document.body);
    }
    frm.appendChild(srcBtn);

}

hm.debug.onConsoleCommit = function jsDebugConsole() {
	if(!hm.debug.enabled)
		return;

	hm.debug._checkTraceStack();

    var statement = document.getElementById("jsDebugConsole").value;
    
    try {
		eval(statement);
    }
    catch(e) {
    	alert("错误！\n" + e);
    }
	return false;	// forbid refresh
}

hm.debug.dumpNode = function (node, noAbbr) {
	if(!hm.debug.enabled)
		return;

	hm.debug._checkTraceStack();

	hm.debug.writeln("<code class='traceCode'>");
	hm.debug.write("<hr/>");
	hm.debug.write("<p align='center'>Node Dump</p>");
	hm.debug.write("<hr/>");
	hm.debug._dumpNode(node, hm.debug.CODE_INDENT, noAbbr);
	hm.debug.writeln("<hr/>");
	hm.debug.writeln();
	hm.debug.writeln("</code>");
}

hm.debug._dumpNode = function(node, indent, noAbbr) {
	hm.dom.depthIterateNode2(node, hm.debug.__dumpNode, [indent, noAbbr, 0]);
}

hm.debug.__dumpNode = function(node, param, isPush) {
	var indent = param[0];
	var noAbbr = param[1];
	if(isPush) {
    	switch(node.nodeType) {
        case hm.dom.nodeType.ELEMENT_NODE:
        	hm.debug.write(hm.debug.__getIndentSpaces(param[2] * indent));
        	hm.debug.dump("<");
        	hm.debug.write(node.nodeName.fontcolor("red"));
        	for(var i=0; i<node.attributes.length; ++i) {
        		if(node.attributes[i].specified) {
        			hm.debug.dump(" ");
        			hm.debug.write(node.attributes[i].nodeName.fontcolor("orange"));
        			hm.debug.dump("=\"", node.attributes[i].nodeValue, "\"");
        		}
        	}

        	if(noAbbr || node.hasChildNodes())
        		hm.debug.dumpln(">");
        	break;
        case hm.dom.nodeType.TEXT_NODE:
        	hm.debug.write(hm.debug.__getIndentSpaces(param[2] * indent));
        	var textValue = node.nodeValue.toString();
        	if(!textValue || textValue.length == 0)
        		hm.debug.writeln("*null*".fontcolor("gray"));
        	else
        		hm.debug.dumpln(node.nodeValue);
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
        		hm.debug.write(hm.debug.__getIndentSpaces(param[2] * indent));
        		hm.debug.dump("</");
        		hm.debug.write(node.nodeName.fontcolor("red"));
        		hm.debug.dumpln(">");
        	}
        	else
        		hm.debug.dumpln("/>");
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
}

// this function need xml.hm
hm.debug._recursiveDumpNode = function (node) {
	if(!node)
		return;

	var indentSpace = hm.debug._getCodeIndentSpaces();

	if(!node.tagName) {	// text node
		hm.debug.writeln(indentSpace, node.data ? hm.xml.encode(node.data) : "&lt;null&gt;".fontcolor("cyan"));
		return;
	}

	hm.debug.write(indentSpace, "&lt;", node.tagName.fontcolor("red"));
	if(node.attributes) {
		for(var i=0; i<node.attributes.length; ++i) {
			var it = node.attributes[i];
			if(			it.specified 
					||	(it.nodeName.toLowerCase() == "name" && it.nodeValue)
					||	(it.nodeName.toLowerCase() == "id" && it.nodeValue)
					||	(it.nodeName.toLowerCase() == "value" && it.nodeValue)
			)
				hm.debug.write("&nbsp;", hm.xml.encode(it.nodeName).fontcolor("orange"), "=&#34;", hm.xml.encode(it.nodeValue), "&#34;");
		}
	}

	if(node.hasChildNodes()) {
		hm.debug.writeln("&gt;");
		hm.debug._codeIndent();
		for(var i = 0; i<node.childNodes.length; ++i) {
			it = node.childNodes[i];
			hm.debug._recursiveDumpNode(it);
		}
		hm.debug._codeUnindent();
		hm.debug.writeln(indentSpace, "&lt;/", node.tagName.fontcolor("red"), "&gt;");
	}
	else
		hm.debug.writeln("/&gt;");
}

hm.debug.recursiveDumpNode = function (node) {
	if(!hm.debug.enabled)
		return;

	hm.debug._checkTraceStack();

	hm.debug.writeln("<code class='traceCode'>");
	hm.debug.write("<hr/>");
	hm.debug.write("<p align='center'>Node Dump</p>");
	hm.debug.write("<hr/>");
	hm.debug._recursiveDumpNode(node, hm.debug.CODE_INDENT);
	hm.debug.writeln("<hr/>");
	hm.debug.writeln();
	hm.debug.writeln("</code>");
}

hm.debug._checkTraceStack = function() {
	if(!hm.debug.enabled)
		return;

	var callers = new Array();
	for(var curCaller = hm.debug._checkTraceStack.caller.caller; curCaller; curCaller = curCaller.caller)
		callers.unshift(curCaller);
	var newSize = 0;
	for(; newSize < hm.debug._traceStack.length && newSize < callers.length; ++newSize) {
		if(hm.debug._traceStack[newSize] != callers[newSize] || hm.debug._traceStack[newSize].arguments != callers[newSize].params)
			break;
	}
	for(var j=hm.debug._traceStack.length; j>newSize; --j) {
		var poper = hm.debug._traceStack.pop();
		hm.debug._stackUnindent();
		hm.debug.write("<code class='traceStack'>", hm.debug._getStackIndentSpaces());
		hm.debug.writeln("}", (" // end of " + poper.describeStr).fontcolor("green"), "</code>");
	}

	for(var i=hm.debug._traceStack.length; i<callers.length; ++i) {
		callers[i].describeStr = callers[i].getDescribe(true);
		callers[i].params = callers[i].arguments;
		hm.debug._traceStack.push(callers[i]);
		hm.debug.write("<code class='traceStack'>", hm.debug._getStackIndentSpaces());
		hm.debug.writeln("function ".fontcolor("orange") + callers[i].getDescribe() + " {", "</code>");
		hm.debug._stackIndent();
	}
}

hm.debug._traceAlert = function () {
	var topFunc = hm.debug._topOfTraceStack();
	if(topFunc && !topFunc.alertProned) {
		var msg = "";
		for(var it=0; it < arguments.length; ++it)
			msg += arguments[it];
		if(!window.confirm(msg)) {
			topFunc.alertProned = true;
		}
	}
}

hm.debug.trace = function () {
	hm.debug._checkTraceStack();
//	hm.debug._traceAlert.apply(this, arguments);
	hm.debug.write("<code class='traceMessage'>", hm.debug._getTraceIndentSpaces());
	hm.debug.write.apply(this, arguments);
	hm.debug.writeln("</code>");
}

hm.debug.warn = function() {
	hm.debug._checkTraceStack();
	hm.debug._traceAlert.apply(this, arguments);
	hm.debug.write("<code class='traceWarn'>", hm.debug._getTraceIndentSpaces());
	hm.debug.write.apply(this, arguments);
	hm.debug.writeln("</code>");
}

hm.debug.error = function() {
	hm.debug._checkTraceStack();
	hm.debug.write("<code class='traceError'>", hm.debug._getTraceIndentSpaces(), "ERROR!&nbsp;");
	hm.debug.write.apply(this, arguments);
	hm.debug.writeln("</code>");

	var msg = "";
	for(var it=0; it<arguments.length; ++it)
		msg += arguments[it];
	alert("ERROR!\n" + msg);
}

hm.debug.traceIndent = function() {
	if(!hm.debug.enabled)
		return;

	hm.debug._checkTraceStack();
	if(arguments.length > 0) {
		hm.debug.write("<code class='traceMessage'>", hm.debug._getTraceIndentSpaces());
		hm.debug.write.apply(this, arguments);
		hm.debug.writeln("</code>");
	}
	hm.debug._traceIndent();
}

hm.debug.traceUnindent = function() {
	if(!hm.debug.enabled)
		return;

	hm.debug._traceUnindent();
	if(arguments.length > 0) {
		hm.debug.write("<code class='traceMessage'>", hm.debug._getTraceIndentSpaces());
		hm.debug.write.apply(this, arguments);
		hm.debug.writeln("</code>");
	}
}

hm.debug.__getIndentSpaces = function(num) {
	var spaces = new String;
	for(var i=0; i<num; ++i)
		spaces += "&nbsp;";
	return spaces;
}

hm.debug._stackIndent = function () {
	hm.debug._curStackIndent += hm.debug.STACK_INDENT;
	hm.debug._curTraceIndent = hm.debug._curStackIndent;
}

hm.debug._stackUnindent = function () {
	hm.debug._curStackIndent -= hm.debug.STACK_INDENT;
	hm.debug._curTraceIndent = hm.debug._curStackIndent;
}

hm.debug._getStackIndentSpaces = function () {
	return hm.debug.__getIndentSpaces(hm.debug._curStackIndent);
}

hm.debug._traceIndent = function () {
	hm.debug._curTraceIndent += hm.debug.TRACE_INDENT;
}

hm.debug._traceUnindent = function () {
	hm.debug._curTraceIndent -= hm.debug.TRACE_INDENT;
}

hm.debug._getTraceIndentSpaces = function () {
	return hm.debug.__getIndentSpaces(hm.debug._curTraceIndent);
}

hm.debug._codeIndent = function() {
	hm.debug._curCodeIndent += hm.debug.CODE_INDENT;
}

hm.debug._codeUnindent = function() {
	hm.debug._curCodeIndent -= hm.debug.CODE_INDENT;
}

hm.debug._getCodeIndentSpaces = function() {
	return hm.debug.__getIndentSpaces(hm.debug._curCodeIndent);
}

hm.debug._topOfTraceStack = function() {
	if(hm.debug._traceStack.length)
		return hm.debug._traceStack[hm.debug._traceStack.length - 1];
	else
		return null;
}

hm.debug._makeStr = function(obj, noColor) {
	var str = "";
	var isFirst = true;
	if(obj == null) {
		str = "*null*;";
		if(!noColor)
			str.fontcolor("cyan");
		return str;
	}

	if(!obj.constructor) {
		try {
			str = hm.xml.encode("" + obj);
		}
		catch(e) {
			str = "*It is too mistery to know*";
			if(!noColor)
				str.fontcolor("cyan");
			str = typeof(obj) + str;
		}
	}
	else {
    	switch(obj.constructor) {
    	case 'Function':
    		str = obj.getDescribe(noColor);
    		break;
    	case 'String':
    		str = '"' + hm.xml.encode(obj) + '"';
    		if(!noColor)
    			str = str.fontcolor("gray");
    		break;
    	case 'Number':
    		str = "" + obj;
    		break;
    	default:
    		if(obj.toString && obj.toString) {
    			try {
    				return hm.xml.encode(obj.toString());
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
}

hm.debug.assert = function(condition, errMsg) {
	if(!condition) {
		if(hm.global && hm.global.browser.ie)
			alert("Assert fail! " + errMsg);
		throw("Assert fail! " + errMsg);
	}
}



}	// end of if(typeof(hm.debug) == "undefined")
