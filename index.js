function setup() {
    let firstCard = null;
    let secondCard = null;
    let preventClick = false;
    let clicks = 0;
    let pairsMatched = 0;
    let totalPairs = 15; // Always 15 pairs with 30 cards now
    let timeLeft;
    let timerInterval;
    let difficulty = "easy"; // Default difficulty
    let gameStarted = false; 

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

    // Fetch 15 random Pokémon and return 30 shuffled card images
    async function fetchPokemonCards() {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1500");
        const data = await response.json();
        const allPokemon = data.results;

        // Pick 15 unique random Pokémon
        const selectedPokemon = [];
        while (selectedPokemon.length < 15) {
            const randIndex = Math.floor(Math.random() * allPokemon.length);
            const pokemon = allPokemon[randIndex];
            if (!selectedPokemon.some(p => p.name === pokemon.name)) {
                selectedPokemon.push(pokemon);
            }
        }

        // Fetch their sprite images
        const imageUrls = await Promise.all(selectedPokemon.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            const pokeData = await res.json();
            return pokeData.sprites.front_default; // Use front image
        }));

        // Duplicate for pairs
        const allImages = [...imageUrls, ...imageUrls];

        // Shuffle
        for (let i = allImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
        }

        return allImages;
    }

    // Creates a card element's HTML
    function createCardHTML(imageUrl, index) {
        return `
        <div class="card">
            <img id="img${index}" class="front_face" src="${imageUrl}" alt="pokemon">
            <img class="back_face" src="back.webp" alt="card back">
        </div>
        `;
    }

    // Build the grid with random Pokémon cards
    async function initializeCards() {
        const images = await fetchPokemonCards();
        const gameGrid = $("#game_grid");
        gameGrid.empty();

        images.forEach((img, index) => {
            gameGrid.append(createCardHTML(img, index));
        });

        // Re-bind event listeners for the new cards
        $(".card").removeClass("flip matched").off("mouseenter").on("mouseenter", cardHoverHandler);
    }

    async function resetGame() {
        clearInterval(timerInterval);
        clicks = 0;
        pairsMatched = 0;
        firstCard = null;
        secondCard = null;
        preventClick = false;

        await initializeCards(); // Dynamically build 30 randomized cards

        // Set difficulty based on the selected option
        const selectedDifficulty = $("#difficulty").val();
        setDifficulty(selectedDifficulty);

        // Update the status display
        $("#clicks").text(clicks);
        $("#pairs_matched").text(pairsMatched);
        $("#pairs_left").text(totalPairs - pairsMatched);
        $("#total_pairs").text(totalPairs);
        $("#timer").text(timeLeft); // Update time in case it changed
        $("#message").slideUp(200);
        $("#play_again_button").hide();
        if (gameStarted) { // Only start the timer if the game has started
            startTimer();
        }
            // Resetting power ups when the user starts a new game
        $("#power_reveal").prop("disabled", false);
        $("#power_time").prop("disabled", false);

    }

    const cardHoverHandler = function() {
        if (!gameStarted || preventClick || $(this).hasClass("flip")) { // Check if game started
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
            // If the cards are a match
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
            console.log("Nothing happened");        }
    };

    // Initial setup based on default difficulty
    setDifficulty(difficulty);
    $("#play_again_button").on("click", resetGame).hide(); // Hide initially

    // Event listener for difficulty change
    $("#difficulty").on("change", function() {
        resetGame(); // Reset the game when difficulty changes
    });

    // Start Game button event listener
    $("#start_button").on("click", async function() {
        gameStarted = true;
        await resetGame(); // Load cards when game starts
        $(".card").on("mouseenter", cardHoverHandler); // Enable card interaction
        startTimer(); // Start the timer
        $(this).hide(); // Hide the start button
    });

    // Power up which reveals all cards for three seconds
    $("#power_reveal").on("click", function () {
    if (!gameStarted) return;

    $(".card").addClass("flip"); // Flip all cards

    setTimeout(() => {
        $(".card").each(function () {
            if (!$(this).hasClass("matched")) {
                $(this).removeClass("flip");
            }
        });
    }, 3000);

    $(this).prop("disabled", true); 

    // Power up that adds 15 seconds to the timer
    $("#power_time").on("click", function () {
    if (!gameStarted) return;

    timeLeft += 15;
    $("#timer").text(timeLeft);
    displayMessage("+15 seconds added!");
    $(this).prop("disabled", true); 
});

});

}

$(document).ready(setup);
