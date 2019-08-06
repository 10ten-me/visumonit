import * as settings from "./settings";
import * as timeTools from "./timeTools";
import X2JS from "x2js";

window.settings = settings; // so the html elements with onclick can access it
const parser = new X2JS();

window.onload = () => {

    refreshStatus();
    setInterval(refreshStatus, 5000);

    checkLastUpdate();
    setInterval(checkLastUpdate, 500);

    if( settings.settingsJson.cycle.autostart ){
        setTimeout(() => {
            cardScroller();
            setInterval(cardScroller, settings.settingsJson.cycle.interval);
        }, 10000);
    }

};

// fetch the xml configs from the servers and prepare them to be displayed
const failedDomainsArray = {};
const refreshStatus = () => {

    const domainsList = settings.refreshDomainSettingsList().domainsArray;
    for (const domain of domainsList) {

        const options = {};
        if (domain.user !== "" && domain.pass !== "") {
            options.headers = new Headers({
                "Authorization": "Basic " + btoa(domain.user + ":" + domain.pass),
            });
        }

        fetch(domain.url, options)
            .then(response => response.text())
            .then(xmlString => parser.xml2js(xmlString).monit)
            .then((data) => {
                // TODO: explain the reason behind the _
                delete failedDomainsArray[ "_" + domain.url ];
                const nickName = domain.nickName || data.server.localhostname; // if not specified in the config get default one
                updateTable(data, nickName, data.server.id);
            }).catch( (e) => {
                failedDomainsArray[ "_" + domain.url ] = e;
            });
    }

    // show domains with error
    if(Object.keys(failedDomainsArray).length === 0 ){
        document.querySelector("#domains-errors").style.display = "none";
    } else{
        document.querySelector("#domains-errors").style.display = "block";
        let htmlList = "";
        Object.keys(failedDomainsArray).forEach( (failedDomainsKey) => {
            htmlList += `<li class="has-margin-bottom-7"> ✖ Fetching failed for: <br> &emsp;&ensp; ${failedDomainsKey.substring(1)} </li>`;
        });
        document.querySelector("#domains-errors-body").innerHTML = htmlList;
    }

};

// function to inject the status and nodes
const serversTabs = [];
const updateTable = (monit, nodeName, nodeId) => {

    if (document.querySelector("#_" + nodeId + "-services") == null) {
        // in body
        // TODO: rename var
        const myElement = document.createElement("section");
        myElement.id = nodeId;
        myElement.classList.add("hero-body");
        if( settings.settingsJson.cycle.fullHeight){
            myElement.classList.add("service-section");
        }
        document.querySelector("#main-content").appendChild(myElement);
        myElement.innerHTML = `
        <div id="_${nodeId}-section"  class="container is-fluid">
            <h1 class="title">${nodeName}</h1>
            <h2 class="subtitle">Last Update: <strong id="_${nodeId}-updateon"
                            class="last-update" data-updated-on="${(new Date()).getTime()}"></strong></h2>
            <div id="_${nodeId}-services" class="columns is-multiline"></div>
        </div>`;

        // in tab
        // TODO: rename var
        const myElement2 = document.createElement("button");
        myElement.id =  "_" + nodeId + "-tab";
        serversTabs.push( "_" + nodeId + "-services"  );
        myElement2.onclick = () => {settings.scrollToCard( "_" + nodeId + "-services" );};
        myElement2.innerHTML = nodeName;
        myElement2.classList.add("button");
        myElement2.classList.add("is-light");
        document.querySelector("#servers-tabs").appendChild(myElement2);
    }

    document.querySelector("#_" + nodeId + "-services").innerHTML = "";
    let text;
    monit.service.forEach((service, serviceKey) => {

        // TODO: ?
        service.port ? "" : service.port = {
            port: ""
        };

        text = `

            <div class="column is-one-fifth is-flex">
            <div class="card ${ service.status === "0" ? " card-status-ok " : " card-status-failing "}">
                <header class="card-header" title="${service.name}">
                <h2 id="${ "_" + nodeId + "_" + serviceKey}" class="card-header-title ellipsis">

                ${service.name}
                </h2>
                </header>
                <div class="card-content">
                <div class="content columns is-flex is-centered">
                    <img
                    class="service-logo" src="/images/${
    service.port.protocol === "REDIS" ? "redis.png"
        : service.port.protocol === "PGSQL" ? "postgres.png"
            : service.port.protocol === "MYSQL" ? "mysql.png"
                // : service.port.protocol=== "nginx" ? "nginx.png"
                : service.port.protocol === "SSH" ? "ssh.png"
                    : (service.name === "stark" || service.name === "banshee") ? "ziwo.png"
                        : "unknown.png" }
                    "></img>
                </div>
                </div>
            </div>
            </div>

    `;

        document.querySelector("#_" + nodeId + "-services").innerHTML += text;
        if (service.port.protocol == "HTTP") {
            favIconStore("_" + nodeId + "_" + serviceKey, service.name);
        }

    });
    document.querySelector("#_" + nodeId + "-updateon")
        .setAttribute("data-updated-on", String((new Date()).getTime()));
};


// handle fav icon efficently
const imgIconStoreArray = {};
const imgIconBannedArray = [];
const favIconStore = (appendId, serviceName) => {

    if (imgIconStoreArray[serviceName]) {
        document.querySelector("#" + appendId).prepend(imgIconStoreArray[serviceName]);
    } else if (imgIconBannedArray.indexOf(serviceName) == -1) {
        const imgComponent = document.createElement("img");
        imgComponent.width = "16";
        imgComponent.height = "16";
        imgComponent.src = "https://" + serviceName + "/favicon.ico";
        imgComponent.classList.add("img" + appendId);
        imgComponent.onerror = (e) => {
            e.preventDefault();
            const failedImages = document.querySelectorAll(".img" + appendId);
            // TODO: do not iterate on an array when you delete its content
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

};

// update and put warning for the servers if last updated timedout
const checkLastUpdate =() => {

    const updateTimes = document.querySelectorAll(".last-update");

    for (const updateTime of Array.from(updateTimes)) {
        const updatedOn = new Date( Number(updateTime.getAttribute("data-updated-on")));
        updateTime.innerHTML = timeTools.showDiff( updatedOn, new Date() );
        if ((new Date() - updatedOn) < 20 * 1000) {
            updateTime.classList.remove("card-status-failing");
        } else {
            updateTime.classList.add("card-status-failing");
        }
    }

};

// cycle through the diffent nodes
let cardScrollerIndex = 0;
const cardScroller = () => {

    if( cardScrollerIndex >= serversTabs.length ){
        cardScrollerIndex = 0;
    }
    if(serversTabs.length !== 0) {
        settings.scrollToCard(serversTabs[cardScrollerIndex]);
        cardScrollerIndex++;
    }

};
