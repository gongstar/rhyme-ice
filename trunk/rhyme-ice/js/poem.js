function Poem_T() {
	this.i_words = new Array();
	this.i_text = new Array();
	this.i_move = false;	// 本来不该在这里，用作焦点移位计数
	
	this.addWord = function (word) {
		if(!word)
			return;
		for(var i = 0; i < word.length; ++i) {
			this.i_words.push(word.charAt(i));
			this.i_text.push(word.charAt(i));
		}
	}
	
	this.addDelimit = function (delimit) {
		if(!delimit)
			return;
		for(var i = 0; i < delimit.length; ++i)
			this.i_text.push(delimit.charAt(i));
	}
	
	this.getText = function () {
		if(this.i_words.length == 0)
			return "";
		else
			return this.i_text.join("");
	}
}
