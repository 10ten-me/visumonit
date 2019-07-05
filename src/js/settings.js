
let settingsJson;
refreshDomainSettingsList(); //init settings

function  openSettings() {

    document.querySelector("#settings-modal").classList.add("is-active");
    refreshDomainSettingsList();

}

const defaultConfig = JSON.stringify({
    domainsArray: [],
    cycle: {
        autostart: false,
        fullHeight: false,
        interval: 3000,
    }
});
function refreshDomainSettingsList(){

    if ( window.localStorage.getItem("ten-monit") == null ) {
        window.localStorage.setItem("ten-monit", defaultConfig);
    }
    try {
        settingsJson = JSON.parse(window.localStorage.getItem("ten-monit"));
        let text = "";
        if(!settingsJson.cycle){
            settingsJson.cycle ={}
        }
        document.querySelector("#cycle_autostart").checked = settingsJson.cycle.autostart || false;
        document.querySelector("#cycle_fullHeight").checked = settingsJson.cycle.fullHeight || false;
        document.querySelector("#cycle_interval").value = (settingsJson.cycle.interval || 3000) / 1000;
        for ( const domain of settingsJson.domainsArray){
            text += `


            <div class="columns">

            <div class="column is-10">

              <div class="field-body">
                <p class="control field is-expanded">
                    <input class="input" type="text" value="${ domain.url }" disabled>
                </p>
              </div>

              ${ ( domain.user || domain.pass) ? `
              
              <div class="field-body has-margin-top-7">
              <div class="field">
                <p class="control is-expanded">
                  <input class="input" type="text" value="${ domain.user }" disabled>
                </p>
              </div>
              
              <div class="field">
                <p class="control is-expanded">
                    <input class="input" type="text" value="${ domain.pass }" disabled>
                </p>
                </div>
                </div>
            
              ` : ""}

              


            </div>

            <div class="column">
                    <p class="control"><a class="button is-danger" onclick="deleteDomainToSettings(\`${domain.url}\`)"> Delete</a></p>
            </div>

          </div>

            `;
        }
        document.querySelector("#settings-saved-domains").innerHTML = text;
        // console.log( settingsJson )
    } catch(e){
        console.error(e)
        window.localStorage.setItem("ten-monit", defaultConfig)
        settingsJson = JSON.parse(window.localStorage.getItem("ten-monit"));
        document.querySelector("#settings-saved-domains").innerHTML = "";
    }

    return JSON.parse(window.localStorage.getItem("ten-monit"));

}

function addDomainToSettings() {
    settingsJson.domainsArray.push( {
        url: document.querySelector("#new-domain-adder-url").value,
        user: document.querySelector("#new-domain-adder-user").value,
        pass: document.querySelector("#new-domain-adder-pass").value,
    } );
    document.querySelector("#new-domain-adder-url").value = "";
    document.querySelector("#new-domain-adder-user").value = "";
    document.querySelector("#new-domain-adder-pass").value = "";
    window.localStorage.setItem("ten-monit", JSON.stringify(settingsJson));
    refreshDomainSettingsList();
}

function addCycleSettings() {
    settingsJson.cycle = {
        autostart: document.querySelector("#cycle_autostart").checked,
        fullHeight: document.querySelector("#cycle_fullHeight").checked,
        interval: (document.querySelector("#cycle_interval").value|| 3) * 1000,
    };
    window.localStorage.setItem("ten-monit", JSON.stringify(settingsJson));
    refreshDomainSettingsList();
}

function deleteDomainToSettings(domainName) {

    settingsJson.domainsArray = settingsJson.domainsArray.filter(elm => elm.url !== domainName);
    window.localStorage.setItem("ten-monit", JSON.stringify(settingsJson));
    refreshDomainSettingsList();

}



function saveSettings() {
    const data = window.localStorage.getItem("ten-monit");
    const filename = "monit_dashboard_settings.json";
    let blob = new Blob([data], { type: "application/json" });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        var elem = window.document.createElement("a");
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}


function loadFileAsText(){
    var fileToLoad = document.getElementById("fileToLoad").files[0];
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
        var textFromFileLoaded = fileLoadedEvent.target.result;
        window.localStorage.setItem("ten-monit", textFromFileLoaded)
        refreshDomainSettingsList()
        // console.log( textFromFileLoaded )
        // document.getElementById("inputTextToSave").value = textFromFileLoaded;
    };

    fileReader.readAsText(fileToLoad, "UTF-8");
}

module.exports = {
    settingsJson,
    loadFileAsText,
    refreshDomainSettingsList,
    openSettings,
    addDomainToSettings,
    deleteDomainToSettings,
    saveSettings,
    scrollToCard,
    addCycleSettings
}

function scrollToCard( id ){
    const el = document.querySelector("#" + id);
    const elemenetPosition = Math.floor(el.getBoundingClientRect().top) + window.scrollY;
    window.scroll(0, elemenetPosition - 100 );
}