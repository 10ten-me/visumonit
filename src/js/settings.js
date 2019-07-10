
let settingsJson;

// default config incase of corrupt settings or missing settings
const defaultConfig = JSON.stringify({
    domainsArray: [],
    cycle: {
        autostart: false,
        fullHeight: false,
        interval: 3000,
    }
});

// open the modal for settings
const openSettings = () => {
    
    document.querySelector("#settings-modal").classList.add("is-active");

};

// load configs to the settings
const refreshDomainSettingsList = () => {

    if ( window.localStorage.getItem("ten-monit") == null ) {
        window.localStorage.setItem("ten-monit", defaultConfig);
    }
    try {
        settingsJson = JSON.parse(window.localStorage.getItem("ten-monit"));
        // remove add websites links
        if( settingsJson.domainsArray.length > 0){
            document.querySelector("#no-servers").style.display = "none";
        }
        let text = "";
        if(!settingsJson.cycle){
            settingsJson.cycle ={};
        }
        document.querySelector("#cycle_autostart").checked = settingsJson.cycle.autostart || false;
        document.querySelector("#cycle_fullHeight").checked = settingsJson.cycle.fullHeight || false;
        document.querySelector("#cycle_interval").value = (settingsJson.cycle.interval || 3000) / 1000;
        for ( const domain of settingsJson.domainsArray){
            text += `

            <div class="columns">

            <div class="column is-10">

            ${ ( domain.nickName ) ? `
            <div class="field-body has-margin-bottom-7">
                <p class="control field is-expanded">
                  <input class="input" type="text" value="${ domain.nickName }" disabled>
                </p>
              </div>
            `: ""}

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
                    <p class="control"><a class="button is-danger" onclick="settings.deleteDomainToSettings(\`${domain.url}\`)"> Delete</a></p>
            </div>

          </div>

            `;
        }
        document.querySelector("#settings-saved-domains").innerHTML = text;

    } catch(e){

        console.error(e);
        window.localStorage.setItem("ten-monit", defaultConfig);
        settingsJson = JSON.parse(window.localStorage.getItem("ten-monit"));
        document.querySelector("#settings-saved-domains").innerHTML = "";

    }

    return JSON.parse(window.localStorage.getItem("ten-monit"));

};
refreshDomainSettingsList(); //init settings

// add domain to the settings
const addDomainToSettings = (e) => {

    e.preventDefault();
    settingsJson.domainsArray.push( {
        url: document.querySelector("#new-domain-adder-url").value,
        user: document.querySelector("#new-domain-adder-user").value,
        pass: document.querySelector("#new-domain-adder-pass").value,
        nickName: document.querySelector("#new-domain-adder-nickname").value,
    } );
    document.querySelector("#new-domain-adder-url").value = "";
    document.querySelector("#new-domain-adder-user").value = "";
    document.querySelector("#new-domain-adder-pass").value = "";
    document.querySelector("#new-domain-adder-nickname").value = "";
    window.localStorage.setItem("ten-monit", JSON.stringify(settingsJson));
    refreshDomainSettingsList();
    return false;

};

// update settings for the cyle
const addCycleSettings = () => {

    settingsJson.cycle = {
        autostart: document.querySelector("#cycle_autostart").checked,
        fullHeight: document.querySelector("#cycle_fullHeight").checked,
        interval: ((
            document.querySelector("#cycle_interval").value > 0 ?
                document.querySelector("#cycle_interval").value
                : 3
        ) * 1000),
    };
    window.localStorage.setItem("ten-monit", JSON.stringify(settingsJson));
    refreshDomainSettingsList();

};

// remove a domain from settings
const deleteDomainToSettings = (domainName) => {

    settingsJson.domainsArray = settingsJson.domainsArray.filter(elm => elm.url !== domainName);
    window.localStorage.setItem("ten-monit", JSON.stringify(settingsJson));
    refreshDomainSettingsList();

};

// used to exports to .json config file
const saveSettings = () => {

    const data = window.localStorage.getItem("ten-monit");
    const filename = "monit_dashboard_settings.json";
    const blob = new Blob([data], { type: "application/json" });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        const elem = window.document.createElement("a");
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }

};

// used to load settings from config file
const loadFileAsText = () => {

    const fileToLoad = document.getElementById("fileToLoad").files[0];
    const fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
        const textFromFileLoaded = fileLoadedEvent.target.result;
        window.localStorage.setItem("ten-monit", textFromFileLoaded);
        refreshDomainSettingsList();

    };
    fileReader.readAsText(fileToLoad, "UTF-8");
    document.getElementById("fileToLoad").value = "";

};

// scroll to cards id
const scrollToCard = ( id ) => {
    const el = document.querySelector("#" + id);
    const elemenetPosition = Math.floor(el.getBoundingClientRect().top) + window.scrollY;
    window.scroll(0, elemenetPosition - 150 );
};

export  {
    settingsJson,
    loadFileAsText,
    refreshDomainSettingsList,
    openSettings,
    addDomainToSettings,
    deleteDomainToSettings,
    saveSettings,
    scrollToCard,
    addCycleSettings
};
