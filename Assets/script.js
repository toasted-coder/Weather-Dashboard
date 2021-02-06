var searchHistory = [];

function getItems() { // function to get stored search history
    var storedCities = JSON.parse(localStorage.getItem("searchHistory"));
    if (storedCities !== null) {
        searchHistory = storedCities;
    };

    for (i = 0; i < searchHistory.length; i++) {
        if (i == 8) {break;}
        
        cityListButton = $("<a>").attr({ // makes the search history list items turn into buttton/links
            class: "list-group-item list-group-item-action",
            href: "#"
        });

        cityListButton.text(searchHistory[i]);
        $(".list-group").append(cityListButton);
    }
};

var city;
var currentDay = $(".card-body");

getItems(); // runs the previously established function

function getData() { // function for the current day info display
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=2ab902a0fe313d71d91734e79f858556"
    currentDay.empty();
    $("#weeklyForecast").empty();
    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        
        var date = moment().format(" MM/DD/YYYY");
        var iconCode = response.weather[0].icon;
        var iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png";
        var name = $("<h3>").html(city + date);
        
        currentDay.prepend(name);
        currentDay.append($("<img>").attr("src", iconURL));

        // math to round to whole number
        var temp = Math.round((response.main.temp - 273.15) * 1.80 + 32);
        currentDay.append($("<p>").html("Temperature: " + temp + " &#8457"));

        var humidity = response.main.humidity;
        currentDay.append($("<p>").html("Humidity: " + humidity));

        var windSpeed = response.wind.speed;
        currentDay.append($("<p>").html("Wind Speed: " + windSpeed));
        
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        // APIcall for UV index based off the above lat and lon variables
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/uvi?appid=2ab902a0fe313d71d91734e79f858556&lat=" + lat + "&lon=" + lon,
            method: "GET"
        }).then(function (response) { // function for displaying the UV index value onto the currentDay
            currentDay.append($("<p>").html("UV Index: <span>" + response.value + "</span>"));
            // 
            if (response.value <= 2) {
                $("span").attr("class", "btn btn-outline-success");
            };
            if (response.value > 2 && response.value <= 5) {
                $("span").attr("class", "btn btn-outline-warning");
            };
            if (response.value > 5) {
                $("span").attr("class", "btn btn-outline-danger");
            };
        })
        // APIcall for the 5day forecast
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=2ab902a0fe313d71d91734e79f858556",
            method: "GET"
        }).then(function (response) { //function for displaying the 5day forecast
            for (i = 0; i < 5; i++) { 
                var fiveDayCard = $("<div>").attr("class", "col fiveDay bg-info text-white rounded-lg p-2");
                $("#5DayForecast").append(fiveDayCard);

                var fiveDayDates = new Date(response.list[i * 8].dt * 1000);
                fiveDayCard.append($("<h4>").fiveDayDates.toLocaleDateString());

                // brings back the icon url suffix
                var iconCode = response.list[i * 8].weather[0].icon;

                // builds the icon URL, then appends it to be displayed
                var iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png";
                fiveDayCard.append($("<img>").attr("src", iconURL));

                // converts K and removes decimals using Math.round, then appends it to be displayed
                var temp = Math.round((response.list[i * 8].main.temp - 273.15) * 1.80 + 32);
                fiveDayCard.append($("<p>").html("Temp: " + temp + " &#8457"));

                // var created for humidity from response, then appends it to be displayed
                var humidity = response.list[i * 8].main.humidity;
                fiveDayCard.append($("<p>").html("Humidity: " + humidity));
            }
        })
    })
};
// searches and adds to search history list
$("#searchCity").click(function() {
    city = $("#city").val();
    getData();
    var checkArray = searchHistory.includes(city);
    if (checkArray == true) {
        return
    }
    else {
        searchHistory.push(city);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        var cityListButton = $("<a>").attr({
            class: "list-group-item list-group-item-action",
            href: "#"
        });
        cityListButton.text(city);
        $(".list-group").append(cityListButton);
    };
});
// listens for action on the history buttons
$(".list-group-item").click(function() {
    city = $(this).text();
    getData();
});