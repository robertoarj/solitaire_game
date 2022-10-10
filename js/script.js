let deck = [],
    timer = 0,
    timerCounter = 0,
    moves = 0;

function startGame(){
    closeModal();
    createDeck();
    putCardsInFields();
    putCarsInThePile();
    addRemainingEvents();
    setMoves("clear");
    startTimer();
}

function createDeck() {
    let suits = ["spades", "clubs", "hearts", "diamonds"];

    // if game is restarting, remove all current cards
    document.querySelectorAll(".card").forEach( card => card.remove());
    
    // iterates between suits and generates 13 cards for each
    suits.forEach(cardSuit => {
        
        for (let cardValue = 1; cardValue <= 13; cardValue++){   
            
            let cardElm = document.createElement("div");
            cardElm.className = "card " + cardSuit;
            cardElm.setAttribute("id", cardSuit + cardValue);
            cardElm.setAttribute("data-value", cardValue);
            cardElm.setAttribute("data-suit", cardSuit);
            cardElm.setAttribute("data-display", getDisplayValue(cardValue));
            cardElm.setAttribute("data-color", (cardSuit == "spades" || cardSuit == "clubs") ? "black" : "red");
            deck.push(cardElm);
        }
    });

    deck = shuffleArray(deck);

    function getDisplayValue(value){
        switch(value){
            case 1: return "A"; break;
            case 11: return "J"; break;
            case 12: return "Q"; break;
            case 13: return "K"; break;
            default: return value;
        }
    }

    function shuffleArray(array) {
        let currentIndex = array.length,  randomIndex;
        
        while (currentIndex != 0) {
        
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
        
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
}

function putCardsInFields() {
    const mainFields = document.querySelectorAll(".main-field");

    for (let indexField = 0; indexField < mainFields.length; indexField++){
        
        // put the amount of cards according to the order of its field. Ex.: 1st field = 1 card; 2nd field = 2 cards; (n)th field = n cards
        for (let indexCard = 0; indexCard < indexField + 1; indexCard++){
            
            let field = mainFields[indexField];
            
            // uses the first position of deck[] and then removes it to get a new card in the next iteration
            let card = deck[0];
            deck.shift();
            
            // activate only the last card of field
            if (indexCard == indexField)
                activateCard(card);

            field.appendChild(card);
        }
    }
}

function putCarsInThePile(){
    const pileField = document.getElementById("pile");
    const backToPileHandler = document.getElementById("back-to-pile");

    deck.forEach(cardElm => {
        cardElm.addEventListener("click", showPileCard, true);
        pileField.appendChild(cardElm);
    });

    // deck[] was fully consumed and it's no longer necessary 
    deck.length = 0;

    // Adds a handler to back cards to the pill
    backToPileHandler.addEventListener("click", backToPile);

    function backToPile(){
        const refusedCards = document.querySelectorAll("#refuse .card");

        if (refusedCards.length > 0){
            // Puts the cards on the pile in reverse order
            for (let i = (refusedCards.length - 1); i >= 0; i--){
                inactivateCard(refusedCards[i]);
                pileField.append(refusedCards[i]);
            }

            setMoves("add");
        }
    }

}

function dragCard(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function dropCard(e) {

    const mainFieldsContainer = document.getElementById("main-fields-container");
    const supFieldsContainer = document.getElementById("sup-fields-container");
    
    const draggingCard = document.getElementById( e.dataTransfer.getData('text/plain') );
    const droppingElm = e.target;
    const draggingCardParent = draggingCard.parentElement;
    
    if (!droppingElm.contains(draggingCard) && droppingElm.childElementCount == 0){

        // if the target is a card, else is a field
        if (droppingElm.classList.contains("card")){

            const droppingCard = droppingElm;

            // if droppingCard belongs to main fields, they must be in descending order and have different suits
            if (mainFieldsContainer.contains(droppingCard) &&
                Number(draggingCard.getAttribute("data-value")) == (Number(droppingCard.getAttribute("data-value")) - 1 ) &&
                draggingCard.getAttribute("data-color") != droppingCard.getAttribute("data-color")){

                    appendDraggingCard();
            }
            // if droppingCard belongs to sup fields, they must be in ascending order and have the same suit
            if (supFieldsContainer.contains(droppingCard) &&
                Number(draggingCard.getAttribute("data-value")) == (Number(droppingCard.getAttribute("data-value")) + 1 ) &&
                draggingCard.getAttribute("data-suit") == droppingCard.getAttribute("data-suit")){
                    
                    appendDraggingCard();
                    
                    // Checks if all cards are in the supFiels
                    if (document.querySelectorAll("#sup-fields-container .card").length == 52)
                        endGame();
            }
        }
        else {

            const cardValueRequired = droppingElm.classList.contains("main-field") ? "13" : "1";
            if (draggingCard.getAttribute("data-value") == cardValueRequired)
                appendDraggingCard();
        }

        function appendDraggingCard(){
            droppingElm.appendChild(draggingCard);
            activateRemainingCard(draggingCardParent);
            draggingCard.removeEventListener("click", showPileCard, true);
            setMoves("add");
        }
    }
}

function activateCard(cardElm, noDelay){
    cardElm.setAttribute("draggable", "true");
    cardElm.addEventListener("dragstart", dragCard);
    
    window.setTimeout(() => {
        cardElm.classList.add("active");
    }, noDelay ? 0 : 200);

}   

function inactivateCard(cardElm){
    cardElm.removeAttribute("draggable");
    cardElm.removeEventListener("dragstart", dragCard);
    cardElm.classList.remove("active");
}

function activateRemainingCard(draggingElmParent){
    if (draggingElmParent.classList.contains("main-field") && draggingElmParent.childElementCount > 0){
        activateCard(draggingElmParent.lastElementChild);
    }
}

function showPileCard(e){
    const refuseField = document.getElementById("refuse");
    const cardElm = e.target;

    // animate from #pile to #refuse with css transition
    cardElm.classList.add("moving");
    
    // sets a delay equal to the transition time
    window.setTimeout(() => {
        refuseField.appendChild(cardElm);
        cardElm.classList.remove("moving");
    }, 200);
    activateCard(cardElm, true);

}

function addRemainingEvents(){
    
    const fields = document.querySelectorAll(".main-field, .sup-field");
    fields.forEach(field => {
        field.addEventListener("drop", dropCard);
        
        // required for drop functionality
        field.addEventListener("dragover", e => {
            e.preventDefault();
        });
    });
}

function startTimer(){
    const timerElm = document.getElementById("timer");
    timerCounter = 0;
    timerElm.innerText = "00:00";
    timer = setInterval(function() {
        timerCounter++;
        let minutes = Math.floor((timerCounter / 60));
        let seconds = Math.floor((timerCounter % 60));
        timerElm.innerText = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    }, 1000);
}

function setMoves(action){
    const movesElm = document.getElementById("moves");
    if (action == "clear")
        moves = 0;
    else
        moves++;
    movesElm.innerText = (moves < 10) ? "0" + moves : moves;
}

function endGame(){
    showModal("you-win", function(){

        let minutes = Math.floor((timerCounter / 60));
        let seconds = Math.floor((timerCounter % 60));

        document.getElementById("time-modal").innerText = minutes + "m" + seconds + "s";
        document.getElementById("moves-modal").innerText = moves;
    });
    window.clearInterval(timer);
}

const modal = document.getElementById("modal");
const welcomeMsg = document.getElementById("welcome");
const youWinMsg = document.getElementById("you-win");

function showModal(messageElmId, callback){
    let messageElm = document.getElementById(messageElmId);

    modal.removeAttribute("style");
    messageElm.removeAttribute("style");
    
    window.setTimeout(() => {
        messageElm.classList.add("visible");
    }, 100);

    if (callback && callback instanceof Function) callback();
}

function closeModal(){
    modal.style.display = "none";
    
    const messageElm = document.querySelectorAll("#modal .content");
    messageElm.forEach( elm => {
        elm.style.display = "none";
        elm.classList.remove("visible");
    });
};

showModal("welcome");