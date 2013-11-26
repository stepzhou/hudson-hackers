var map = L.map('map').setView([40.78, -73.97], 12);

L.tileLayer('http://{s}.tile.cloudmade.com/' + cloudmade_key + '/997/256/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
      maxZoom: 18
}).addTo(map);
