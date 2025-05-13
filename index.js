function setup() {
    let firstCard = null;
    let secondCard = null;
    let preventClick = false;
    let clicks = 0;
    let pairsMatched = 0;
    const totalPairs = $(".card").length / 2; // Always 3 pairs with 6 cards
    let timeLeft;
    let timerInterval;
    let difficulty = "easy"; // Default difficulty

    function setDifficulty(level) {
        difficulty = level;
        switch (difficulty) {
            case "easy":
                timeLeft = 60; // Longer time for easy
                break;
            case "medium":
                timeLeft = 45; // Medium time
                break;
            case "hard":
                timeLeft = 30; // Shorter time for hard
                break;
        }
        // Update the timer display immediately
        $("#timer").text(timeLeft);
    }

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
        clearInterval(timerInterval); // Clear any existing timer
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
        preventClick = true; // Disable further card flips
        $(".card").off("mouseenter"); // Disable hover effect
        $("#play_again_button").show(); // Show the play again button
        if (win) {
            displayMessage("You Win! Matched all pairs.");
        } else {
            displayMessage("Game Over! Time ran out.");
        }
    }

    function resetGame() {
        clearInterval(timerInterval);
        clicks = 0;
        pairsMatched = 0;
        firstCard = null;
        secondCard = null;
        preventClick = false;

        // Reset the cards
        $(".card").removeClass("flip matched").off("mouseenter").on("mouseenter", cardHoverHandler);
        // You might need to re-randomize card images here for a truly new game

        // Set difficulty based on the selected option
        const selectedDifficulty = $("#difficulty").val();
        setDifficulty(selectedDifficulty);

        // Update the status display
        $("#clicks").text(clicks);
        $("#pairs_matched").text(pairsMatched);
        $("#pairs_left").text(totalPairs - pairsMatched);
        $("#timer").text(timeLeft); // Update time in case it changed
        $("#message").slideUp(200);
        $("#play_again_button").hide();
        startTimer();
    }

    const cardHoverHandler = function() {
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
                    if (pairsMatched === totalPairs) {
                        clearInterval(timerInterval);
                        endGame(true); // Winning condition
                    }
                }, 1000);
            } else {
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
    };

    // Initial setup based on default difficulty
    setDifficulty(difficulty);
    $(".card").on("mouseenter", cardHoverHandler);
    $("#play_again_button").on("click", resetGame).hide(); // Hide initially

    // Event listener for difficulty change
    $("#difficulty").on("change", function() {
        resetGame(); // Reset the game when difficulty changes
    });
}

$(document).ready(setup);