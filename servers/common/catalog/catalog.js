/**
 * Startup script for the UOW catalog application.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.app.catalog');
dojo.require('dojo.hash');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.StackContainer');
dojo.require('dojox.layout.ContentPane');
dojo.require("dojox.highlight");
dojo.require("dojox.highlight.languages.javascript");
dojo.require("dojox.highlight.languages.pygments.javascript");

dojo.ready(function() {
    dojo.removeClass(dojo.body(), 'loading');
    var tabs = dijit.byId('tabs');
    var h = dojo.hash();
    if(h) {
        tabs.selectChild(dijit.byId(h));
    }
    dojo.subscribe("/dojo/hashchange", function(id) {
        id = id || 'home';
        var pane = dijit.byId(id)
        tabs.selectChild(pane);
    });
    // get server name
    dojo.xhrGet({url : '/libs/servername'}).addCallback(function(response) {
        var tmp = '{0} Server Catalog';
        dojo.byId('subtitle').innerHTML = dojo.replace(tmp, [response]);
    });
    // connect nav links
    var panes = tabs.getChildren();
    var nav = dojo.byId('nav');
    dojo.query('li', nav).forEach(function(item, i) {
        var text = item.innerHTML;
        var node = dojo.create('a', {
            href : '#'+panes[i].id,
            innerHTML : text
        }, item);
        dojo.destroy(item.firstChild);
    });
    
    // connect login / logout
    var login = dojo.byId('loginLink');
    dojo.connect(login, 'onclick', function() {
        uow.triggerLogin().addCallback(location, 'reload');
    });
    var logout = dojo.byId('logoutLink');
    dojo.connect(logout, 'onclick', uow, 'logout');

    // show login / user+logout
    var def = uow.getUser();
    def.addCallback(function(user) {
        if(user.email) {
            // user logged in, show logout
            var node = dojo.byId('userText');
            var welcome = dojo.byId('welcomeText');
            var text = dojo.replace(welcome.innerHTML, [user.email]);
            welcome.innerHTML = text;
            dojo.style(node, 'display', '');
        } else {
            throw new Error('not authed')
        }            
    }).addErrback(function(user) {
        // user logged out, show login
        dojo.style(login, 'display', '');
    });
});

uow.app.catalog.serviceStatus = function(name, available) {
    var status, cssClass;
    if(available) {
        status = 'OK';
        cssClass = 'available';
    } else {
        status = 'NA';
        cssClass = 'unavailable'
    }
    var text = dojo.replace('{name} ({status})', 
        {name : name, status : status});
    dojo.create('li', {
        innerHTML : text,
        'class' : cssClass
    }, 'home_status');
};

uow.app.catalog.parseExamples = function(node) {
    node = dojo.byId(node);
    dojo.query('button', node).connect('onclick', function(event) {
        var code = dojo.byId(event.target.id+'code');
        dojo.create('script', {innerHTML : code.textContent}, dojo.body());
    });
};
