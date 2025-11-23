let coins = [];
const base_url = "/static/euro_coin_game/";

function create_coin_notes() {
    // Fills #coins and #notes divs with the corresponding images and onclick functions
    let coins_html = "";
    let notes_html = "";

    for (const coin of ["0001", "0002", "0005", "0010", "0020", "0050", "0100", "0200"]) {
        coins_html += '<img src="' + base_url + coin + '.jpg" onclick="javascript:add_coin(\'' +
            coin + '\')" width="80px" height="80px">';

        document.getElementById("coins").innerHTML = coins_html;
    }
    for (const note of ["0500", "1000", "2000", "5000", "10000", "20000", "50000"]) {
        notes_html += '<img src="' + base_url + note + '.jpg" onclick="javascript:add_coin(\'' +
            note + '\')" width="160px" height="' + Math.round(160 * (62 / 120)) + 'px">';
        document.getElementById("notes").innerHTML = notes_html;
    }
}

function refresh_plot() {
    let coins_html = "";
    coins.forEach(function (coin) {
        coins_html += "<img src='" + base_url + coin + ".jpg' width='100'>";
    });
    document.getElementById("coin_canvas").innerHTML = coins_html;
}

function add_coin(coin) {
    console.log(coin);
    coins.push(coin);
    refresh_plot();
}

function pop_coins() {
    coins.pop();
    refresh_plot();
}

function reset_coins(reset_target = true) {
    coins = [];
    if (reset_target) {
        coin_range = document.getElementById("select_coin_range").value.split(";");
        let min = coin_range[0];
        let max = coin_range[1];    // In euros
        console.log("Val es " + String(coin_range));
        console.log("Min es " + String(min));
        console.log("Max es " + String(max));
        random_number = Math.max(Math.random() * (max - min) + min, min);
        document.getElementById("target_coins").value = Number(random_number).toFixed(2) + "€";
    }
    refresh_plot();
}

function check_coins() {
    let sum = 0;
    coins.forEach(function (coin) {
        sum += parseInt(coin) / 100;
    });
    target_value = document.getElementById("target_coins").value;
    console.log("La suma es " + String(sum) + "€ y el objetivo era: " + String(target_value));

    const modalEl = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const myModal = new bootstrap.Modal(modalEl);

    if (target_value == Number(sum).toFixed(2) + "€") {
        modalTitle.textContent = window.translations.veryWell;
        modalBody.textContent = window.translations.correctMoney;
        myModal.show();

        // Reset coins after modal is closed (optional, or keep existing behavior)
        modalEl.addEventListener('hidden.bs.modal', function () {
            reset_coins();
        }, { once: true });
    } else {
        modalTitle.textContent = window.translations.ops;
        modalBody.textContent = window.translations.tryAgain;
        myModal.show();
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    reset_coins();
});

