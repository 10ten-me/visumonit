
let parser = new X2JS();

function refreshStatus() {

    let domainsList = refreshDomainSettingsList().domainsArray;
    for (const domain of domainsList) {
        
        let options = {};
        if ( domain.user != "" && domain.pass != "" ) {
            options.headers = new Headers({
                "Authorization": "Basic " + btoa(domain.user + ":" + domain.pass),
            });
        }

        fetch(domain.url, options)
            .then(response => response.text())
            .then(xmlString => parser.xml_str2json(xmlString).monit)
            .then(function (data) {
                // console.log(data)
                updateTable(data, data.server.localhostname, data.server.id);
            });
    }

    // let xmlString = `<?xml version="1.0" encoding="ISO-8859-1"?><monit><server><id>58bb2cdf15c31d25690d419224cd6257</id><incarnation>1560364775</incarnation><version>5.20.0</version><uptime>1100092</uptime><poll>120</poll><startdelay>0</startdelay><localhostname>souqalmal-pg</localhostname><controlfile>/etc/monit/monitrc</controlfile><httpd><address>localhost</address><port>2812</port><ssl>0</ssl></httpd></server><platform><name>Linux</name><release>4.9.0-9-amd64</release><version>#1 SMP Debian 4.9.168-1+deb9u2 (2019-05-13)</version><machine>x86_64</machine><cpu>8</cpu><memory>24693884</memory><swap>0</swap></platform><service type="5"><name>souqalmal-pg</name><collected_sec>1561464866</collected_sec><collected_usec>732369</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><system><load><avg01>0.39</avg01><avg05>0.50</avg05><avg15>0.47</avg15></load><cpu><user>3.6</user><system>1.2</system><wait>0.0</wait></cpu><memory><percent>11.7</percent><kilobyte>2889040</kilobyte></memory><swap><percent>0.0</percent><kilobyte>0</kilobyte></swap></system></service><service type="4"><name>pgsql</name><collected_sec>1561464866</collected_sec><collected_usec>735337</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>5432</portnumber><request><![CDATA[]]></request><protocol>PGSQL</protocol><type>TCP</type><responsetime>0.002949</responsetime></port></service><service type="4"><name>redis</name><collected_sec>1561464866</collected_sec><collected_usec>735815</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>6379</portnumber><request><![CDATA[]]></request><protocol>REDIS</protocol><type>TCP</type><responsetime>0.000469</responsetime></port></service><service type="4"><name>banshee</name><collected_sec>1561464866</collected_sec><collected_usec>736472</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>8021</portnumber><request><![CDATA[]]></request><protocol>DEFAULT</protocol><type>TCP</type><responsetime>0.000650</responsetime></port></service><service type="4"><name>ssh</name><collected_sec>1561464866</collected_sec><collected_usec>749087</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>22</portnumber><request><![CDATA[]]></request><protocol>SSH</protocol><type>TCP</type><responsetime>0.012593</responsetime></port></service><service type="4"><name>nginx</name><collected_sec>1561464866</collected_sec><collected_usec>749589</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>18080</portnumber><request><![CDATA[/nginx_status]]></request><protocol>HTTP</protocol><type>TCP</type><responsetime>0.000493</responsetime></port></service><service type="4"><name>stark</name><collected_sec>1561464866</collected_sec><collected_usec>756162</collected_usec><status>404</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>7000</portnumber><request><![CDATA[/monitor/status]]></request><protocol>HTTP</protocol><type>TCP</type><responsetime>0.006559</responsetime></port></service></monit>`
    // data = parser.xml_str2json(xmlString).monit
    // updateTable(data, data.server.localhostname )
}

function updateTable(monit, nodeName, nodeId) {
    if (document.querySelector("#_" + nodeId + "-services") == null) {
        var myElement = document.createElement("section");
        myElement.id = nodeId;
        myElement.classList.add("hero-body");
        document.querySelector("#main-content").appendChild(myElement);
        myElement.innerHTML = `
        <div class="container is-fluid">
            <h1 class="title">${nodeName}</h1>
            <h2 class="subtitle">Last Update it on: <strong id="_${nodeId}-updateon" 
                            class="last-update">${new Date()}</strong></h2>
            <div id="_${nodeId}-services" class="columns is-multiline"></div>
        </div>
        `
    }

    document.querySelector("#_" + nodeId + "-services").innerHTML = "";
    let text;
    monit.service.forEach( function (service, serviceKey) {

        service.port ?  "" : service.port = {
            port: ""
        };

        text = `

            <div class="column  is-2 is-flex">
            <div class="card ${ service.status === "0" ? ` card-status-ok ` : ` card-status-failing `}">
                <header class="card-header" title="${service.name}">
                <h2 id="${ "_" + nodeId + "_" +serviceKey}" class="card-header-title ellipsis">

                ${service.name}
                </h2>
                </header>
                <div class="card-content">
                <div class="content columns is-centered">
                    <img width="100" height="100"
                    class="service-logo column is-9" src="/images/${
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
        if (service.port.protocol == "HTTP"){
            favIconStore( "_" + nodeId + "_" +serviceKey, service.name )
        }

    });
    document.querySelector("#_" + nodeId + "-updateon").innerHTML = new Date();
}

// let xmlString = `<?xml version="1.0" encoding="ISO-8859-1"?><monit><server><id>58bb2cdf15c31d25690d419224cd6257</id><incarnation>1560364775</incarnation><version>5.20.0</version><uptime>1100092</uptime><poll>120</poll><startdelay>0</startdelay><localhostname>souqalmal-pg</localhostname><controlfile>/etc/monit/monitrc</controlfile><httpd><address>localhost</address><port>2812</port><ssl>0</ssl></httpd></server><platform><name>Linux</name><release>4.9.0-9-amd64</release><version>#1 SMP Debian 4.9.168-1+deb9u2 (2019-05-13)</version><machine>x86_64</machine><cpu>8</cpu><memory>24693884</memory><swap>0</swap></platform><service type="5"><name>souqalmal-pg</name><collected_sec>1561464866</collected_sec><collected_usec>732369</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><system><load><avg01>0.39</avg01><avg05>0.50</avg05><avg15>0.47</avg15></load><cpu><user>3.6</user><system>1.2</system><wait>0.0</wait></cpu><memory><percent>11.7</percent><kilobyte>2889040</kilobyte></memory><swap><percent>0.0</percent><kilobyte>0</kilobyte></swap></system></service><service type="4"><name>pgsql</name><collected_sec>1561464866</collected_sec><collected_usec>735337</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>5432</portnumber><request><![CDATA[]]></request><protocol>PGSQL</protocol><type>TCP</type><responsetime>0.002949</responsetime></port></service><service type="4"><name>redis</name><collected_sec>1561464866</collected_sec><collected_usec>735815</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>6379</portnumber><request><![CDATA[]]></request><protocol>REDIS</protocol><type>TCP</type><responsetime>0.000469</responsetime></port></service><service type="4"><name>banshee</name><collected_sec>1561464866</collected_sec><collected_usec>736472</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>8021</portnumber><request><![CDATA[]]></request><protocol>DEFAULT</protocol><type>TCP</type><responsetime>0.000650</responsetime></port></service><service type="4"><name>ssh</name><collected_sec>1561464866</collected_sec><collected_usec>749087</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>22</portnumber><request><![CDATA[]]></request><protocol>SSH</protocol><type>TCP</type><responsetime>0.012593</responsetime></port></service><service type="4"><name>nginx</name><collected_sec>1561464866</collected_sec><collected_usec>749589</collected_usec><status>0</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>18080</portnumber><request><![CDATA[/nginx_status]]></request><protocol>HTTP</protocol><type>TCP</type><responsetime>0.000493</responsetime></port></service><service type="4"><name>stark</name><collected_sec>1561464866</collected_sec><collected_usec>756162</collected_usec><status>404</status><status_hint>0</status_hint><monitor>1</monitor><monitormode>0</monitormode><onreboot>0</onreboot><pendingaction>0</pendingaction><port><hostname>127.0.0.1</hostname><portnumber>7000</portnumber><request><![CDATA[/monitor/status]]></request><protocol>HTTP</protocol><type>TCP</type><responsetime>0.006559</responsetime></port></service></monit>`

let imgIconStoreArray = {};
let imgIconBannedArray = [];
function favIconStore( appendId, serviceName ){
    if( imgIconStoreArray[serviceName] ){
        document.querySelector("#" + appendId).prepend( imgIconStoreArray[serviceName] );

    } else if ( imgIconBannedArray.indexOf(serviceName) == -1 ) {

        let imgComponent = document.createElement("img");
        imgComponent.width = "16";
        imgComponent.height = "16";
        imgComponent.src = "http://" + serviceName + "/favicon.ico";
        imgComponent.classList.add("img" + appendId)
        imgComponent.onerror = function (e) {
            let failedImages = document.querySelectorAll(".img" + appendId)
            for (let i = 0; i < failedImages.length; ++i) {
                failedImages[i].remove();
              }
            // remove from imgIconStoreArray
            delete imgIconStoreArray[serviceName];
            // Add to banned list
            imgIconBannedArray.push(serviceName);
        };
        imgIconStoreArray[serviceName] = imgComponent;
        document.querySelector("#" + appendId).prepend( imgIconStoreArray[serviceName] );


    }
}


window.onload = function () {

    refreshStatus()
    setInterval(refreshStatus, 3000)

    checkLastUpdate()
    setInterval(checkLastUpdate, 500)
}

function checkLastUpdate() {

    let updateTimes = document.querySelectorAll('.last-update');

    for (let updateTime of Array.from(updateTimes)) {
        if ((new Date() - new Date(updateTime.innerHTML)) < 20 * 1000) {
            updateTime.classList.remove("card-status-failing")
        } else {
            updateTime.classList.add("card-status-failing")
        }
    }
}

