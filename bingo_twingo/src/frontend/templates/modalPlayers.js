import { app } from '../index.js';
import { debug, clearModal } from '../js/core/core';
import '../css/modalPlayers.css';
import {setupBackgroundVideo} from '../utils/background';

export const modalPlayers = () => {

    const controllers = () => {
        setupBackgroundVideo();
        let playersNames = JSON.parse(localStorage.getItem('playersNames')) || [];
        // setupBackgroundVideo();
        clearModal("gameLayout") //clear the game

        // Draw the players in localStorage. Each time you add or delete a player, this function is called.
        function renderPlayerList() {
            playersNames = JSON.parse(localStorage.getItem('playersNames')) || [];
            let uList = document.getElementById("listPlayers");
            // Delete all palyers before drawing them again
            uList.innerHTML = '';
            // Draw all current players
            playersNames.forEach((name, index) => {
                let li = document.createElement('li');
                li.setAttribute("id", "player_" + name);
                li.innerHTML = `<div><span class='players'>${index + 1}</span><p>${name}</p></div><span class="removePlayer">&times;</span>`;
                li.addEventListener('click', (event) => {
                    let name = li.id.replace('player_', '');
                    playersNames = playersNames.filter((item) => item != name);
                    localStorage.setItem('playersNames', JSON.stringify(playersNames));
                    renderPlayerList();
                })
                uList.appendChild(li);
            });
            document.getElementById('remainingPlayersSpan').innerHTML = "Players: "+playersNames.length + "/50 "; // At the moment the max players are static
        }

        /*
        * First add the current players in localstorage. Then, if you hit the
        * add player button you can add more. You can also delete them
        * by clicking in their names
        */
        let addButton = document.getElementById('addplayer');

        renderPlayerList();

        let checkName = (name) => {
            let regEx = /[aA1-zZ9]/;
            if (regEx.test(name)) {
                return true;
            } else {
                return false;
            }
        }
        addButton.onclick = function () {
            let playerName = document.getElementById("fname").value;
            if (playerName) { //If input name is empty
                if (!playersNames.includes(playerName)) { //If name is repeated
                    if (checkName(playerName)) { //If name is not allowed
                        if (window.localStorage) { //Check if the navigator supports localstorage
                            document.getElementById('msg--err').innerHTML = "";
                            playersNames.push(document.getElementById("fname").value);
                            localStorage.setItem('playersNames', JSON.stringify(playersNames));
                            document.getElementById("fname").value = null;
                            renderPlayerList(); //Render players list again
                        }
                    } else document.getElementById('msg--err').innerHTML = "\u26A0  Name not allowed!"
                } else document.getElementById('msg--err').innerHTML = "\u26A0  You cannot introduce repeated names!"
            } else document.getElementById('msg--err').innerHTML = "\u26A0  Enter the player's name!"
        }


        
        /**
         * Add player on press enter key
         */
        document.getElementById("fname").addEventListener("keyup", function (event) { //Add player pressing enter in input
            if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById("addplayer").click();
            }
        });
      
        /**
         * Here you have the set interval  time options
         */
        let inputVal = document.querySelector('#spinner__value');
        let btnUp = document.querySelector('#spinner__up');
        let btnDown = document.querySelector('#spinner__down');

        btnUp.onclick = function () {
            let value = parseFloat(inputVal.value);
            if (value < 5.0) inputVal.value = (value + parseFloat(0.1)).toFixed(1);
        };

        btnDown.onclick = function () {
            let value = parseFloat(inputVal.value);
            if (value > 0.1) inputVal.value = (value - parseFloat(0.1)).toFixed(1);
        };

        inputVal.addEventListener('change', (event) => {
            if (event.target.value <= 0) event.target.value = 0.1;
            if (event.target.value > 5) event.target.value = 5;
        });
       
     
        
        // let div_bg = document.getElementById('div_bg');

        /**
         * On click play Button, game starts.
         */
        
        let playBtn = document.getElementById('playBtn');
        playBtn.onclick = function () {
            if (playersNames.length !== 0 && playersNames != undefined) { //Check there are players added to the game
                let m = document.getElementById('playersForm');
                m.style.display = "none";
                clearModal('bg')
                // div_bg.remove();
                app.speed = (parseFloat(inputVal.value) * 1000); //SET GAME SPEED
                app.start();
            } else {
                document.getElementById('msg--err').innerHTML = "\u26A0  Add some players first!"
            }

        }


        /**
        * Export Players in csv.
        */

        let exportBtn = document.getElementById('export');
        exportBtn.addEventListener('click', function() {    
            let players = JSON.parse(localStorage.getItem("playersNames")).map(e => e);
            if (players.length != 0) {
                let csvContent = "data:text/csv;charset=utf-8," 
                + players;
                let encodedUri = encodeURI(csvContent);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "players.csv");
                document.body.appendChild(link);

                link.click();
            } else {
                document.getElementById('msg--err').innerHTML = "\u26A0  Add a user before exporting"
            }
        });

        /**
        * Import PLayers in LocalStorage
        */

        let importBtn = document.getElementById('import');
        importBtn.addEventListener('click', function() {    
            let link = document.getElementById('import-file');             
            link.click();
        });

        let input_file = document.getElementById('import-file');
        input_file.addEventListener('change', function (event) {
            var files = event.target.files;
            if (files[0].type == "text/csv") {
                let reader = new FileReader;
                reader.readAsText(files[0]);
                reader.onload = function(e) {
                    localStorage.setItem("playersNames",JSON.stringify(reader.result.split(',')));
                    renderPlayerList();
                    input_file.value = "";
                };
                document.getElementById('msg--err').innerHTML = "";
            } else {
                document.getElementById('msg--err').innerHTML = "\u26A0  The file isn't valid"
            }
          }, false);
    }

    return {
        template:
            `
            <div id="playersForm" class="modal">
                <!-- Modal content -->
                <div class="modal-content">
                    <h1>BINGO TWINGO</h1>
                    <p></p>
                    <div class='modal__players__list'>
                        <ol id="listPlayers"></ol>
                    </div>
                    <div class="menu__addPlayer">
                        <input type="text" id="fname" name="fname" placeholder="Player name">                                               
                        <i class="far fa-plus-square menu__addPlayer__btn" id='addplayer'></i>
                    </div>
                    <p class="msg--error" id="msg--err"></p>
                    <div class="menu__options">
                        <button id='playBtn' class="menu__start_btn">START GAME</button>
                    </div>
                    <div class="spinner__opts" style="margin-left:10px">
                        <span> Timer: (sec)</span>
                        <div class="spinner">
                            <button type="button" id="spinner__down" class="spinner__btn spinner__down">&lsaquo;</button>
                            <input type="number" id="spinner__value" class="spinner__value" name="time" id="match_time" min="0.1" max="5" step="0.1" value="1">
                            <button type="button" id="spinner__up" class="spinner__btn spinner__up">&rsaquo;</button>
                        </div>    
                    </div>
                    <span class="remainingPlayers" id="remainingPlayersSpan"></span>
                </div>
                <div class="modal-content-export">
                    <h3>Game settings</h3>
                    <button id="export" class="button">Export Players</button>
                    <button id="import" class="button">Import Players</button>
                    <input type="file" id="import-file" style="display:none"/>
                </div>
            </div>`,
        controllers: controllers
    }
}