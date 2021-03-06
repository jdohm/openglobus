'use strict';
function show(IdeaID) {
      /*---------------------------------|
      | get Infos for Idea from server   |
      |---------------------------------*/
        var xhttp = new XMLHttpRequest();
        var self = this;
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var obj = JSON.parse(this.responseText);


                var ulogin = this.getResponseHeader("login");
                if (ulogin == "false") {
                    document.getElementById("id_vote").innerHTML = LoginRegister;
                    document.getElementById("up-btn").style.opacity = "0.4";
                    document.getElementById("up-btn").onclick = function () {SideLoginRegister.showLogin();};
                    document.getElementById("down-btn").style.opacity = "0.4";
                    document.getElementById("down-btn").onclick = function () {SideLoginRegister.showLogin();};
                }

                //cactus chat
                initComments({
                        node: document.getElementById("comment-section"),
                        defaultHomeserverUrl: "https://matrix.cactus.chat:8448",
                        serverName: "cactus.chat",
                        siteName: "openidea.io",
                        commentSectionId: "Idea#" + IdeaID
                    });
                //cactus chat end
                document.getElementById("id_title").innerHTML = obj.TITLE;
                document.getElementById("id_description").innerHTML = obj.DESCRIPTION;
                document.getElementById("id_tags").innerHTML = "<span>Topics: </span> ";
                obj.tags.forEach((dat) => {document.getElementById("id_tags").innerHTML += '<div class="og-tag-span">' + dat + '</div>';});
                document.getElementById("id_skills").innerHTML = "<span>Needed skills: </span> ";
                obj.skills.forEach((dat) => {document.getElementById("id_skills").innerHTML += '<div class="og-tag-span">' + dat + '</div> ';});
                document.getElementById("id_user").innerHTML = "<span>Idea by: </span> ";
                obj.user.forEach((dat) => {document.getElementById("id_user").innerHTML += '<div class="og-tag-span">' + dat + '</div> ';});
            }
        };
        xhttp.open("POST", "getIdea", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("IdeaID="+IdeaID);
        /*---------------------------------|
        | get Infos for Idea from server   |
        |---------------------------------*/
        var html =
            `
<div style="flex-grow: 0;">
    <H2 id="id_title" style="display: inline-block;"></H2>
    <img src="./media/share.svg" alt="Share idea!" id="share-btn" style="height:1.5em;float: right" onclick='
        navigator.clipboard.writeText("https://openidea.io/?Idea=" + ${IdeaID});
        alert("https://openidea.io/?Idea=" + ${IdeaID} + " is now in your clipboard, feel free to share");
        ' >
</div>
<div style="overflow-y: auto;flex-grow: 1;">
    <p id="id_description"></p>
    <div id="id_tags"></div>
    <div id="id_skills"></div>
    <div id="id_user"></div>
    <div id="comment-section"></div>
</div>
<div style="flex-grow: 0;">
    <H3 id="id_vote">Vote this idea</H3>
    <div style="display: flex;justify-content:center;">
        <img src="./media/up.svg" alt="Vote Up!" id="up-btn" style="max-height:15vh;max-width:49%;vertical-align: bottom;" onclick='
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+${IdeaID}+"&upvote=1");
            SidePanel.hide();
            '>
        <img src="./media/down.svg" id="down-btn" alt="Vote Down" style="max-height:15vh;max-width:49%;vertical-align: bottom;" onclick='
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+${IdeaID}+"&upvote=0");
            SidePanel.hide();
            '>
    </div>
    <input onclick="SideShowIdea.showSupport(${IdeaID})" style="width:33%; margin: 1% 1%;" type="button" value="Support request" class="oi-overlay-button" id="support-btn"/>
    <input style="width:65%;" onclick="SidePanel.hide()" id="close-btn" class="oi-side-button" type="button" value="Back"/>
</div>
    `;
    SidePanel.show(html);

    var LoginRegister = `
    <a href="#" id="btnLogin" class="oi-link" onclick="SideLoginRegister.showLogin();">Login</a>
    <span>or</span>
    <a href="#" id="btnRegister" class="oi-link" onclick="SideLoginRegister.showRegister();">Register</a>
    <span>to vote this idea</span>`;
};

export { show };

function showSupport(IdeaID){
        var html =
            `
<div style="flex-grow: 0;">
    <H2 id="id_title" style="display: inline-block;">Support Request</H2>
</div>
<div style="overflow-y: auto;flex-grow: 1;">
        <H2>Please describe your request</H2>
        <p>consider logging in, to provide us the option to contact you.</p>
        <textarea id="text" style="overflow:auto;" rows="6" cols="60" name="text" placeholder="report: reason \nupdated description: ... \nadd tag: ... \netc." required></textarea>
</div>
<div style="flex-grow: 0;">
    <input onclick="SideShowIdea.sendSupportRequest(${IdeaID})" id="support-btn" class="oi-side-button" type="button" value="Submit request"/>
    <input onclick="SidePanel.hide()" id="close-btn" class="oi-side-button" type="button" value="Cancel"/>
</div>
    `;
    SidePanel.show(html);
}

export { showSupport };

function sendSupportRequest(IdeaID){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
            // var obj = JSON.parse(this.responseText);
            // if(obj) {
            //     if(obj == "error") alert("error - are you still logged in?");
            //     else {
            //         myCreateIdea(lon,lat,obj,0);
            //         SidePanel.hide();
            //         }
            //     }
        }};
    var _testText = document.getElementById("text").value;
    xhttp.open("POST", "submitSupportRequest", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("text="+_testText+"&IdeaID="+IdeaID);
}

export { sendSupportRequest };
