const jsConfetti = new JSConfetti();

let gameOver=false;

//getting the winning popup and replay button 
const popup = document.getElementsByClassName("win-popup")[0];
const replayButton = document.getElementById("replay");

//setting the score from session storage or 0 otherwise
let score = sessionStorage.getItem("gamesWon") || 0;
score = parseInt(score);

//displaying the score
const scoreText=document.getElementById("score");
scoreText.textContent="Score: " + score;

//getting the text displaying the number of guesses
const guessesText=document.getElementById("guesses");

document.addEventListener("DOMContentLoaded", () => {
    fetch('words.json')
    .then(response => response.json())
    .then(data => {

        //hiding the congratulations message when the user clicks replay after winning
        replayButton.addEventListener("click", () => {
            popup.classList.add("hidden");
        });

        //Retrieving the list of words
        const wordList = data.words;

        //Choosing a random word from the retrieved list
        const targetWord = wordList[Math.floor(Math.random() * wordList.length)];
        console.log("Today's word is:", targetWord);

        //Array to store the letters input from the user
        let guessedLetters=[];

        //Counter for number of guesses
        let numberOfGuesses=0;

        //Adding functionality for input from the physical keyboard
        document.addEventListener("keydown", (event) => {
            const key = event.key;
            if(gameOver===false){
                if(key==="Backspace"){
                    if(guessedLetters.length>0) deleteLetter();
                }
                else{
                    if(key==="Enter"){
                        if(guessedLetters.length===5){
                            checkWord();
                        }
                        else{
                            console.log("Sorry, your guess must contain 5 letters!");
                        }
                    }
                    else{
                        //checking if the key pressed is a letter 
                        if (/^[a-zA-Z]$/.test(key)) {
                            updateDisplay(key.toUpperCase());
                        }
                    }
                }
            }

        });

        //Adding functionality for input from the virtual keyboard
        const buttons= Array.from(document.getElementsByClassName("keyboard-button"));
        buttons.forEach((button) => {
            button.addEventListener("click", ()=> {
                if(gameOver===false){
                    if(button.dataset.key==="DELETE"){
                        //checking if there is any letter to delete
                        if(guessedLetters.length>0) deleteLetter();
                    }
                    else{
                        if(button.dataset.key==="ENTER"){
                            //checking if the length of the guessed word is 5
                            if(guessedLetters.length===5){
                                checkWord();
                            }
                            else{
                                console.log("Sorry, your guess must contain 5 letters!");
                            }
                        }
                        else{
                            //if the key pressed is not a special key, display it in the allocated slot
                            updateDisplay(button.dataset.key);
                        }
                    }
                }
            });
        });

        //Function to display the input letter from the virtual keyboard/keyboard 
        function updateDisplay(letter){
            const slots=Array.from(document.querySelectorAll(".letter p"));
            let emptySlot=slots.find(slot => slot.textContent.trim() === "");
            if(emptySlot){
                emptySlot.textContent=letter;
                guessedLetters.push(letter);
            }
        }

        //Function to delete the last letter
        function deleteLetter(){
            guessedLetters.pop();
            const slots=Array.from(document.querySelectorAll(".letter p"));
            let emptySlot=slots.find(slot => slot.textContent.trim() === "");
            let lastSlot=slots.indexOf(emptySlot);
            if(lastSlot===-1) slots[4].textContent="";
            else slots[lastSlot-1].textContent="";
            
        }

        //Function to add a guessed word to guesses history with hints
        function addGuessToHistory(guessedWord) {
            const guessHistoryList = document.querySelector(".guess-history ul");

            const listItem = document.createElement("li");
            const guessedRow = document.createElement("div");
            guessedRow.classList.add("word-guessed");

            const targetLetters = targetWord.toUpperCase().split('');
            const guessedLetters = guessedWord.toUpperCase().split('');

            // Keep track of which positions have already been marked as correct
            const matchedPositions = new Array(5).fill(false);
            const usedTargetPositions = new Array(5).fill(false);

            // First pass: check for correct-position (green)
            guessedLetters.forEach((letter, i) => {
                const letterDiv = document.createElement("div");
                letterDiv.classList.add("word-guess-letter");

                const letterP = document.createElement("p");
                letterP.textContent = letter;

                if (letter === targetLetters[i]) {
                    letterDiv.classList.add("correct-position");
                    matchedPositions[i] = true;
                    usedTargetPositions[i] = true;
                }

                letterDiv.appendChild(letterP);
                guessedRow.appendChild(letterDiv);
            });

            // Second pass: check for correct-letter (yellow)
            guessedLetters.forEach((letter, i) => {
                const letterDiv = guessedRow.children[i]; 

                // Skip if already correct-position
                if (matchedPositions[i]) return;

                // Look for the letter elsewhere in the target
                for (let j = 0; j < 5; j++) {
                    if (!usedTargetPositions[j] && letter === targetLetters[j]) {
                        letterDiv.classList.add("correct-letter");
                        usedTargetPositions[j] = true;
                        break;
                    }
                }
            });

            listItem.appendChild(guessedRow);
            guessHistoryList.appendChild(listItem);
        }


        //Function to check the word guessed by the user with the random word selected
        function checkWord(){

            //assembling the guessed word based on the input letters from each slot
            let guessedWord="";
            guessedLetters.forEach(letter => guessedWord=guessedWord+letter);

            //updating and displaying the number of guesses
            numberOfGuesses++;
            guessesText.textContent="Guesses: " + numberOfGuesses;

            if(guessedWord.toLowerCase()===targetWord.toLowerCase()){

                //increasing the score, updating it in sessionStorage & displaying it
                score++;
                sessionStorage.setItem("gamesWon", score);
                scoreText.textContent="Score: " + score;

                const winText=document.getElementById("win-text");
                if(numberOfGuesses===1){
                    winText.textContent="You guessed the word on your first try!";
                }
                else{
                    winText.textContent="You guessed the word in " + numberOfGuesses + " tries!";
                }

                jsConfetti.addConfetti({
                    emojis: ['✨', '💥', '🌸'], 
                });

                gameOver=true;
                popup.classList.remove("hidden");
            } 
            else{

                //adding the word to the guesses history
                addGuessToHistory(guessedWord);

                //emptying the letter slots for new inputs
                const slots=Array.from(document.querySelectorAll(".letter p"));
                slots.forEach(slot => slot.textContent="");

                //clearing the array for guessed letters
                guessedLetters=[];
            }
        }
    });
});


