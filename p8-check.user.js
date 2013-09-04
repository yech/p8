// ==UserScript==
// @id             iitc-plugin-check-l8-portal-tasks@yech
// @name           IITC plugin: check l8 portal tasks
// @version        0.0.1.20130610.175822
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUILDNAME@@-@@BUILDDATE@@] Check L8 portal tasks
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper() {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if (typeof window.plugin !== 'function') {
        window.plugin = function () {
        };
    }


    // PLUGIN START ////////////////////////////////////////////////////////

    // use own namespace for plugin
    window.plugin.l8TasksCheck = function () {
    };

    window.plugin.l8TasksCheck.config = {
        filter:2,
        sortBy:'level',
        descSort:false,
        dialogLeft:null,
        dialogTop:null,
        users:'luoxuan,Likefood,phoeagon,marstone,sunqiang,xiaolee,yech,kanew',
        displayExcluded:false,
        excludedPortals:''
    };

    var config = window.plugin.l8TasksCheck.config;

    window.plugin.l8TasksCheck.setConfig = function (configName, configValue) {
        window.plugin.l8TasksCheck.config[configName] = configValue;
        window.plugin.l8TasksCheck.saveConfig();
    };

    window.plugin.l8TasksCheck.saveConfig = function () {
        window.localStorage['l8-check'] = JSON.stringify(window.plugin.l8TasksCheck.config);
    };

    window.plugin.l8TasksCheck.loadConfig = function () {
        window.plugin.l8TasksCheck.config = JSON.parse(window.localStorage['l8-check']);
    };

    window.plugin.l8TasksCheck.setupCallback = function (data) {
        if (localStorage.getItem("l8-check") == null) {
            window.plugin.l8TasksCheck.saveConfig();
        } else {
            window.plugin.l8TasksCheck.loadConfig();
        }

        $('#toolbox').append(' <a onclick="window.plugin.l8TasksCheck.refresh();return false;" title="check whether users should deploy L8 res!">L8</a>');

        $('head').append('<style>' +
            '#dialog-l8TasksCheck {max-height:260px !important}' +
            '.ui-dialog-l8TasksCheck {max-width: 1400px !important; width: auto !important;max-height:360px !important}' +
            '.ui-dialog-content {max-width: 1400px !important;}' +
            '#l8TasksCheck table {margin-top:5px; border-collapse: collapse; empty-cells: show; width:100%; clear: both;}' +
            '#l8TasksCheck table td, #l8TasksCheck table th {border-bottom: 1px solid #0b314e; padding:3px; color:white; background-color:#1b415e}' +
            '#l8TasksCheck table tr.res td {  background-color: #005684; }' +
            '#l8TasksCheck table tr.enl td {  background-color: #017f01; }' +
            '#l8TasksCheck table tr.neutral td {  background-color: #000000; }' +
            '#l8TasksCheck table th { text-align:center;}' +
            '#l8TasksCheck table td { text-align: center;}' +
            '#l8TasksCheck table td.L0 { background-color: #000000 !important;}' +
            '#l8TasksCheck table td.L1 { background-color: #FECE5A !important;}' +
            '#l8TasksCheck table td.L2 { background-color: #FFA630 !important;}' +
            '#l8TasksCheck table td.L3 { background-color: #FF7315 !important;}' +
            '#l8TasksCheck table td.L4 { background-color: #E40000 !important;}' +
            '#l8TasksCheck table td.L5 { background-color: #FD2992 !important;}' +
            '#l8TasksCheck table td.L6 { background-color: #EB26CD !important;}' +
            '#l8TasksCheck table td.L7 { background-color: #C124E0 !important;}' +
            '#l8TasksCheck table td.L8 { background-color: #9627F4 !important;}' +
            '#l8TasksCheck table td.need { background-color: #B92424 !important;}' +
            '#l8TasksCheck table td:nth-child(1) { text-align: left;}' +
            '#l8TasksCheck table th { text-align: center;}' +
            '#l8TasksCheck table th:nth-child(1) { text-align: left;}' +
            '#l8TasksCheck table th.sorted { color:#FFCE00; }' +
            '#l8TasksCheck .filterAll { margin-top:10px;}' +
            '#l8TasksCheck .filterRes { margin-top:10px; background-color: #005684  }' +
            '#l8TasksCheck .filterEnl { margin-top:10px; background-color: #017f01  }' +
            '#l8TasksCheck .disclaimer { margin-top:10px; font-size:10px; }' +
            '</style>');
    };

    window.plugin.l8TasksCheck.highlight = function (data) {

        var d = data.portal.options.details;
        var portal_weakness = 0;
        if (getTeam(d) !== 0) {
            var color = '';
            var opacity = 1;
            if (PLAYER.guid === d.captured.capturingPlayerId) {
                color = 'gray';
            }

            if (color !== '') {
                data.portal.setStyle({fillColor:color, fillOpacity:opacity});
            } else {
                data.portal.setStyle({color:COLORS[getTeam(data.portal.options.details)],
                    fillOpacity:0.5});
            }
        }
        window.COLOR_SELECTED_PORTAL = '#f0f';

    };

    //fill the listPortals array with portals avalaible on the map (level filtered portals will not appear in the table)
    window.plugin.l8TasksCheck.getPortals = function () {
        //filter : 0 = All, 1 = Res, 2 = Enl
        //console.log('** getPortals');
        var retval = false;

        var displayBounds = map.getBounds();

        window.plugin.l8TasksCheck.listPortals = [];
        //get portals informations from IITC
        $.each(window.portals, function (i, portal) {
            // eliminate offscreen portals (selected, and in padding)
            if (!displayBounds.contains(portal.getLatLng())) return true;

            retval = true;
            var d = portal.options.details;
            var name = d.portalV2.descriptiveText.TITLE;
            var address = d.portalV2.descriptiveText.ADDRESS;
            var img = d.imageByUrl && d.imageByUrl.imageUrl ? d.imageByUrl.imageUrl : DEFAULT_PORTAL_IMG;
            var team = portal.options.team;
            switch (team) {
                case 1 :
                    window.plugin.l8TasksCheck.resP++;
                    break;
                case 2 :
                    window.plugin.l8TasksCheck.enlP++;
                    break;
            }
            var level = getPortalLevel(d).toFixed(2);
            var guid = portal.options.guid;


            //get resonators informations
            var resonators = []; // my local resonator array : reso level, reso deployed by, distance to portal, energy total, max
            var energy = 0;
            var maxenergy = 0;
            $.each(portal.options.details.resonatorArray.resonators, function (ind, reso) {
                if (reso) {
                    resonators[ind] = [reso.level, window.getPlayerName(reso.ownerGuid), reso.distanceToPortal, reso.energyTotal, RESO_NRG[reso.level]];
                    energy += reso.energyTotal;
                    maxenergy += RESO_NRG[reso.level];
                } else {
                    resonators[ind] = [0, '', 0, 0, 0];
                }
            });


            //get shield informations
            var shields = [];
            $.each(d.portalV2.linkedModArray, function (ind, mod) {
                if (mod) {
                    //shields[ind] = mod.rarity.capitalize().replace('_', ' ');
                    shields[ind] = [mod.rarity.substr(0, 1).capitalize(), getPlayerName(mod.installingUser)];
                } else {
                    shields[ind] = ['', ''];
                }
            });


            var thisPortal = {'portal':d, 'name':name, 'team':team, 'level':level, 'guid':guid, 'resonators':resonators,
                'shields':shields, 'address':address, 'img':img};
            window.plugin.l8TasksCheck.listPortals.push(thisPortal);
        });

        return retval;
    };


    window.plugin.l8TasksCheck.hideExclude = function () {
        window.plugin.l8TasksCheck.setConfig('displayExcluded', false);
        window.plugin.l8TasksCheck.refresh();
        return false;
    };

    window.plugin.l8TasksCheck.showExclude = function () {
        window.plugin.l8TasksCheck.setConfig('displayExcluded', true);
        window.plugin.l8TasksCheck.refresh();
        return false;
    };

    window.plugin.l8TasksCheck.check = function (sortBy, descSort) {
        if (sortBy !== undefined) {
            window.plugin.l8TasksCheck.setConfig('sortBy', sortBy);
        }
        if (descSort !== undefined) {
            window.plugin.l8TasksCheck.setConfig('descSort', descSort);
        }
        var html = '<div>User Ids:<input id="l8users" value="' + window.plugin.l8TasksCheck.config.users + '"  ' +
            'style="width:500px"/>&nbsp;&nbsp;' +
            '<a onclick="window.plugin.l8TasksCheck.refresh();return false;" title="click here to refresh portal list after you change users">refresh</a>&nbsp;&nbsp;&nbsp;';
        if (window.plugin.l8TasksCheck.config.displayExcluded) {
            html += '<a onclick="window.plugin.l8TasksCheck.hideExclude()" title="don\'t display excluded portals in list">hide excluded</a>&nbsp;&nbsp;';
        } else {
            html += '<a onclick="window.plugin.l8TasksCheck.showExclude()" title="display excluded portals in list">show excluded</a>&nbsp;&nbsp;';
        }
        html += '</div>';
        if (window.plugin.l8TasksCheck.getPortals()) {
            html += window.plugin.l8TasksCheck.portalTable();
        } else {
            html = '<table><tr><td>Nothing to show!</td></tr></table>';
        }
        var option = {
            html:'<div id="l8TasksCheck">' + html + '</div>',
            dialogClass:'ui-dialog-l8TasksCheck',
            title:'Portals need L8 resonators: ',
            id:'l8TasksCheck',
            modal:false,
            position:{
                my:'center bottom',
                at:'center bottom',
                of:window
            },
            dragStop:function (event, ui) {
                window.plugin.l8TasksCheck.setConfig('dialogLeft', ui.position.left);
                window.plugin.l8TasksCheck.setConfig('dialogTop', ui.position.top);
            }
        };

        if (window.plugin.l8TasksCheck.config.dialogLeft != null) {
            option.position = [window.plugin.l8TasksCheck.config.dialogLeft, window.plugin.l8TasksCheck.config.dialogTop];
        }
        dialog(option);

    };

    // portal link - single click: select portal
    //               double click: zoom to and select portal
    //               hover: show address
    // code from getPortalLink function by xelio from iitc: AP List - https://raw.github.com/breunigs/ingress-intel-total-conversion/gh-pages/plugins/ap-list.user.js
    window.plugin.l8TasksCheck.getPortalLink = function (portal, guid) {

        var latlng = [portal.locationE6.latE6 / 1E6, portal.locationE6.lngE6 / 1E6].join();
        var jsSingleClick = 'window.renderPortalDetails(\'' + guid + '\');return false';
        var jsDoubleClick = 'window.zoomToAndShowPortal(\'' + guid + '\', [' + latlng + ']);return false';
        var perma = '/intel?latE6=' + portal.locationE6.latE6 + '&lngE6=' + portal.locationE6.lngE6 + '&z=17&pguid=' + guid;

        //Use Jquery to create the link, which escape characters in TITLE and ADDRESS of portal
        var a = $('<a>', {
            "class":'help',
            text:portal.portalV2.descriptiveText.TITLE,
            title:portal.portalV2.descriptiveText.ADDRESS,
            href:perma,
            onClick:jsSingleClick,
            onDblClick:jsDoubleClick
        })[0].outerHTML;
        return '<div style="max-height: 15px !important; min-width:140px !important;max-width:180px !important; overflow: hidden; text-overflow:ellipsis;">' + a + '</div>';
    };

    window.plugin.l8TasksCheck.refresh = function () {
        var users = $("#l8users").val();
        if (users !== undefined) {
            window.plugin.l8TasksCheck.setConfig('users', users);
        }
        window.plugin.l8TasksCheck.resetColor();
        window.plugin.l8TasksCheck.check();
    };

    window.plugin.l8TasksCheck.getNeedL8ResCount = function (resonators) {
        var count = 0;
        for (var slot = 0; slot < 8; slot++) {
            if (resonators[slot][0] === 8) {
                count++;
            }
        }
        return 8 - count;
    };

    window.plugin.l8TasksCheck.resetColor = function () {
        $.each(window.portals, function (i, portal) {
            //portalResetColor(portal);
            portal.setStyle({color:COLORS[getTeam(portal.options.details)],fillOpacity:0.5});
        });
    };

    window.plugin.l8TasksCheck.highlightUserPortals = function (user, need, filter) {
        var displayBounds = map.getBounds();
        var excludedPortals = window.plugin.l8TasksCheck.config.excludedPortals;
        $.each(window.portals, function (i, portal) {
            portalResetColor(portal);
            var portalInfo = portal.options;
            if (portalInfo.level < 8 && (portalInfo.team == filter || portalInfo.team == 0) && need) {
                if (window.plugin.l8TasksCheck.config.displayExcluded === true || excludedPortals.indexOf(portalInfo.guid) == -1) {
                    if (!displayBounds.contains(portal.getLatLng()))
                        return;

                    var foundRes = false;
                    $.each(portalInfo.details.resonatorArray.resonators, function (ind, reso) {
                        if (reso && reso.ownerGuid == window.playerNameToGuid(user) && reso.level == 8) {
                            foundRes = true;
                        }
                    });
                    if (!foundRes) {
                        portal.bringToFront().setStyle({color:"#f0f"});
                    }
                }
            }
        });
    };

    window.plugin.l8TasksCheck.sort = function (datas, sortBy, descOrder) {
        if (datas.length === 0) return;
        if (datas[0][sortBy] === undefined) return;

        var sortPortalData = function (dataA, dataB) {
            var valA = dataA[sortBy],
                valB = dataB[sortBy];
            if (valA === valB) return 0;
            return (valA < valB) ? -1 : 1;
        };
        if (descOrder) {
            datas.sort(sortPortalData).reverse();
        } else {
            datas.sort(sortPortalData);
        }
    };

    window.plugin.l8TasksCheck.excludePortal = function (guid) {
        var excludedPortals = window.plugin.l8TasksCheck.config.excludedPortals;
        if (excludedPortals === undefined || excludedPortals === null || excludedPortals === '') {
            window.plugin.l8TasksCheck.setConfig('excludedPortals', guid);
        } else {
            if (excludedPortals.indexOf(guid) === -1) {
                var s = excludedPortals.split(",");
                var newExcludePortals = '';
                for (var i = 0; i < s.length; i++) {
                    if (s[i].trim() !== '') {
                        newExcludePortals += s[i] + ",";
                    }
                }
                window.plugin.l8TasksCheck.setConfig('excludedPortals', (newExcludePortals + ',' + guid));
            }
        }
    };

    window.plugin.l8TasksCheck.recoverExcludedPortal = function (guid) {

        var excludedPortals = window.plugin.l8TasksCheck.config.excludedPortals;
        if (!(excludedPortals === undefined || excludedPortals === null || excludedPortals === '')) {
            if (excludedPortals.indexOf(guid) !== -1) {
                var s = excludedPortals.split(",");
                var newExcludedPortals = '';
                for (var i = 0; i < s.length; i++) {
                    if (s[i].trim() !== '' && s[i].trim() !== guid) {
                        newExcludedPortals += s[i] + ",";
                    }
                }
                window.plugin.l8TasksCheck.setConfig('excludedPortals', (newExcludedPortals));
            }
        }
    };

    window.plugin.l8TasksCheck.portalTable = function () {
        var sortBy = window.plugin.l8TasksCheck.config.sortBy,
            descSort = window.plugin.l8TasksCheck.config.descSort,
            filter = window.plugin.l8TasksCheck.config.filter,
            users = window.plugin.l8TasksCheck.config.users.split(','),
            excludedPortals = window.plugin.l8TasksCheck.config.excludedPortals,
            displayExcluded = window.plugin.l8TasksCheck.config.displayExcluded;

        // sortOrder <0 ==> desc, >0 ==> asc, i use sortOrder * -1 to change the state
        console.log('sort by ' + sortBy + (descSort == true ? ' d' : '') + ' filter:' + filter + ' users:' + users);
        var portals = window.plugin.l8TasksCheck.listPortals;

        var getSortTableFunctionCall = function (sortBy, highLight) {
            var func = 'window.plugin.l8TasksCheck.check(\'' + sortBy + '\',' + (descSort == true ? 'false' : 'true') + ');';
            func += 'window.plugin.l8TasksCheck.highlightUserPortals(\'' + sortBy + '\',' + (highLight ? 'true' : 'false') + ',' + filter + ');';
            return func + 'return false;';
        };

        var html = '';
        html += '<table>'
            + '<tr><th>Portal</th>'
            + '<th><a onclick="' + getSortTableFunctionCall('level', false) + '">Level</a></th>'
            + '<th><a onclick="' + getSortTableFunctionCall('need', false) + '">Need</a></th>';
        for (var userIndex = 0; userIndex < users.length; userIndex++) {
            var user = users[userIndex];
            if (user.trim() === '') continue;
            html += '<th><a onclick="' + getSortTableFunctionCall(user, descSort) + '">' + user + '</a></th>';
        }
        html += '<th>&nbsp;&nbsp;</th></tr>';


        var datas = [];

        $.each(portals, function (ind, portal) {

            if ((portal.team === filter || portal.team === 0 ) && portal.level != 8) {
                if (displayExcluded === true || excludedPortals.indexOf(portal.guid) == -1) {
                    var resonators = portal.resonators;

                    var data = {
                        portal:portal,
                        level:portal.level,
                        need:window.plugin.l8TasksCheck.getNeedL8ResCount(resonators)
                    };

                    for (userIndex = 0; userIndex < users.length; userIndex++) {
                        var user = users[userIndex], found = false;
                        if (user.trim() === '') continue;
                        data[user] = 'N';
                        for (var slot = 0; slot < 8; slot++) {
                            if (resonators[slot][0] === 8 && (resonators[slot][1].toLowerCase() === user.toLowerCase())) {
                                data[user] = 'Y';
                                break;
                            }
                        }
                    }
                    datas.push(data);
                }
            }
        });

        window.plugin.l8TasksCheck.sort(datas, sortBy, descSort);
        for (var dataIndex = 0; dataIndex < datas.length; dataIndex++) {
            var data = datas[dataIndex],
                portal = data.portal,
                isExcluded = excludedPortals.indexOf(portal.guid) !== -1;
            html += '<tr class="' + (portal.team === 1 ? 'res' : (portal.team === 2 ? 'enl' : 'neutral')) + '">'
                + '<td>' + window.plugin.l8TasksCheck.getPortalLink(portal.portal, portal.guid) + '</td>'
                + '<td class="L' + Math.floor(portal.level) + '">' + portal.level + '</td>'
                + '<td>' + data.need + '</td>';
            for (userIndex = 0; userIndex < users.length; userIndex++) {
                user = users[userIndex];
                if (user.trim() === '') continue;
                html += '<td ' + (data[user] === 'N' ? 'class="need"' : '') + '>' + data[user] + '</td>';
            }
            if (isExcluded) {
                html += '<td><a style="color:red" onclick="' + 'window.plugin.l8TasksCheck.recoverExcludedPortal(\'' + portal.guid + '\');' +
                    'window.plugin.l8TasksCheck.check(\'' + sortBy + '\',' + descSort +
                    ');return false;" title="recover this portal from excluded portal list">recover</a></td></tr>';
            } else {
                html += '<td><a onclick="' + 'window.plugin.l8TasksCheck.excludePortal(\'' + portal.guid + '\');' +
                    'window.plugin.l8TasksCheck.check(\'' + sortBy + '\',' + descSort +
                    ');return false;" title="exclude this portal from task list">exclude</a></td></tr>';
            }

        }


        html += '</table>';

        return html;
    };

    var setup = function () {
        window.plugin.l8TasksCheck.setupCallback();
    };

    // PLUGIN END //////////////////////////////////////////////////////////

    if (window.iitcLoaded && typeof setup === 'function') {
        setup();
    } else {
        if (window.bootPlugins) {
            window.bootPlugins.push(setup);
        } else {
            window.bootPlugins = [setup];
        }
    }
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);
