// ==UserScript== 
// @version         1.2
// @name            VacChecker
// @namespace       https://github.com/muedsa/VacBanChecker
// @description  	Shows vac bans underneath players on steam(now support for new steam UI)
// @include     	http://steamcommunity.com/id/*
// @include     	http://steamcommunity.com/profiles/*
// @include     	http://steamcommunity.com/groups/*
// @include     	https://steamcommunity.com/id/*
// @include     	https://steamcommunity.com/profiles/*
// @include     	https://steamcommunity.com/groups/*
// @homepageURL     https://github.com/muedsa/VacBanChecker
// @frok form       https://github.com/Levitas/VacBanChecker
// @license         Apache-2.0
// @noframes
// ==/UserScript==
(function(){
    // Javascript does not work well with integers greater than 53 bits precision... So we need
    // to do our maths using strings.
    function getDigit(x, digitIndex) {
        return (digitIndex >= x.length) ? "0" : x.charAt(x.length - digitIndex - 1);
    }
    function prefixZeros(strint, zeroCount) {
        var result = strint;
        for (var i = 0; i < zeroCount; i++) {
            result = "0" + result;
        }
        return result;
    }
    //Only works for positive numbers, which is fine in our use case.
    function add(x, y) {
        var maxLength = Math.max(x.length, y.length);
        var result = "";
        var borrow = 0;
        var leadingZeros = 0;
        for (var i = 0; i < maxLength; i++) {
            var lhs = Number(getDigit(x, i));
            var rhs = Number(getDigit(y, i));
            var digit = lhs + rhs + borrow;
            borrow = 0;
            while (digit >= 10) {
                digit -= 10;
                borrow++;
            }
            if (digit === 0) {
                leadingZeros++;
            } else {
                result = String(digit) + prefixZeros(result, leadingZeros);
                leadingZeros = 0;
            }
        }
        if (borrow > 0) {
            result = String(borrow) + result;
        }
        return result;
    }

    function getId(friend) {
        var steam64identifier = "76561197960265728";
        var miniProfileId = friend.attributes.getNamedItem('data-miniprofile').value;
        return add(steam64identifier, miniProfileId);
    }

    function setVacation(player) {
        var friendElements = lookup[player.SteamId];

        friendElements.forEach(function(friend) {
            if(document.querySelectorAll('#friends_list .friend_block_v2').length > 0){
                friend.querySelector('.selectable .indicator').style.display = "block";
                friend.querySelector('.selectable .indicator').innerHTML = "";
                friend.querySelector('.selectable .indicator').style.background = "rgb(43, 203, 64)";
                friend.querySelector('.selectable .indicator').style.color = "#FFFFFF";
                if (player.NumberOfVACBans) {
                    friend.querySelector('.selectable .indicator').style.background = "rgb(255, 73, 73)";
                    friend.querySelector('.selectable .indicator').innerHTML = "OW";
                }
                if (player.NumberOfGameBans) {
                    friend.querySelector('.selectable .indicator').style.background = "rgb(255, 73, 73)";
                    friend.querySelector('.selectable .indicator').innerHTML = "VAC";
                }
            }
            

            if(document.querySelectorAll('#memberList .member_block').length > 0){
                alert();
                var icon = friend.querySelector('.rank_icon');
                if(icon){
                    icon.style.background = "rgb(43, 203, 64)";
                    if (player.NumberOfVACBans) {
                        icon.style.background = "rgb(255, 73, 73)";
                        iconfriend.querySelector('.selectable .indicator').innerHTML = "VAC";
                    }
                    if (player.NumberOfGameBans) {
                        icon.style.background = "rgb(255, 73, 73)";
                        icon.innerHTML = "OW";
                    }
                }else{
                    icon = document.createElement('div')
                    icon.attributes('class', 'rank_icon');
                    icon.attributes('class', 'rank_icon');
                    icon.style.background = "rgb(43, 203, 64)";
                    if (player.NumberOfVACBans) {
                        icon.style.background = "rgb(255, 73, 73)";
                        iconfriend.querySelector('.selectable .indicator').innerHTML = "OW";
                    }
                    if (player.NumberOfGameBans) {
                        icon.style.background = "rgb(255, 73, 73)";
                        icon.innerHTML = "VAC";
                    }
                }
            }
        });
    }

    function onData(xmlHttp) {
        if (xmlHttp.readyState === XMLHttpRequest.DONE && xmlHttp.status === 200) {
            var data = JSON.parse(xmlHttp.responseText);
            data.players.forEach(setVacation);
        }
    }

    function makeApiCall(ids) {
        var xmlHttp = new XMLHttpRequest();
        //API only allows 100 steam ids at once.
        var endpointRoot = 'https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=12A1D1DE83F9932934EDD6DF2BA00463&steamids=';
        var endpoint = endpointRoot + ids.join(',');

        xmlHttp.onreadystatechange = function() { onData(xmlHttp); };
        xmlHttp.open('GET', endpoint, true);
        xmlHttp.send();
    }

    var friends = [].slice.call(document.querySelectorAll('#friends_list .friend_block_v2, #memberList .member_block'));
    var lookup = {};

    //console.log(friends);

    friends.forEach(function(friend) {
        var id = getId(friend);
        if (!lookup[id]) {
            lookup[id] = [];
        }
        lookup[id].push(friend);
    });

    var ids = Object.keys(lookup);


    console.log(ids);

    while (ids.length > 0) {
        var batch = ids.splice(0, 100);
        makeApiCall(batch);
    }
})();