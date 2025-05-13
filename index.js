

function setup() {
    let firstCard = null;
    let secondCard = null;
    let preventClick = false;
    let clicks = 0;
    let pairsMatched = 0;
    const totalPairs = $(".card").length / 2;
    let timeLeft = 30; // Initial time in seconds
    let timerInterval;

    // Initialize the status display
    $("#total_pairs").text(totalPairs);
    $("#pairs_left").text(totalPairs);
    updateClicks();
    updatePairsMatched();
    startTimer();

    function updateClicks() {
        $("#clicks").text(clicks);
    }

    function updatePairsMatched() {
        $("#pairs_matched").text(pairsMatched);
        $("#pairs_left").text(totalPairs - pairsMatched);
    }

    function displayMessage(message) {
        $("#message").text(message).slideDown(500).delay(3000).slideUp(500);
    }

    function startTimer() {
        $("#timer").text(timeLeft);
        timerInterval = setInterval(() => {
            timeLeft--;
            $("#timer").text(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame(false); // Game over due to time
            }
        }, 1000);
    }

    function endGame(win) {
        preventClick = true; 
        $(".card").off("mouseenter"); 
        if (win) {
            displayMessage("You Win! Matched all pairs.");
        } else {
            displayMessage("Game Over! Time ran out.");
        }
    }

    $(".card").on("mouseenter", function() {
        if (preventClick || $(this).hasClass("flip")) {
            return;
        }

        $(this).toggleClass("flip");
        clicks++;
        updateClicks();

        const currentCard = $(this).find(".front_face")[0];

        if (!firstCard) {
            firstCard = currentCard;
        } else if (!secondCard && currentCard !== firstCard) {
            secondCard = currentCard;
            preventClick = true;
                // When two pairs are the same 
            if (firstCard.src === secondCard.src) {
                setTimeout(() => {
                    $(`#${firstCard.id}`).parent().off("mouseenter").addClass("matched");
                    $(`#${secondCard.id}`).parent().off("mouseenter").addClass("matched");
                    firstCard = null;
                    secondCard = null;
                    preventClick = false;
                    pairsMatched++;
                    updatePairsMatched();
                    console.log("Match!");
                    // Winning condition when matched pairs equal total pairs
                    if (pairsMatched === totalPairs) {
                        clearInterval(timerInterval);
                        endGame(true); 
                    }
                }, 1000);
            } else {
              // when two pairs are different
                setTimeout(() => {
                    $(`#${firstCard.id}`).parent().toggleClass("flip");
                    $(`#${secondCard.id}`).parent().toggleClass("flip");
                    firstCard = null;
                    secondCard = null;
                    preventClick = false;
                    console.log("No match!");
                }, 1500);
            }
        } else if (currentCard === firstCard) {
            // User hovered over the first card again, do nothing
        }
    });
}

$(document).ready(setup);