/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi
// Contributions, advice from : 
// http://www.pushittolive.com/post/1239874936/facebook-login-on-iphone-phonegap

function TwitterConnect()
{
	this.twitterKey = 'twitter';
}

TwitterConnect.prototype.connect = function(options)
{
	var tobj = this;
	oauth = OAuth(options);
    oauth.get('https://api.twitter.com/oauth/request_token',
            function(data) {
                requestParams = data.text;
                window.plugins.childBrowser.showWebPage('https://api.twitter.com/oauth/authorize?'+data.text, 
                        { showLocationBar : false }); 
                if (typeof window.plugins.childBrowser.onLocationChange !== "function") {
                    window.plugins.childBrowser.onLocationChange = function(loc){
                    	   // If user hit "No, thanks" when asked to authorize access
                        if (loc.indexOf("http://tastykhana.in/?denied") >= 0) {
                            $('#oauthStatus').html('<span style="color:red;">User declined access</span>');
                            window.plugins.childBrowser.close();
                            return;
                        }

                        // Same as above, but user went to app's homepage instead
                        // of back to app. Don't close the browser in this case.
                        if (loc === "http://tastykhana.in") {
                            $('#oauthStatus').html('<span style="color:red;">User declined access</span>');
                            return;
                        }
                        
                        // The supplied oauth_callback_url for this session is being loaded
                        if (loc.indexOf("http://tastykhana.in") >= 0) {
                            var index, verifier = '';            
                            var params = loc.substr(loc.indexOf('?') + 1);
                            
                            params = params.split('&');
                            for (var i = 0; i < params.length; i++) {
                                var y = params[i].split('=');
                                if(y[0] === 'oauth_verifier') {
                                    verifier = y[1];
                                }
                            }
                       
                            // Exchange request token for access token
                            oauth.get('https://api.twitter.com/oauth/access_token?oauth_verifier='+verifier+'&'+requestParams,
                                    function(data) {               
                                        var accessParams = {};
                                        var qvars_tmp = data.text.split('&');
                                        for (var i = 0; i < qvars_tmp.length; i++) {
                                            var y = qvars_tmp[i].split('=');
                                            accessParams[y[0]] = decodeURIComponent(y[1]);
                                        }
                                        console.log('AppLaudLog: ' + accessParams.oauth_token + ' : ' + accessParams.oauth_token_secret);
                                        oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
                                        
                                        // Save access token/key in localStorage
                                        var accessData = {};
                                        accessData.accessTokenKey = accessParams.oauth_token;
                                        accessData.accessTokenSecret = accessParams.oauth_token_secret;
                                        console.log("AppLaudLog: Storing token key/secret in localStorage");
                                        window.localStorage.setItem(window.plugins.twitterConnect.twitterKey, JSON.stringify(accessData));
                                        window.plugins.childBrowser.close();
                                        window.plugins.twitterConnect.onConnect();
                                },
                                function(data) { 
                                    console.log("AppLaudLog: 1 Error " + data.text); 
                                    $('#oauthStatus').html('<span style="color:red;">Error during authorization</span>');
                                }
                            );
                        }
                    };
                }
            },
            function(data) { 
                window.plugins.childBrowser.close();
            }
    );
}

TwitterConnect.prototype.onLocationChange = function(loc)
{

 
}

TwitterConnect.prototype.getUser = function( options )
{
    oauth = OAuth(options);
	oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',
        function(data) {
            var entry = JSON.parse(data.text);
            window.localStorage.setItem('twitter_info',data.text);
            console.log("AppLaudLog: screen_name: " + entry.screen_name);
            window.plugins.twitterConnect.onConnect();
        },
        function(data) { 
            alert('Error getting user credentials'); 
            console.log("AppLaudLog: Error " + data); 
            $('#oauthStatus').html('<span style="color:red;">Error getting user credentials</span>');
        }
    );             
}

// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.fbConnect
TwitterConnect.install = function()
{
	if(!window.plugins)
	{
		window.plugins = {};	
	}
	window.plugins.twitterConnect = new TwitterConnect();
	return window.plugins.twitterConnect;
}

