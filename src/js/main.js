

import settings from './settings';
import timeTools from './timeTools';

window.settings = settings;

let parser = new X2JS();

function refreshStatus() {

    let domainsList = settings.refreshDomainSettingsList().domainsArray;
    for (const domain of domainsList) {

        let options = {};
        if (domain.user != "" && domain.pass != "") {
            options.headers = new Headers({
                "Authorization": "Basic " + btoa(domain.user + ":" + domain.pass),
            });
        }

        fetch(domain.url, options)
            .then(response => response.text())
            .then(xmlString => parser.xml_str2json(xmlString).monit)
            .then(function (data) {
                // console.log(data)
                const nickName = domain.nickName || data.server.localhostname;
                updateTable(data, nickName, data.server.id);
            });
    }

}


const serversTabs = [];
function updateTable(monit, nodeName, nodeId) {
    if (document.querySelector("#_" + nodeId + "-services") == null) {

        // in body
        var myElement = document.createElement("section");
        myElement.id = nodeId;
        myElement.classList.add("hero-body");
        if( settings.settingsJson.cycle.fullHeight){
            myElement.classList.add("service-section");
        }
        document.querySelector("#main-content").appendChild(myElement);
        myElement.innerHTML = `
        <div id="_${nodeId}-section"  class="container is-fluid">
            <h1 class="title">${nodeName}</h1>
            <h2 class="subtitle">Last Update it: <strong id="_${nodeId}-updateon" 
                            class="last-update" data-updated-on="${(new Date()).getTime()}"></strong></h2>
            <div id="_${nodeId}-services" class="columns is-multiline"></div>
        </div>`

        // in tab
        var myElement2 = document.createElement("button");
        myElement.id =  "_" + nodeId + "-tab";
        serversTabs.push( "_" + nodeId + "-services"  )
        myElement2.onclick = function() { settings.scrollToCard( "_" + nodeId + "-services" ) };
        myElement2.innerHTML = nodeName;
        myElement2.classList.add("button");
        myElement2.classList.add("is-light");
        document.querySelector("#servers-tabs").appendChild(myElement2);
    }

    document.querySelector("#_" + nodeId + "-services").innerHTML = "";
    let text;
    monit.service.forEach(function (service, serviceKey) {

        service.port ? "" : service.port = {
            port: ""
        };

        text = `

            <div class="column is-one-fifth is-flex">
            <div class="card ${ service.status === "0" ? ` card-status-ok ` : ` card-status-failing `}">
                <header class="card-header" title="${service.name}">
                <h2 id="${ "_" + nodeId + "_" + serviceKey}" class="card-header-title ellipsis">

                ${service.name}
                </h2>
                </header>
                <div class="card-content">
                <div class="content columns is-centered">
                    <img
                    class="service-logo" src="/images/${
                service.port.protocol === "REDIS" ? `redis.png`
                : service.port.protocol === "PGSQL" ? `postgres.png`
                : service.port.protocol === "MYSQL" ? `mysql.png`
                // : service.port.protocol=== "nginx" ? `nginx.png`
                : service.port.protocol === "SSH" ? `ssh.png`
                : (service.name === "stark" || service.name === "banshee") ? `ziwo.png`
                : `unknown.png`
            }"></img>
                </div>
                </div>
            </div>
            </div>

    `;

        document.querySelector("#_" + nodeId + "-services").innerHTML += text;
        if (service.port.protocol == "HTTP") {
            favIconStore("_" + nodeId + "_" + serviceKey, service.name)
        }

    });
    document.querySelector("#_" + nodeId + "-updateon").setAttribute("data-updated-on", String((new Date()).getTime()) );
}


let imgIconStoreArray = {};
let imgIconBannedArray = [];
function favIconStore(appendId, serviceName) {
    if (imgIconStoreArray[serviceName]) {
        document.querySelector("#" + appendId).prepend(imgIconStoreArray[serviceName]);

    } else if (imgIconBannedArray.indexOf(serviceName) == -1) {

        let imgComponent = document.createElement("img");
        imgComponent.width = "16";
        imgComponent.height = "16";
        imgComponent.src = "http://" + serviceName + "/favicon.ico";
        imgComponent.classList.add("img" + appendId)
        imgComponent.onerror = function (e) {
            e.preventDefault;
            let failedImages = document.querySelectorAll(".img" + appendId);
            for (let i = 0; i < failedImages.length; ++i) {
                failedImages[i].remove();
            }
            // remove from imgIconStoreArray
            delete imgIconStoreArray[serviceName];
            // Add to banned list
            imgIconBannedArray.push(serviceName);
        };
        imgIconStoreArray[serviceName] = imgComponent;
        document.querySelector("#" + appendId).prepend(imgIconStoreArray[serviceName]);


    }
}


window.onload = function () {

    refreshStatus();
    setInterval(refreshStatus, 3000);

    checkLastUpdate();
    setInterval(checkLastUpdate, 500);

    if( settings.settingsJson.cycle.autostart ){
        setTimeout(() => {
            cardScroller();
            setInterval(cardScroller, settings.settingsJson.cycle.interval);
        }, 1000);
    }
}

function checkLastUpdate() {

    let updateTimes = document.querySelectorAll(".last-update");

    for (let updateTime of Array.from(updateTimes)) {
        const updatedOn = new Date( Number(updateTime.getAttribute("data-updated-on")));
        updateTime.innerHTML = timeTools.showDiff( updatedOn, new Date() );
        if ((new Date() - updatedOn) < 20 * 1000) {
            updateTime.classList.remove("card-status-failing");
        } else {
            updateTime.classList.add("card-status-failing");
        }
    }
}



let cardScrollerIndex = 0;
function cardScroller(){

    if( cardScrollerIndex >= serversTabs.length ){
        cardScrollerIndex = 0;
    }
    if(serversTabs.length !== 0) {
        settings.scrollToCard(serversTabs[cardScrollerIndex]);
        cardScrollerIndex++;
    }
}
// cardScroller();

