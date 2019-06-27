
let settingsJson;

function  openSettings() {

    document.querySelector("#settings-modal").classList.add("is-active");
    refreshDomainSettingsList();

}

function refreshDomainSettingsList(){

    if ( window.localStorage.getItem("ten-monit") == null ) {
        window.localStorage.setItem("ten-monit", `{"domainsArray":[]}`);
    }
    try {
        settingsJson = JSON.parse(window.localStorage.getItem("ten-monit"));
        let text = "";
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
        console.log(e)
        window.localStorage.setItem("ten-monit", `{"domainsArray":[]}`)
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

function deleteDomainToSettings(domainName) {

    settingsJson.domainsArray = settingsJson.domainsArray.filter(elm => elm.url !== domainName);
    window.localStorage.setItem("ten-monit", JSON.stringify(settingsJson));
    refreshDomainSettingsList();

}
