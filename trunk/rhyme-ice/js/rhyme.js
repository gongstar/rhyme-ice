if(typeof(com) == "undefined" || com == null)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.ice)
	com.hm_x.ice = new Object();
if(!com.hm_x.ice.Rhyme)
    com.hm_x.ice.Rhyme = function()
{
}
    
if(!com.hm_x.ice.NewRhyme)
	com.hm_x.ice.NewRhyme = function() 
{
    this.base = com.hm_x.ice.Rhyme;
    this.base();
}

if(!com.hm_x.ice.PsRhyme)
    com.hm_x.ice.PsRhyme = function()
{
    this.base = com.hm_x.ice.Rhyme;
    this.base();
}
