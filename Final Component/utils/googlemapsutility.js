function success() {
    var pos = {
        lat: 42.1,
        lng: -74.1
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos.lat = position.coords.latitude;
            pos.lng = position.coords.longitude;
            var directionsRenderer = new google.maps.DirectionsRenderer;
            var directionsService = new google.maps.DirectionsService;
            var map = new google.maps.Map(document.getElementById('map'), {
                gestureHandling: 'cooperative'
            });
            directionsRenderer.setMap(map);
            directionsRenderer.setPanel(document.getElementById('right-panel'));

            var control = document.getElementById('floating-panel');
            control.style.display = 'block';
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
            calculateAndDisplayRoute(directionsService, directionsRenderer, pos);
            document.getElementById('mode').addEventListener('change', function () {
                calculateAndDisplayRoute(directionsService, directionsRenderer, pos);
            });

        });
    }

};

//detemining and displaying the route
function calculateAndDisplayRoute(directionsService, directionsRenderer, pos) {
    var selectedMode = document.getElementById('mode').value;
    directionsService.route({
        origin: pos,
        destination: '<%=destinationAddress%>',
        travelMode: google.maps.TravelMode[selectedMode]
    }, function (response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            window.alert('No directions found for this destination');
        }
    });
}
