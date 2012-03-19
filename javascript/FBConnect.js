/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi
// Contributions, advice from : 
// http://www.pushittolive.com/post/1239874936/facebook-login-on-iphone-phonegap

function FBConnect()
{
	this.facebookkey = 'facebook';
}

FBConnect.prototype.connect = function(options)
{
	this.client_id = options.consumerKey;
	this.client_secret = options.consumerSecret
	this.redirect_uri = options.callbackUrl;
	oauth = OAuth(options);
	var authorize_url  = "https://www.facebook.com/dialog/oauth?";
		authorize_url += "client_id=" + this.client_id;
		authorize_url += "&redirect_uri=" + this.redirect_uri;
		authorize_url += "&display=touch";
		authorize_url += "&response_type=token";
		//authorize_url += "&type=user_agent";
		authorize_url += "&scope=email,read_stream,publish_stream";
    
	window.plugins.childBrowser.showWebPage(authorize_url, 
	            { showLocationBar : false });
	var self = this;
	window.plugins.childBrowser.onLocationChange = function(loc){self.onLocationChange(loc);};
}

FBConnect.prototype.onLocationChange = function(loc)
{
	
	console.log("AppLaudLog: onLocationChange : " + loc);

    // If user hit "No, thanks" when asked to authorize access
    if (loc.indexOf("login_success.html?error_reason=user_denied") >= 0) {
        window.plugins.childBrowser.close();
        return;
    }
    
    // Same as above, but user went to app's homepage instead
    // of back to app. Don't close the browser in this case.
    if (loc === "http://www.facebook.com/connect/login_success.html") {
        return;
    }
    
 // here we get the code
    if (loc.indexOf("login_success.html#access_token") >= 0) {

    	var access_token = loc.match(/access_token=(.*)$/)[1];
    	console.log("facebook token" + access_token); 
    	window.localStorage.setItem(window.plugins.fbConnect.facebookkey, access_token);
    	window.plugins.childBrowser.close();
    	this.onConnect();
    }
}

FBConnect.prototype.getUser = function()
{
	var url = "https://graph.facebook.com/me?access_token=" + window.localStorage.getItem(window.plugins.fbConnect.facebookkey);
	var req = new XMLHttpRequest();
	
	req.open("get",url,true);
	req.send(null);
	req.onerror = function(){alert("Error");};
	return req;
}

// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.fbConnect
FBConnect.install = function()
{
	if(!window.plugins)
	{
		window.plugins = {};	
	}
	window.plugins.fbConnect = new FBConnect();
	return window.plugins.fbConnect;
}

